import { Body, Controller, Post } from '@nestjs/common';
import { CreateUserDto } from '../dtos/createUserDto';
import { UserCreateService } from '../services/userCreate.service';

@Controller('user')
export class UserCreateController {
  constructor(private userService: UserCreateService) {}

  @Post('createRegister')
  userCreate(@Body() createUserDto: CreateUserDto) {
    const { email, name, phone } = createUserDto;
    return this.userService.userCreate(email, name, phone);
  }
}
