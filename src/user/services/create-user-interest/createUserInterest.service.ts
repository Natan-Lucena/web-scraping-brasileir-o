import { ConflictException, Injectable } from '@nestjs/common';
import { UserInterestRepository } from 'src/providers/repositories/userInterestRepository';

@Injectable()
export class CreateUserInterestService {
  constructor(private repository: UserInterestRepository) {}

  async userInterestCreate(userId: number, teamName: string) {
    const interestAlreadyExists =
      await this.repository.doesInterestAlreadyExist(userId, teamName);
    if (interestAlreadyExists) {
      throw new ConflictException('This interest already exists for the user.');
    }

    return await this.repository.registerUserInterest(userId, teamName);
  }
}
