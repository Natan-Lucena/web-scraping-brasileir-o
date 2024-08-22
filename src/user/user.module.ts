import { Module } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { ProvidersModule } from 'src/providers/providers.modules';
import { JwtStrategy } from 'src/auth/strategies/jwt.strategy';
import { CreateUserInterestController } from './controllers/createUserInterest.controller';
import { ListUserInterestController } from './controllers/listUserInterest.controller';
import { DeleteUserInterestController } from './controllers/deleteUserInterest.controller';
import { CreateUserInterestService } from './services/createUserInterest.service';
import { ListUserInterestService } from './services/listUserInterest.service';
import { DeleteUserInterestService } from './services/deleteUserInterest.service';

@Module({
  imports: [ProvidersModule],
  controllers: [
    CreateUserInterestController,
    ListUserInterestController,
    DeleteUserInterestController,
  ],
  providers: [
    PrismaService,
    CreateUserInterestService,
    ListUserInterestService,
    DeleteUserInterestService,
    JwtStrategy,
  ],
})
export class UserModule {}
