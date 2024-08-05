import { Module } from '@nestjs/common';
import { SaveTeamDataService } from './services/save-team-data/save-team-data.service';
import { CheckTeamGameService } from './services/check-team-game/check-team-game.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { BullModule } from '@nestjs/bull';
import 'dotenv/config';

@Module({
  imports: [BullModule.registerQueue({ name: process.env.QUEUE_NAME })],
  providers: [CheckTeamGameService, SaveTeamDataService, PrismaService],
})
export class InfraModule {}
