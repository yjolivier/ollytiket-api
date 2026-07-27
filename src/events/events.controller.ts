import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../common/jwt-auth.guard';
import { CurrentManager } from '../common/current-manager.decorator';
import type { JwtPayload } from '../auth/auth.service';
import { EventsService } from './events.service';
import { CreateEventDto } from './dto/create-event.dto';
import { UpdateEventDto } from './dto/update-event.dto';

@UseGuards(JwtAuthGuard)
@Controller('events')
export class EventsController {
  constructor(private readonly events: EventsService) {}

  @Get()
  findAll(@CurrentManager() manager: JwtPayload) {
    return this.events.fetchEvents(manager.sub);
  }

  @Post()
  create(@CurrentManager() manager: JwtPayload, @Body() dto: CreateEventDto) {
    return this.events.createEvent(manager.sub, dto);
  }

  @Patch(':id')
  update(
    @CurrentManager() manager: JwtPayload,
    @Param('id') id: string,
    @Body() dto: UpdateEventDto,
  ) {
    return this.events.updateEvent(manager.sub, id, dto);
  }
}
