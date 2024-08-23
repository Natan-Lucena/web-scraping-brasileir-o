import { IsNotEmpty, IsString } from 'class-validator';

export class RegisterInterestDto {
  @IsNotEmpty()
  @IsString()
  teamName: string;
}
