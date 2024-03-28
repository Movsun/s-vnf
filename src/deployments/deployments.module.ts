import { Module } from '@nestjs/common';
import { DeploymentsController } from './deployments.controller';
import { HttpModule } from '@nestjs/axios';
import { DeploymentsService } from './deployments.service';
import { PrismaService } from 'src/prisma.server';
import { ManoService } from 'src/mano/mano.service';
import { DomainsService } from 'src/domains/domains.service';

@Module({
  imports: [HttpModule],
  controllers: [DeploymentsController],
  providers: [DeploymentsService, PrismaService, ManoService, DomainsService]
})
export class DeploymentsModule {}
