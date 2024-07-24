import { Module } from '@nestjs/common';
import { SaveTeamDataService } from './services/save-team-data/save-team-data.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { BullModule } from '@nestjs/bull';
import 'dotenv/config';

@Module({
  imports: [BullModule.registerQueue({ name: process.env.QUEUE_NAME })],
  providers: [SaveTeamDataService, PrismaService],
})
export class InfraModule {}
