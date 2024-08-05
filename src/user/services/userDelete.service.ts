import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { UserRepository } from 'src/providers/repositories/userRepository';

@Injectable()
export class UserDeleteService {
  constructor(
    private repository: UserRepository,
    private prisma: PrismaService,
  ) {}

  async userDelete(id: number) {
    const existingUser = await this.repository.findUserById(id);

    if (!existingUser) {
      throw new Error('User not found');
    }

    return this.repository.userDelete(id);
  }
}
