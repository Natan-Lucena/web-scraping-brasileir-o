import { Injectable } from '@nestjs/common';
import { UserRepository } from 'src/providers/repositories/userRepository';

@Injectable()
export class UserUpdateService {
  constructor(private repository: UserRepository) {}

  async userUpdate(
    id: number,
    data: { email?: string; name?: string; phone?: string },
  ) {
    const { phone } = data;

    const existingUser = await this.repository.findUserById(id);

    if (!existingUser) {
      throw new Error('User not found');
    }

    if (phone && !/^\d{9}$/.test(phone)) {
      throw new Error('Phone number is invalid. It should be 9 digits.');
    }

    return this.repository.userUpdate(id, data);
  }
}
