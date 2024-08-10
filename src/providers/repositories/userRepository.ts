import { Injectable } from '@nestjs/common';
import { User } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class UserRepository {
  constructor(private prisma: PrismaService) {}

  async registerUser(
    email: string,
    name: string,
    phone: string,
    password: string,
  ): Promise<User> {
    return this.prisma.user.create({
      data: {
        email,
        name,
        phone,
        password,
      },
    });
  }

  async userUpdate(
    id: number,
    data: { email?: string; name?: string; phone?: string },
  ): Promise<User> {
    return this.prisma.user.update({
      where: { id },
      data,
    });
  }

  async findUserById(id: number): Promise<User | null> {
    return this.prisma.user.findUnique({
      where: { id },
    });
  }

  async findUserByEmail(email: string): Promise<User | null> {
    return this.prisma.user.findUnique({
      where: { email },
    });
  }

  async findUserByPhone(phone: string): Promise<User | null> {
    return this.prisma.user.findUnique({
      where: { phone },
    });
  }
}
