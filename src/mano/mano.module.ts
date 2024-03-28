import { Module } from '@nestjs/common';
import { ManoService } from './mano.service';
import { ManoController } from './mano.controller';
import { PrismaService } from 'src/prisma.server';
import { OSMToken } from 'src/utils/OSMToken';
import { HttpModule } from '@nestjs/axios';

@Module({
  imports: [OSMToken, HttpModule],
  controllers: [ManoController],
  providers: [ManoService, PrismaService],
})
export class ManoModule {}
