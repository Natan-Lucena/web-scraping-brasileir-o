import { Controller, Get, UseGuards } from '@nestjs/common';
import { JwtGuard } from 'src/auth/guards/jwt.guard';
import { GetUser } from 'src/auth/decorators/getUser.decorator';
import { ListUserInterestService } from '../services/listUserInterest.service';

@UseGuards(JwtGuard)
@Controller('user')
export class ListUserInterestController {
  private userInterestService: ListUserInterestService;
  constructor(createUserInterestService: ListUserInterestService) {
    this.userInterestService = createUserInterestService;
  }

  @Get('interest')
  async getInterest(@GetUser('id') userId: number) {
    return await this.userInterestService.userInterestFindById(userId);
  }
}
