import { Module } from "@nestjs/common";
import { userService } from "./user.service";
import { UserController } from "./user.controller";
import { PrismaService } from "src/prisma/prisma.service";
@Module({
    imports: [PrismaService],
    providers: [userService],
    controllers: [UserController]
})
export class UserModule{}