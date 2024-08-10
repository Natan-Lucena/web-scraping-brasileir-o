import { Module } from '@nestjs/common';
import { UserRepository } from './repositories/userRepository';
import { PrismaService } from 'src/prisma/prisma.service';

@Module({
  providers: [UserRepository, PrismaService],
  exports: [UserRepository],
})
export class ProvidersModule {}
