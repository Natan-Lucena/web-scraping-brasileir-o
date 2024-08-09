import { Module } from '@nestjs/common';
import { ProvidersModule } from 'src/providers/providers.modules';
import { signInUserService } from './services/sign-InService.service';
import { singInController } from './controllers/sign-In.Controller';
import { PrismaService } from 'src/prisma/prisma.service';
import { EncryptProviderModule } from 'src/encrypt-provider/encrypt-provider.modules';
import { BcryptProviderService } from 'src/encrypt-provider/bcryptProviderService';

@Module({
  imports: [ProvidersModule, EncryptProviderModule],
  providers: [signInUserService, PrismaService, BcryptProviderService],
  controllers: [singInController],
})
export class AuthModule {}
