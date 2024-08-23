import { Module } from '@nestjs/common';
import { UserRepository } from './repositories/userRepository';
import { PrismaService } from 'src/prisma/prisma.service';
import { UserInterestRepository } from './repositories/userInterestRepository';

@Module({
  providers: [UserRepository, UserInterestRepository, PrismaService],
  exports: [UserRepository, UserInterestRepository],
})
export class ProvidersModule {}
