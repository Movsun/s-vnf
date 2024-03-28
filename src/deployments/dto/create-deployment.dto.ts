import { CreateDeployNSDto } from "src/mano/dto/create-deploy-ns.dto"

export class CreateDeploymentDto {
    domain: string
    ns: CreateDeployNSDto
}