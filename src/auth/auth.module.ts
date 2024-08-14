import { Module } from '@nestjs/common';
import { ProvidersModule } from 'src/providers/providers.modules';
import { signUpUserService } from './services/sign-UpService.service';
import { signUpController } from './controllers/sign-Up.Controller';
import { PrismaService } from 'src/prisma/prisma.service';
import { EncryptProviderModule } from 'src/encrypt-provider/encrypt-provider.modules';
import { BcryptProviderService } from 'src/encrypt-provider/bcryptProviderService';
import { SignTokenService } from './services/sign-token/sign-token.service';
import { SignInService } from './services/sign-in/sign-in.service';
import { SignInController } from './controllers/sign-in/sign-in.controller';
import { JwtService } from '@nestjs/jwt';

@Module({
  imports: [ProvidersModule, EncryptProviderModule],
  providers: [
    JwtService,
    signUpUserService,
    PrismaService,
    BcryptProviderService,
    SignTokenService,
    SignInService,
  ],
  controllers: [signUpController, SignInController],
})
export class AuthModule {}
