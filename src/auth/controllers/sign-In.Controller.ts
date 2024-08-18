import { Body, Controller, Post } from '@nestjs/common';
import { SignInUserDTO } from 'src/auth/dtos/signInUser.dto';
import { SignInService } from '../services/sign-in/sign-In.service';

@Controller('auth')
export class SignInController {
  constructor(private signInService: SignInService) {}

  @Post('sign-in')
  async handle(@Body() dto: SignInUserDTO) {
    return await this.signInService.execute(dto);
  }
}
