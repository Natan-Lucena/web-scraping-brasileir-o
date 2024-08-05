import { Module } from '@nestjs/common';
import { UserCreateController } from './controllers/userCreate.Controller';
import { PrismaService } from 'src/prisma/prisma.service';
import { UserUpdateService } from './services/userUpdate.service';
import { UserCreateService } from './services/userCreate.service';
import { UserDeleteService } from './services/userDelete.service';
import { ProvidersModule } from 'src/providers/providers.modules';
import { UserUpadateController } from './controllers/userUpdateController';
import { UserDeleteController } from './controllers/userDelete.Controller';

@Module({
  imports: [ProvidersModule],
  providers: [
    UserUpdateService,
    UserCreateService,
    UserDeleteService,
    PrismaService,
  ],
  controllers: [
    UserCreateController,
    UserUpadateController,
    UserDeleteController,
  ],
})
export class UserModule {}
