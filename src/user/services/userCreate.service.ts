import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { UserRepository } from 'src/providers/repositories/userRepository';

@Injectable()
export class UserService {
  constructor(
    private repository: UserRepository,
    private prisma: PrismaService,
  ) {}

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

    return this.repository.userCreate(email, name, phone);
  }
}
