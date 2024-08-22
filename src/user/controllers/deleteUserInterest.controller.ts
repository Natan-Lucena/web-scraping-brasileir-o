import { Body, Controller, Delete, UseGuards } from '@nestjs/common';
import { JwtGuard } from 'src/auth/guards/jwt.guard';
import { GetUser } from 'src/auth/decorators/getUser.decorator';
import { RegisterInterestDto } from '../dtos/registerInterestDto';
import { DeleteUserInterestService } from '../services/deleteUserInterest.service';

@UseGuards(JwtGuard)
@Controller('user')
export class DeleteUserInterestController {
  private userInterestService: DeleteUserInterestService;
  constructor(userInterestService: DeleteUserInterestService) {
    this.userInterestService = userInterestService;
  }

  @Delete('interest')
  async deleteInterest(
    @GetUser('id') userId: number,
    @Body() registerInterestDto: RegisterInterestDto,
  ) {
    const { teamName } = registerInterestDto;
    return await this.userInterestService.userInterestRemove(userId, teamName);
  }
}
