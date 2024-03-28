import { Module } from '@nestjs/common';
import { DomainsService } from './domains.service';
import { DomainsController } from './domains.controller';
import { PrismaService } from 'src/prisma.server';
import { HttpModule } from '@nestjs/axios';

@Module({
  imports: [HttpModule],
  controllers: [DomainsController],
  providers: [DomainsService, PrismaService],
})
export class DomainsModule {}
