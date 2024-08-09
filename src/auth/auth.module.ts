import { Module } from '@nestjs/common';
import { ProvidersModule } from 'src/providers/providers.modules';
import { signInUserService } from './services/sign-InService.service';
import { singInController } from './controllers/sign-In.Controller';
import { PrismaService } from 'src/prisma/prisma.service';

@Module({
  imports: [ProvidersModule],
  providers: [signInUserService, PrismaService],
  controllers: [singInController],
})
export class AuthModule {}
