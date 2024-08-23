import { Module } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { ProvidersModule } from 'src/providers/providers.modules';
import { JwtStrategy } from 'src/auth/strategies/jwt.strategy';
import { CreateUserInterestController } from './controllers/create-user-interest/createUserInterest.controller';
import { ListUserInterestController } from './controllers/list-user-interest/listUserInterest.controller';
import { DeleteUserInterestController } from './controllers/delete-user-interest/deleteUserInterest.controller';
import { CreateUserInterestService } from './services/create-user-interest/createUserInterest.service';
import { ListUserInterestService } from './services/list-user-interest/listUserInterest.service';
import { DeleteUserInterestService } from './services/delete-user-interest/deleteUserInterest.service';

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
