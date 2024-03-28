import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { ManoService } from './mano.service';
import { CreateDeployNSDto } from './dto/create-deploy-ns.dto';
// import { CreateManoDto } from './dto/create-mano.dto';
// import { UpdateManoDto } from './dto/update-mano.dto';

@Controller('mano')
export class ManoController {
  constructor(private readonly manoService: ManoService) {}

  @Get('credential')
  getCredential() {
    return this.manoService.getCredential()
  }

  @Post('credential')
  updateCredential(@Body() body) {
    console.log(body)
    return this.manoService.updateCredential(body)
  }

  @Post('deploy-ns')
  deployNs(@Body() body: CreateDeployNSDto) {
    return this.manoService.deployNs(body)
  }

  @Get('ns-operational-state/:nsId')
  getNsOperationalState(@Param('nsId') nsId: string) {
    return this.manoService.getNsOperationalState(nsId);
  }

  @Get('ns-vdu-count/:nsId')
  getNsVduCount(@Param('nsId') nsId: string) {
    return this.manoService.getNsVduCount(nsId);
  }

  @Post(':nsId/action')
  runAction(@Param('nsId')nsId: string, @Body() body) {
    return this.manoService.runNsAction(nsId, body)    
  }

  @Get('action/:actionId')
  getActionDetail(@Param('actionId') actionId: string) {
    return this.manoService.getActionDetail(actionId)
  }

  @Get('action/:actionId/status')
  getOperationState(@Param('actionId') actionId: string) {
    return this.manoService.getOperationStatus(actionId)
  }

  @Delete(':nsId')
  deleteNs(@Param('nsId') nsId: string) {
    return this.manoService.deleteNs(nsId)
  }

  @Get('nsd-and-vim')
  getAllNsdAndVim() {
    return this.manoService.getAllNsdAndVim()
  }

  // @Post()
  // create(@Body() createManoDto: CreateManoDto) {
  //   return this.manoService.create(createManoDto);
  // }

  // @Get()
  // findAll() {
  //   return this.manoService.findAll();
  // }

  // @Get(':id')
  // findOne(@Param('id') id: string) {
  //   return this.manoService.findOne(+id);
  // }

  // @Patch(':id')
  // update(@Param('id') id: string, @Body() updateManoDto: UpdateManoDto) {
  //   return this.manoService.update(+id, updateManoDto);
  // }

  // @Delete(':id')
  // remove(@Param('id') id: string) {
  //   return this.manoService.remove(+id);
  // }
  
}
