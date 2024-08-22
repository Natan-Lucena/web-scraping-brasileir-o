import { Injectable, NotFoundException } from '@nestjs/common';
import { UserInterestRepository } from 'src/providers/repositories/userInterestRepository';

@Injectable()
export class DeleteUserInterestService {
  constructor(private repository: UserInterestRepository) {}

  async userInterestRemove(userId: number, teamName: string) {
    const interestAlreadyExists =
      await this.repository.doesInterestAlreadyExist(userId, teamName);
    if (!interestAlreadyExists) {
      throw new NotFoundException('This interest does not exist for the user.');
    }
    return await this.repository.RemoveUserInterest(userId, teamName);
  }
}
