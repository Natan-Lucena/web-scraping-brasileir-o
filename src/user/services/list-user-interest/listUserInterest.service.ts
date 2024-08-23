import { Injectable } from '@nestjs/common';
import { UserInterestRepository } from 'src/providers/repositories/userInterestRepository';

@Injectable()
export class ListUserInterestService {
  constructor(private repository: UserInterestRepository) {}

  async userInterestFindById(userId: number) {
    return await this.repository.findUserInterestById(userId);
  }
}
