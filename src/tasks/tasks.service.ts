import { HttpService } from '@nestjs/axios';
import { Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { catchError, firstValueFrom, map } from 'rxjs';
import { DeploymentsService } from 'src/deployments/deployments.service';
import { ManoService } from 'src/mano/mano.service';
import { PrismaService } from 'src/prisma.server';

@Injectable()
export class TasksService {
    private readonly logger = new Logger(TasksService.name);
    private prisma = new PrismaService();
    private httpServ = new HttpService();
    private manoServ = new ManoService(this.prisma, this.httpServ);
    private deploymentService = new DeploymentsService(this.prisma, this.httpServ, this.manoServ);

    @Cron(CronExpression.EVERY_10_SECONDS)
    handleCron() {
        this.logger.debug('Called every 10 seconds');
        this.runNsScalingCheckV2()
    }

    // async runScalingCheck() {
    //     const depls = await this.prisma.deployment.findMany({include: {nss: {include: {domain: true}}}})
    //     if (depls) {
    //         for (let d of depls) {
    //             for (let ns of d.nss) {
    //                 const vduCount = await this.getVduCount(ns.domain.url, ns.nsId)
    //                 if (vduCount != ns.vduCount) {
    //                     console.log('scaling detected')
    //                     await this.prisma.nS.update({where: {id: ns.id}, data: {vduCount: vduCount}})
    //                     return this.triggerNsRelateAction(d.id)
    //                 }
    //             }
    //         }
    //     }
    // }

    async getVduCount(domainUrl, nsId) {
        return this.deploymentService.getNsVduCount(nsId, domainUrl)
    }

    // async triggerNsRelateAction(deploymentId) {
    //     return this.deploymentService.runNsRelateAction(deploymentId)
    // }

    async runNsScalingCheckV2() {
        const depls = await this.prisma.deploymentV2.findMany()
        const selfDomain = await this.prisma.domain.findFirst({
            where: {
                is_self: true
            }
        })
        if (depls) {
            for (let d of depls) {
                const nss = JSON.parse(d.nss)
                for (let [idx, ns] of nss.entries()) {
                    if (selfDomain && selfDomain['url'] == ns.domainUrl) {
                        try {
                            const vduCount = await this.getVduCount(ns.domainUrl, ns.nsId)
                            if (vduCount != ns.vduCount) {
                                console.log('scaling detected')
                                // await this.prisma.nS.update({where: {id: ns.id}, data: {vduCount: vduCount}})
                                nss[idx].vduCount = vduCount
                                await this.prisma.deploymentV2.update({
                                    where: { uuid: d.uuid }, data: {
                                        nss: JSON.stringify(nss)
                                    }
                                })
                                return this.triggerNsRelateActionV2(d)
                            }
                        } catch (error) {
                            console.log('error in task scheduler get vdu count action')
                            console.log(error)
                        }
                    }
                }
            }
        }
    }

    async triggerNsRelateActionV2(deploymentV2) {
        return this.deploymentService.runNsRelateAction(deploymentV2)
    }
}
