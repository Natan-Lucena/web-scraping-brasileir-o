import { Module } from '@nestjs/common';
import { InfraModule } from './infra/infra.module';
import { ScheduleModule } from '@nestjs/schedule';
import { PrismaService } from './prisma/prisma.service';

@Module({
  imports: [InfraModule, ScheduleModule.forRoot()],
  providers: [PrismaService],
})
export class AppModule {}
