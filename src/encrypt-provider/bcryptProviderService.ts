import { Injectable } from '@nestjs/common';
import * as bcrypt from 'bcrypt';

@Injectable()
export class BcryptProviderService {
  private readonly saltRounds = 8;

  public async hashPassword(password: string): Promise<string> {
    try {
      const salt = await bcrypt.genSalt(this.saltRounds);
      const hashedPassword = await bcrypt.hash(password, salt);
      return hashedPassword;
    } catch {
      throw new Error('Erro ao criptografar a senha');
    }
  }

  public async IsValidPassword(password: string): Promise<boolean> {
    const minLength = 8;
    const hasNoSpaces = !/\s/.test(password);

    if (password.length < minLength) {
      throw new Error('Password must have at least 8 characters');
    }

    if (!hasNoSpaces) {
      throw new Error('Password must not contain spaces');
    }

    return true;
  }
}
