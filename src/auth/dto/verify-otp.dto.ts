import { IsNotEmpty, IsString, Matches } from 'class-validator';

export class VerifyOtpDto {
  @IsString()
  @IsNotEmpty()
  phone: string;

  @Matches(/^\d{4}$/, { message: 'Le code doit contenir 4 chiffres.' })
  code: string;
}
