import { IsNotEmpty, IsString, Matches } from 'class-validator';

export class RegisterDto {
  @IsString()
  @IsNotEmpty()
  phone: string;

  @IsString()
  @IsNotEmpty()
  verificationToken: string;

  @IsString()
  @IsNotEmpty()
  name: string;

  @Matches(/^\d{4}$/, { message: 'Le code secret doit contenir 4 chiffres.' })
  pin: string;
}
