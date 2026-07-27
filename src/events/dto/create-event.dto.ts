import { IsInt, IsNotEmpty, IsObject, IsString, Min } from 'class-validator';
import { TicketTier } from '../../common/ticket-tier';

export class CreateEventDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  /** ISO yyyy-MM-dd. */
  @IsString()
  @IsNotEmpty()
  date: string;

  /** HH:mm. */
  @IsString()
  @IsNotEmpty()
  time: string;

  @IsString()
  @IsNotEmpty()
  city: string;

  @IsString()
  @IsNotEmpty()
  country: string;

  @IsString()
  @IsNotEmpty()
  venue: string;

  @IsString()
  venueHint = '';

  @IsInt()
  @Min(1)
  capacity: number;

  @IsInt()
  @Min(0)
  margin: number;

  /** Seats per tier — vvvip/vvip/vip/standard only, `grand` is derived. */
  @IsObject()
  alloc: Partial<Record<TicketTier, number>>;

  /** Price (FCFA) per tier, including `grand`. */
  @IsObject()
  prices: Partial<Record<TicketTier, number>>;
}
