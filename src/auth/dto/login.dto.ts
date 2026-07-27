import { IsNotEmpty, IsString, Matches } from 'class-validator';

export class LoginDto {
  @IsString()
  @IsNotEmpty()
  phone: string;

  @Matches(/^\d{4}$/, { message: 'Le code secret doit contenir 4 chiffres.' })
  pin: string;
}
