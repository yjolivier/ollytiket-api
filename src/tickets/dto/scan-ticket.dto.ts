import { IsNotEmpty, IsString } from 'class-validator';

export class ScanTicketDto {
  /** Raw QR content (`OLLYTIKET:<code>|EVT:<eventId>`) or a bare code. */
  @IsString()
  @IsNotEmpty()
  code: string;
}
