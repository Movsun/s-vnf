import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { DomainsService } from './domains.service';
import { CreateDomainDto } from './dto/create-domain.dto';
import { UpdateDomainDto } from './dto/update-domain.dto';

@Controller('domains')
export class DomainsController {
  constructor(private readonly domainsService: DomainsService) {}

  @Post()
  create(@Body() createDomainDto: CreateDomainDto) {
    console.log(createDomainDto)
    return this.domainsService.createDomain(createDomainDto);
  }

  @Get()
  findAll() {
    return this.domainsService.domains({});
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.domainsService.domain({id: +id});
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateDomainDto: UpdateDomainDto) {
    return this.domainsService.updateDomain({where: {id: +id}, data: updateDomainDto});
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.domainsService.deleteDomain({id: +id});
  }

  @Get(':id/nsd-and-vim')
  getAllNsdAndVim(@Param('id') id: string) {
    return this.domainsService.getNsdAndVim(+id)
  }

  @Post('set-self-domain')
  configureSelfDomain(@Body() body) {
    // {name, url}
    console.log(body)
    return this.domainsService.setSeflDomain(body);
  }

  @Post('join')
  handleOtherDomainJoinRequest(@Body() body) {
    // {name, url}
    this.domainsService.createDomain(body)
    // return back all domains
    return this.domainsService.domains({});
  }

  @Post('send-join-request')
  sendJoinRequest(@Body() body) {
    // {name, url}
    return this.domainsService.sendJoinRequest(body)
  }
}
