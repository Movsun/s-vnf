import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ScheduleModule } from '@nestjs/schedule';
import { TasksModule } from './tasks/tasks.module';
import { DeploymentsModule } from './deployments/deployments.module';
import { DomainsModule } from './domains/domains.module';
import { ManoModule } from './mano/mano.module';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';

@Module({
  imports: [
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', 'public'), // Path to your public directory
      renderPath: '/home'
    }),
    ScheduleModule.forRoot(),
    TasksModule,
    DeploymentsModule,
    DomainsModule,
    ManoModule
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
