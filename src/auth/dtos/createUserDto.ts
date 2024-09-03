import { IsEmail, IsNotEmpty, IsPhoneNumber, IsString } from 'class-validator';

export class signUpUserDto {
  @IsNotEmpty()
  @IsString()
  @IsEmail()
  email: string;
  @IsNotEmpty()
  @IsString()
  name: string;
  @IsNotEmpty()
  @IsString()
  @IsPhoneNumber()
  phone: string;
  @IsNotEmpty()
  @IsString()
  password: string;
}
