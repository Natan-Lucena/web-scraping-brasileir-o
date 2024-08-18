import { Body, Controller, Post } from '@nestjs/common';
import { signUpUserDto } from '../dtos/createUserDto';
import { signUpUserService } from '../services/sign-UpService.service';

@Controller('auth')
export class signUpController {
  constructor(private userService: signUpUserService) {}

  @Post('signUp')
  async sigIn(@Body() createUserDto: signUpUserDto) {
    const { email, name, phone, password } = createUserDto;
    return await this.userService.userCreate(email, name, phone, password);
  }
}
