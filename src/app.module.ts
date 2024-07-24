import { Module } from '@nestjs/common';
import { InfraModule } from './infra/infra.module';
import { ScheduleModule } from '@nestjs/schedule';
import { PrismaService } from './prisma/prisma.service';
import 'dotenv/config';
import { BullModule } from '@nestjs/bull';

@Module({
  imports: [
    InfraModule,
    ScheduleModule.forRoot(),
    BullModule.forRoot({
      url: process.env.REDIS_URL,
      defaultJobOptions: {
        removeOnComplete: true,
        removeOnFail: 100,
        attempts: 3,
      },
    }),
  ],
  providers: [PrismaService],
})
export class AppModule {}
