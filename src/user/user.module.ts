import { Module } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { UserUpdateService } from './services/userUpdate.service';
import { ProvidersModule } from 'src/providers/providers.modules';
import { UserUpadateController } from './controllers/userUpdateController';

@Module({
  imports: [ProvidersModule],
  providers: [UserUpdateService, PrismaService],
  controllers: [UserUpadateController],
})
export class UserModule {}
