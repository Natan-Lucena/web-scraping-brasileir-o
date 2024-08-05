import { Injectable } from "@nestjs/common";
import { PrismaService } from "src/prisma/prisma.service";

@Injectable()
export class userService {
    constructor(private prisma: PrismaService) {}

    async userCreate(email: string, name: string, phone: string){

        const existingUserByEmail = await this.prisma.user.findUnique({
            where: { email }
        });

        if (existingUserByEmail) {
            throw new Error('There is already a user with this email');
        }

        const existingUserByPhone = await this.prisma.user.findUnique({
            where: { phone }
        });

        if (existingUserByPhone) {
            throw new Error('There is already a user with this phone number');
        }

        return this.prisma.user.create({
            data: {
                email,
                name,
                phone
            }
        });
    }


    async userUpdate(id: number, data: { email?: string, name?: string, phone?: string }){
        const existingUser = await this.prisma.user.findUnique({
            where: { id }
        });

        if (!existingUser) {
            throw new Error('User not found');
        }

        return this.prisma.user.update({
            where: { id },
            data
        });
    }

    async userDelete(id: number){
        const existingUser = await this.prisma.user.findUnique({
            where: { id }
        });

        if (!existingUser) {
            throw new Error('User not found');
        }

        return this.prisma.user.delete({
            where: { id }
        });
    }
}