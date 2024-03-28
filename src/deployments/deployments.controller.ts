import { HttpService } from '@nestjs/axios';
import { Body, Controller, Delete, Get, Param, Post, Req } from '@nestjs/common';
import { firstValueFrom, lastValueFrom } from 'rxjs';
import { DeploymentsService } from './deployments.service';
import { CreateDeploymentDto } from './dto/create-deployment.dto';
import { ManoService } from 'src/mano/mano.service';
import { DomainsService } from 'src/domains/domains.service';
import { v4 as uuidv4 } from 'uuid';

@Controller('deployments')
export class DeploymentsController {

    constructor(private domainService: DomainsService, private deploymentService: DeploymentsService) { }

    @Get()
    findAll(@Req() request: Request) {
        // this.sendReq()
        return this.deploymentService.getAllDeployment();
    }

    @Post()
    async createDeployment(@Body() body: [CreateDeploymentDto]) {
        const depId = uuidv4()
        const nsIds = []
        for (let d of body) {
            // it may be better to use rxjs to pipe all async together
            const domain = await this.domainService.findByName(d['domain'])
            if (domain) {
                const res = await this.deploymentService.sendNsDeploymentToSidecar(domain['url'], d['ns'])
                console.log(res.data)
                // nsIds.push({nsId: nsId.data, domainId: domain['id']})
                nsIds.push({nsId: res.data, domainName: domain['name'], domainUrl: domain['url']})
                // push nsId into array, and at the end of the loop insert all into database. then start the check ns ready service
            }
        }

        // const deployment = this.deploymentService.create(nsIds)
        const deployment = this.deploymentService.create({
            uuid: depId,
            nss: JSON.stringify(nsIds)
        })
        // run ns state check. eg. this.deploymentService.nsRelationInit or nsCheck and init
        // or the nsinit has function to check if ns is in ready state, as ns maybe in the middle of scaling, etc.
        // and return.
        // deployment.then(res => {
        //     this.deploymentService.sendDeploymentToAllSidecar(res)
        // })
        return 'done'
    }

    @Post('/relate/:deploymentId')
    async runNsRelateAction(@Param('deploymentId') id: string) {
        return this.deploymentService.runNsRelateAction(+id)
    }

    @Delete('/:id')
    async deleteDeployment(@Param('id') id: string) {
        return this.deploymentService.deleteDeployment(+id)
    }    

    @Post('/sync') 
    async syncDeployment(@Body() body){
        console.log('object received at sync function')
        console.log(body)
        return this.deploymentService.syncDeployment(body)
    }

    @Delete('/v2/all')
    deleteAllDeploymentV2() {
        return this.deploymentService.deleteAllDeploymentV2()
    } 

    @Delete('/v2/:uuid/:nsId')
    deleteDeploymentV2(@Param('uuid') uuid: string, @Param('nsId') nsId: string) {
        return this.deploymentService.deleteDeploymentV2(uuid, nsId)
    }
}
