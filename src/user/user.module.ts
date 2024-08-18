import { Module } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { ProvidersModule } from 'src/providers/providers.modules';
import { UserInterestController } from './controllers/userInterest.controller';
import { UserInterestService } from './services/userInterest.service';
import { JwtStrategy } from 'src/auth/strategies/jwt.strategy';

@Module({
  imports: [ProvidersModule],
  controllers: [UserInterestController],
  providers: [PrismaService, UserInterestService, JwtStrategy],
})
export class UserModule {}
