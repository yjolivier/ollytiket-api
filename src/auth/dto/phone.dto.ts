import { IsNotEmpty, IsString } from 'class-validator';

export class PhoneDto {
  @IsString()
  @IsNotEmpty()
  phone: string;
}
