import { ForbiddenException, Injectable } from '@nestjs/common';
import { SignTokenService } from '../sign-token/sign-token.service';
import { UserRepository } from 'src/providers/repositories/userRepository';

import * as bcrypt from 'bcrypt';

interface ISignInUser {
  email: string;
  password: string;
}

@Injectable()
export class SignInService {
  constructor(
    private userRepository: UserRepository,
    private signTokenService: SignTokenService,
  ) {}

  async execute({ email, password }: ISignInUser) {
    const user = await this.userRepository.findUserByEmail(email);
    if (!user) {
      throw new ForbiddenException('Credentials incorrect');
    }
    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
      throw new ForbiddenException('Credentials incorrect');
    }
    return await this.signTokenService.signToken(user.id, user.email);
  }
}
