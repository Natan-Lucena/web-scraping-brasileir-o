import { Module } from '@nestjs/common';
import { ProvidersModule } from 'src/providers/providers.modules';
import { signUpUserService } from './services/sign-up/sign-Up.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { EncryptProviderModule } from 'src/encrypt-provider/encrypt-provider.modules';
import { BcryptProviderService } from 'src/encrypt-provider/bcryptProviderService';
import { SignTokenService } from './services/sign-token/sign-token.service';
import { JwtService } from '@nestjs/jwt';
import { SignInService } from './services/sign-in/sign-In.service';
import { signUpController } from './controllers/sign-up/sign-Up.Controller';
import { SignInController } from './controllers/sign-in/sign-In.Controller';

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
