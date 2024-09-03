import { Body, Controller, Post } from '@nestjs/common';
import { signUpUserDto } from 'src/auth/dtos/createUserDto';
import { signUpUserService } from 'src/auth/services/sign-up/sign-Up.service';

@Controller('auth')
export class signUpController {
  constructor(private userService: signUpUserService) {}

  @Post('sign-up')
  async sigIn(@Body() createUserDto: signUpUserDto) {
    const { email, name, phone, password } = createUserDto;
    return await this.userService.userCreate(email, name, phone, password);
  }
}
