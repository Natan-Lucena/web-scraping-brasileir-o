import { Module } from '@nestjs/common';
import { SaveTeamDataService } from './services/save-team-data/save-team-data.service';
import { PrismaService } from 'src/prisma/prisma.service';

@Module({
  providers: [SaveTeamDataService, PrismaService],
})
export class InfraModule {}
