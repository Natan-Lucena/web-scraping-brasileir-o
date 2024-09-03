import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

export class SignInUserDTO {
  @IsNotEmpty()
  @IsString()
  @IsEmail()
  email: string;
  @IsNotEmpty()
  @IsString()
  password: string;
}
