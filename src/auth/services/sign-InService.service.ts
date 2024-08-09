import { Injectable } from '@nestjs/common';
import { UserRepository } from 'src/providers/repositories/userRepository';

@Injectable()
export class signInUserService {
  constructor(private repository: UserRepository) {}

  async userCreate(email: string, name: string, phone: string) {
    const existingUserByEmail = await this.repository.findUserByEmail(email);

    if (existingUserByEmail) {
      throw new Error('There is already a user with this email');
    }

    if (!/^\d{9}$/.test(phone)) {
      throw new Error('Phone number is invalid. It should be 9 digits.');
    }

    const existingUserByPhone = await this.repository.findUserByPhone(phone);

    if (existingUserByPhone) {
      throw new Error('There is already a user with this phone number');
    }

    return this.repository.registerUser(email, name, phone);
  }
}
