import { Module } from '@nestjs/common';
import { BcryptProviderService } from './bcryptProviderService';

@Module({
  providers: [BcryptProviderService],
  exports: [BcryptProviderService],
})
export class EncryptProviderModule {}
