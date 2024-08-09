import { Body, Controller, Post } from '@nestjs/common';
import { signInUserDto } from '../dtos/createUserDto';
import { signInUserService } from '../services/sign-InService.service';

@Controller('auth')
export class singInController {
  constructor(private userService: signInUserService) {}

  @Post('sigIn')
  sigIn(@Body() createUserDto: signInUserDto) {
    const { email, name, phone } = createUserDto;
    return this.userService.userCreate(email, name, phone);
  }
}
