import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../common/jwt-auth.guard';
import { CurrentManager } from '../common/current-manager.decorator';
import type { JwtPayload } from '../auth/auth.service';
import { TicketsService } from './tickets.service';
import { GenerateTicketDto } from './dto/generate-ticket.dto';
import { ScanTicketDto } from './dto/scan-ticket.dto';

@UseGuards(JwtAuthGuard)
@Controller('tickets')
export class TicketsController {
  constructor(private readonly tickets: TicketsService) {}

  @Get()
  findAll(
    @CurrentManager() manager: JwtPayload,
    @Query('eventId') eventId?: string,
  ) {
    return this.tickets.fetchTickets(manager.sub, eventId);
  }

  @Post('generate')
  generate(
    @CurrentManager() manager: JwtPayload,
    @Body() dto: GenerateTicketDto,
  ) {
    return this.tickets.generateTicket(manager.sub, dto);
  }

  @Post(':id/refund')
  refund(@CurrentManager() manager: JwtPayload, @Param('id') id: string) {
    return this.tickets.refundTicket(manager.sub, id);
  }

  @Post('scan')
  scan(@CurrentManager() manager: JwtPayload, @Body() dto: ScanTicketDto) {
    return this.tickets.scanCode(manager.sub, dto.code);
  }
}
