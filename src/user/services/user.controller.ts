import { Body, Controller, Delete, Param, Patch } from "@nestjs/common";
import { userService } from "./user.service";
import { CreateUserDto } from "../dtos/createUserDto";

@Controller('user')
export class UserController{
    constructor(private userService: userService) {
    }

    
    @Patch('createRegister')
    userCreate(
        @Body() CreateUserDto: CreateUserDto
    ){
        const { email, name, phone } = CreateUserDto;
        return this.userService.userCreate(email, name, phone);
    }


    @Patch('updateRegister/:id')
    userUpdate(
        @Param('id') id: string,
        @Body() data: { email?: string, name?: string, phone?: string }
    ) {
        const userId = Number(id);
        const { email, name, phone } = data;
        return this.userService.userUpdate(userId, data);
    }

    @Delete('deleteRegister/:id')
    userDelete(
        @Param('id') id: string
    ) {
        const userId = Number(id);
        return this.userService.userDelete(userId);
    }


}