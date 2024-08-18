import { Body, Controller, Delete, Get, Post, UseGuards } from '@nestjs/common';
import { JwtGuard } from 'src/auth/guards/jwt.guard';
import { GetUser } from 'src/auth/decorators/getUser.decorator';
import { RegisterInterestDto } from '../dtos/registerInterestDto';
import { UserInterestService } from '../services/userInterest.service';

@UseGuards(JwtGuard)
@Controller('user')
export class UserInterestController {
  private userInterestService: UserInterestService;
  constructor(userInterestService: UserInterestService) {
    this.userInterestService = userInterestService;
  }

  @Post('interest')
  async registerInterest(
    @GetUser('id') userId: number,
    @Body() registerInterestDto: RegisterInterestDto,
  ) {
    const { teamName } = registerInterestDto;
    return await this.userInterestService.userInterestCreate(userId, teamName);
  }

  @Delete('interest')
  async deleteInterest(
    @GetUser('id') userId: number,
    @Body() registerInterestDto: RegisterInterestDto,
  ) {
    const { teamName } = registerInterestDto;
    return await this.userInterestService.userInterestRemove(userId, teamName);
  }

  @Get('interest')
  async getInterest(@GetUser('id') userId: number) {
    return await this.userInterestService.userInterestFindById(userId);
  }
}
