import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { EventEntity } from './entities/event.entity';
import { CreateEventDto } from './dto/create-event.dto';
import { UpdateEventDto } from './dto/update-event.dto';
import { ALLOCATABLE_TIERS, TicketTier } from '../common/ticket-tier';

@Injectable()
export class EventsService {
  constructor(
    @InjectRepository(EventEntity)
    private readonly events: Repository<EventEntity>,
  ) {}

  fetchEvents(managerId: string): Promise<EventEntity[]> {
    return this.events.find({
      where: { managerId },
      order: { createdAt: 'DESC' },
    });
  }

  /** Finds an event, scoped to its owning manager. */
  async findOwned(managerId: string, eventId: string): Promise<EventEntity> {
    const event = await this.events.findOne({
      where: { id: eventId, managerId },
    });
    if (!event) {
      throw new NotFoundException('Événement introuvable.');
    }
    return event;
  }

  async createEvent(
    managerId: string,
    dto: CreateEventDto,
  ): Promise<EventEntity> {
    this.assertAllocationFits(dto.alloc, dto.capacity);

    const event = this.events.create({ ...dto, managerId });
    return this.events.save(event);
  }

  async updateEvent(
    managerId: string,
    eventId: string,
    dto: UpdateEventDto,
  ): Promise<EventEntity> {
    const event = await this.findOwned(managerId, eventId);

    const capacity = dto.capacity ?? event.capacity;
    const alloc = dto.alloc ?? event.alloc;
    this.assertAllocationFits(alloc, capacity);

    Object.assign(event, dto);
    return this.events.save(event);
  }

  /** Allocated capacity for `tier` (computed remainder for `grand`). */
  tierCapacity(event: EventEntity, tier: TicketTier): number {
    if (tier === TicketTier.GRAND) {
      const remainder = event.capacity - this.allocatedSum(event.alloc);
      return remainder < 0 ? 0 : remainder;
    }
    return event.alloc[tier] ?? 0;
  }

  private allocatedSum(alloc: Partial<Record<TicketTier, number>>): number {
    return ALLOCATABLE_TIERS.reduce((sum, tier) => sum + (alloc[tier] ?? 0), 0);
  }

  private assertAllocationFits(
    alloc: Partial<Record<TicketTier, number>>,
    capacity: number,
  ): void {
    const allocatedSum = this.allocatedSum(alloc);
    if (allocatedSum > capacity) {
      throw new BadRequestException(
        `La somme des catégories (${allocatedSum}) dépasse le nombre de places (${capacity}).`,
      );
    }
  }
}
