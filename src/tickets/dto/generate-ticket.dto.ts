import { IsEnum, IsNotEmpty, IsString } from 'class-validator';
import { TicketTier } from '../../common/ticket-tier';

export class GenerateTicketDto {
  @IsString()
  @IsNotEmpty()
  eventId: string;

  @IsString()
  @IsNotEmpty()
  phone: string;

  @IsEnum(TicketTier)
  tier: TicketTier;
}
