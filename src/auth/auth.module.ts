import { Module } from '@nestjs/common';
import { ProvidersModule } from 'src/providers/providers.modules';
import { signUpUserService } from './services/sign-UpService.service';
import { signUpController } from './controllers/sign-Up.Controller';
import { PrismaService } from 'src/prisma/prisma.service';
import { EncryptProviderModule } from 'src/encrypt-provider/encrypt-provider.modules';
import { BcryptProviderService } from 'src/encrypt-provider/bcryptProviderService';

@Module({
  imports: [ProvidersModule, EncryptProviderModule],
  providers: [signUpUserService, PrismaService, BcryptProviderService],
  controllers: [signUpController],
})
export class AuthModule {}
