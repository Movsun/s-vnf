import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from 'src/prisma.server';
import { Deployment } from '@prisma/client';
import { HttpService } from '@nestjs/axios';
import { catchError, firstValueFrom, map } from 'rxjs';
import { ManoService } from 'src/mano/mano.service';

@Injectable()
export class DeploymentsService {
    constructor(private prisma: PrismaService, private readonly httpService: HttpService, private manoService: ManoService) { }


    async getAllDeployment() {
        return this.prisma.deployment.findMany();
    }

    async sendNsDeploymentToSidecar(sidecarBaseUrl, nsData) {
        return firstValueFrom(this.httpService.post(sidecarBaseUrl + '/mano/deploy-ns', nsData, {
            headers: { "Content-Type": "application/json; charset=utf-8" }
        }).pipe(catchError((e) => {
            console.error(e)
            throw new UnauthorizedException()
        })))
    }

    async create(data) {
        console.log('run ns relate action in deployments.service.create function')
        return this.runNsRelateAction(data)
    }

    async runNsRelateAction(deploymentV2) {
        return this.checkAndExcuteRelateAction(deploymentV2)
    }

    async checkAndExcuteRelateAction(deploymentV2) {
        const nss = JSON.parse(deploymentV2['nss'])
        let isTimeout = false
        let i = 0
        for (let ns of nss) {
            i = 0
            while (true) {
                if (await this.isNsInRunningState(ns.domainUrl, ns['nsId'])) {
                    // console.log('break')
                    break
                }
                // sleep for 10 second
                await new Promise(resolve => setTimeout(resolve, 10000));
                i++
                if (i == 100) {
                    isTimeout = true
                    break
                }
            }
            if (isTimeout) break
        }
        if (!isTimeout) {
            return this.startRelateAction(deploymentV2)
        }
    }

    async isNsInRunningState(domainUrl, nsId) {
        const state = await firstValueFrom(this.httpService.get(domainUrl + '/mano/ns-operational-state/' + nsId, {
            headers: { "Content-Type": "application/json; charset=utf-8" }
        }).pipe(map(res => res.data)).pipe(catchError((e) => {
            console.error(e)
            throw new UnauthorizedException()
        })))
        return state == 'running';
    }

    async startRelateAction(deploymentV2) {
        console.log('all ns is ready, starting action')
        const nss = JSON.parse(deploymentV2.nss)
        const actionArray = []
        for (let [idx, ns] of nss.entries()) {
            ns.vduCount = await this.getNsVduCount(ns.nsId, ns.domainUrl)
            nss[idx].vduCount = ns.vduCount
            for (let i = 0; i < ns.vduCount; i++) {
                let actionId = await this.runInitFirstAction(ns.nsId, i, ns.domainUrl)
                actionArray.push({
                    actionId: actionId,
                    domainUrl: ns.domainUrl
                })
            }
        }

        console.log('check if all first action is completed')
        const completionStatus = await this.checkIfAllActionIsComplete(actionArray)
        if (completionStatus) {
            const actionArray2 = []
            console.log('first action completed, run second init action')
            const actionOutput = await this.getCombinedActionOutput(actionArray)
            for (let ns of nss) {
                for (let i = 0; i < ns.vduCount; i++) {
                    let actionId = await this.runInitSecondAction(ns.nsId, i, ns.domainUrl, actionOutput)
                    actionArray2.push({
                        actionId: actionId,
                        domainUrl: ns.domainUrl
                    })
                }
            }
        }
        // console.log('nss at the end of ns relate action')
        // console.log(nss)
        return await this.sendDeploymentToAllSidecar({
            uuid: deploymentV2['uuid'],
            nss: JSON.stringify(nss)
        })
        // return {
        //     uuid: deploymentV2['uuid'],
        //     nss: JSON.stringify(nss)
        // }
    }

    async getNsVduCount(nsId, domainUrl) {
        return firstValueFrom(this.httpService.get(domainUrl + '/mano/ns-vdu-count/' + nsId, {
            headers: { "Content-Type": "application/json; charset=utf-8" }
        }).pipe(map(res => res.data)).pipe(catchError((e) => {
            console.error(e)
            throw new UnauthorizedException()
        })))
    }

    async runInitFirstAction(nsId, vduIndex, domainUrl) {
        //todo read action primitive from vnfd file instead of hardcoding it
        const body = {
            "primitive": "ns-relate-init",
            "primitive_params": {},
            "member_vnf_index": "vnf",
            "vdu_id": "mgmtVM",
            "vdu_count_index": vduIndex
        }
        // "{\"primitive\":\"touch\",\"primitive_params\":{\"filename\":\"/home/ubuntu/test\"},\"member_vnf_index\":\"vnf\",\"vdu_id\":\"hackfest_basic_metrics-VM\"}",

        return this.sendRunAction(body, nsId, domainUrl)
    }

    // data: [{actionId: xx, domainUrl: xx}]
    async checkIfAllActionIsComplete(data) {
        let isTimeout = false
        let i = 0
        for (let d of data) {
            i = 0
            while (true) {
                // todo: modify to get action detail, combine it output, then return all the output for second action to run
                if ((await this.getOpStatus(d['actionId'], d['domainUrl'])) == 'COMPLETED') {
                    // console.log('break')
                    break
                }
                // sleep for 15 second
                await new Promise(resolve => setTimeout(resolve, 5000));
                i++
                if (i == 20) {
                    isTimeout = true
                    break
                }
            }
            if (isTimeout) break
        }
        return !isTimeout
    }

    async runInitSecondAction(nsId, vduIndex, domainUrl, nsData) {
        const body = {
            "primitive": "ns-relate-join",
            "primitive_params": {
                "ns-data": JSON.stringify(nsData)
            },
            "member_vnf_index": "vnf",
            "vdu_id": "mgmtVM",
            "vdu_count_index": vduIndex
        }
        return this.sendRunAction(body, nsId, domainUrl)
    }

    async getOpStatus(opId, domainUrl) {
        return firstValueFrom(this.httpService.get(domainUrl + '/mano/action/' + opId + '/status', {
            headers: { "Content-Type": "application/json; charset=utf-8" }
        }).pipe(map(res => res.data)).pipe(catchError((e) => {
            console.error(e)
            throw new UnauthorizedException()
        })))
    }

    async sendRunAction(actionBody, nsId, domainUrl) {
        return firstValueFrom(this.httpService.post(domainUrl + '/mano/' + nsId + '/action', actionBody, {
            headers: { "Content-Type": "application/json; charset=utf-8" }
        }).pipe(map(res => res.data)).pipe(catchError((e) => {
            console.error(e)
            throw new UnauthorizedException()
        })))
    }

    async getActionDetail(opId, domainUrl) {
        return firstValueFrom(this.httpService.get(domainUrl + '/mano/action/' + opId, {
            headers: { "Content-Type": "application/json; charset=utf-8" }
        }).pipe(map(res => res.data)).pipe(catchError((e) => {
            console.error(e)
            throw new UnauthorizedException()
        })))
    }

    async getCombinedActionOutput(actionArray) {
        const result = []
        for (let d of actionArray) {
            let res = await this.getActionDetail(d['actionId'], d['domainUrl'])
            result.push(JSON.parse(res['detailed-status']['output']))
        }
        return result
    }

    async deleteDeployment(deploymentId: number) {
        const depl = await this.prisma.deployment.findFirst({ where: { id: deploymentId }, include: { nss: { include: { domain: true } } } })
        if (depl) {
            for (let ns of depl.nss) {
                // console.log('deleting ns:')
                await firstValueFrom(this.httpService.delete(ns.domain['url'] + '/mano/' + ns.nsId, {
                    headers: { "Content-Type": "application/json; charset=utf-8" }
                }).pipe(map(res => res.data)).pipe(catchError((e) => {
                    console.error(e)
                    throw new UnauthorizedException()
                })))
            }
        }
        return this.prisma.deployment.delete({ where: { id: deploymentId } })
    }

    async sendDeploymentToAllSidecar(deploymentV2) {
        const nss = JSON.parse(deploymentV2.nss)
        // console.log('sending to all sidecar')
        // console.log(nss)
        for (let ns of nss) {
            await firstValueFrom(this.httpService.post(ns.domainUrl + '/deployments/sync', {
                uuid: deploymentV2.uuid, nss: nss
            }, {
                headers: { "Content-Type": "application/json; charset=utf-8" }
            }))
        }
    }

    async syncDeployment(deploymentV2) {
        // console.log('insert indo deploymentV2 table')
        // console.log(deploymentV2)
        return this.prisma.deploymentV2.upsert({
            where: {
                uuid: deploymentV2.uuid
            }, update: { nss: JSON.stringify(deploymentV2.nss) }, create: {
                uuid: deploymentV2.uuid, nss: JSON.stringify(deploymentV2.nss)
            }
        })
    }

    async deleteAllDeploymentV2() {
        const depls = await this.prisma.deploymentV2.findMany()
        for (let d of depls) {
            const nss = JSON.parse(d.nss)
            for (let ns of nss) {
                await firstValueFrom(this.httpService.delete(ns.domainUrl + '/deployments/v2/' + d.uuid + '/' + ns.nsId, {
                    headers: { "Content-Type": "application/json; charset=utf-8" }
                }))
            }
        }
        return 'done'
    }

    async deleteDeploymentV2(uuid, nsId) {
        console.log('delete deployment')
        console.log('uuid', uuid)
        console.log('nsId', nsId)
        try {
            await this.manoService.deleteNs(nsId) 
            await this.prisma.deploymentV2.delete({ where: { uuid: uuid } })
        } catch (error) {
            console.log(error)        
        }
        // todo: send ns delete command to osm with nsId as argument
        return 'done'
    }
}