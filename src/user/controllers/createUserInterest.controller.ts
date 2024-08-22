import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { JwtGuard } from 'src/auth/guards/jwt.guard';
import { CreateUserInterestService } from '../services/createUserInterest.service';
import { GetUser } from 'src/auth/decorators/getUser.decorator';
import { RegisterInterestDto } from '../dtos/registerInterestDto';

@UseGuards(JwtGuard)
@Controller('user')
export class CreateUserInterestController {
  private userInterestService: CreateUserInterestService;
  constructor(createUserInterestService: CreateUserInterestService) {
    this.userInterestService = createUserInterestService;
  }

  @Post('interest')
  async registerInterest(
    @GetUser('id') userId: number,
    @Body() registerInterestDto: RegisterInterestDto,
  ) {
    const { teamName } = registerInterestDto;
    return await this.userInterestService.userInterestCreate(userId, teamName);
  }
}
