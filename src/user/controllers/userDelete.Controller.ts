import { Controller, Delete, Param } from '@nestjs/common';
import {} from '../services/userCreate.service';
import { UserDeleteService } from '../services/userDelete.service';

@Controller('user')
export class UserDeleteController {
  constructor(private userService: UserDeleteService) {}

  @Delete('deleteRegister/:id')
  userDelete(@Param('id') id: string) {
    const userId = Number(id);
    return this.userService.userDelete(userId);
  }
}
