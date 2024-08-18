import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { UserInterestRepository } from 'src/providers/repositories/userInterestRepository';

@Injectable()
export class UserInterestService {
  constructor(private repository: UserInterestRepository) {}

  async userInterestCreate(userId: number, teamName: string) {
    const interestAlreadyExists =
      await this.repository.doesInterestAlreadyExist(userId, teamName);
    if (interestAlreadyExists) {
      throw new ConflictException('This interest already exists for the user.');
    }

    return await this.repository.registerUserInterest(userId, teamName);
  }

  async userInterestRemove(userId: number, teamName: string) {
    const interestAlreadyExists =
      await this.repository.doesInterestAlreadyExist(userId, teamName);
    if (!interestAlreadyExists) {
      throw new NotFoundException('This interest does not exist for the user.');
    }
    return await this.repository.RemoveUserInterest(userId, teamName);
  }

  async userInterestFindById(userId: number) {
    return await this.repository.findUserInterestById(userId);
  }
}
