import { Body, Controller, Post } from '@nestjs/common';
import { SignInUserDTO } from 'src/auth/dtos/signInUser.dto';
import { SignInService } from 'src/auth/services/sign-in/sign-in.service';

@Controller('auth')
export class SignInController {
  constructor(private signInService: SignInService) {}

  @Post('sign-in')
  async handle(@Body() dto: SignInUserDTO) {
    return await this.signInService.execute(dto);
  }
}
