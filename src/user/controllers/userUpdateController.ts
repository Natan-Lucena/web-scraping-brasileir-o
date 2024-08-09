import { Body, Controller, Param, Patch } from '@nestjs/common';
import { UserUpdateService } from '../services/userUpdate.service';

@Controller('user')
export class UserUpadateController {
  constructor(private userService: UserUpdateService) {}

  @Patch('updateRegister/:id')
  userUpdate(
    @Param('id') id: string,
    @Body() data: { email?: string; name?: string; phone?: string },
  ) {
    const userId = Number(id);
    return this.userService.userUpdate(userId, data);
  }
}
