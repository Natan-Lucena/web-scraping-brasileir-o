import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { BcryptProviderService } from 'src/encrypt-provider/bcryptProviderService';

import { UserRepository } from 'src/providers/repositories/userRepository';
import isValidPhone from 'src/utils/isValidPhone';

@Injectable()
export class signUpUserService {
  constructor(
    private repository: UserRepository,
    private bcryptProvider: BcryptProviderService,
  ) {}

  async userCreate(
    email: string,
    name: string,
    phone: string,
    password: string,
  ) {
    const existingUserByEmail = await this.repository.findUserByEmail(email);

    if (existingUserByEmail) {
      throw new UnauthorizedException(
        'There is already a user with this email',
      );
    }
    //TO-DO: Fix
    // if (!isValidPhone(phone)) {
    //   throw new BadRequestException(
    //     'Phone number is invalid. It should be 9 digits.',
    //   );
    // }

    const existingUserByPhone = await this.repository.findUserByPhone(phone);

    if (existingUserByPhone) {
      throw new UnauthorizedException(
        'There is already a user with this phone number',
      );
    }

    await this.bcryptProvider.IsValidPassword(password);

    password = await this.bcryptProvider.hashPassword(password);

    const user = await this.repository.registerUser(
      email,
      name,
      phone,
      password,
    );
    return { email: user.email, name: user.name, phone: user.phone };
  }
}
