import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class UserRepository {
  constructor(private prisma: PrismaService) {}

  userCreate(email: string, name: string, phone: string) {
    return this.prisma.user.create({
      data: {
        email,
        name,
        phone,
      },
    });
  }

  userUpdate(
    id: number,
    data: { email?: string; name?: string; phone?: string },
  ) {
    return this.prisma.user.update({
      where: { id },
      data,
    });
  }

  userDelete(id: number) {
    return this.prisma.user.delete({
      where: { id },
    });
  }

  findUserById(id: number) {
    return this.prisma.user.findUnique({
      where: { id },
    });
  }

  findUserByEmail(email: string) {
    return this.prisma.user.findUnique({
      where: { email },
    });
  }

  findUserByPhone(phone: string) {
    return this.prisma.user.findUnique({
      where: { phone },
    });
  }
}
