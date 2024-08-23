import { Injectable } from '@nestjs/common';
import { UserInterest } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class UserInterestRepository {
  constructor(private prisma: PrismaService) {}

  async registerUserInterest(
    userId: number,
    teamName: string,
  ): Promise<UserInterest> {
    return await this.prisma.userInterest.create({
      data: {
        userId,
        teamName,
      },
    });
  }

  async RemoveUserInterest(
    userId: number,
    teamName: string,
  ): Promise<UserInterest> {
    return await this.prisma.userInterest.delete({
      where: { userId_teamName: { userId, teamName } },
    });
  }

  async findUserInterestById(userId: number): Promise<UserInterest[]> {
    return await this.prisma.userInterest.findMany({
      where: { userId },
    });
  }

  async doesInterestAlreadyExist(
    userId: number,
    teamName: string,
  ): Promise<boolean> {
    const userInterest = await this.prisma.userInterest.findUnique({
      where: { userId_teamName: { userId, teamName } },
    });

    return userInterest ? true : false;
  }
}
