import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Ticket } from './entities/ticket.entity';
import { EventsService } from '../events/events.service';
import { TicketStatus } from '../common/ticket-status';
import { TICKET_TIER_LABELS, TicketTier } from '../common/ticket-tier';
import { digitsOnly, normalizePhone } from '../common/phone.util';
import { GenerateTicketDto } from './dto/generate-ticket.dto';
import { ScanOutcome } from './scan-outcome';

const CODE_ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
const CODE_LENGTH = 8;
const MAX_CODE_ATTEMPTS = 5;

@Injectable()
export class TicketsService {
  constructor(
    @InjectRepository(Ticket)
    private readonly tickets: Repository<Ticket>,
    private readonly eventsService: EventsService,
  ) {}

  /** Tickets belonging to the manager's own events, optionally by event. */
  fetchTickets(managerId: string, eventId?: string): Promise<Ticket[]> {
    const qb = this.tickets
      .createQueryBuilder('ticket')
      .innerJoin('ticket.event', 'event')
      .where('event.managerId = :managerId', { managerId })
      .orderBy('ticket.createdAt', 'DESC');

    if (eventId) {
      qb.andWhere('ticket.eventId = :eventId', { eventId });
    }
    return qb.getMany();
  }

  async generateTicket(
    managerId: string,
    dto: GenerateTicketDto,
  ): Promise<Ticket> {
    const event = await this.eventsService.findOwned(managerId, dto.eventId);

    if (digitsOnly(dto.phone).length < 8) {
      throw new BadRequestException('Numéro de téléphone invalide.');
    }

    const capacity = this.eventsService.tierCapacity(event, dto.tier);
    const used = await this.activeCountForTier(event.id, dto.tier);
    if (used >= capacity) {
      throw new BadRequestException(
        `Catégorie ${TICKET_TIER_LABELS[dto.tier]} complète. Choisissez une autre catégorie.`,
      );
    }

    const ticket = this.tickets.create({
      eventId: event.id,
      phone: normalizePhone(dto.phone),
      code: await this.uniqueCode(),
      tier: dto.tier,
      status: TicketStatus.VALID,
      scannedAt: null,
    });
    return this.tickets.save(ticket);
  }

  async refundTicket(managerId: string, ticketId: string): Promise<Ticket> {
    const ticket = await this.findOwned(managerId, ticketId);
    ticket.status = TicketStatus.REFUNDED;
    return this.tickets.save(ticket);
  }

  async scanCode(managerId: string, rawCode: string): Promise<ScanOutcome> {
    const code = rawCode.includes('OLLYTIKET:')
      ? rawCode.split('OLLYTIKET:')[1].split('|')[0]
      : rawCode;

    const ticket = await this.tickets
      .createQueryBuilder('ticket')
      .innerJoinAndSelect('ticket.event', 'event')
      .where('event.managerId = :managerId', { managerId })
      .andWhere('ticket.code = :code', { code })
      .getOne();

    if (!ticket) {
      return {
        success: false,
        title: 'Billet introuvable',
        message: 'Ce QR code ne correspond à aucun billet OllyTiket.',
      };
    }

    if (ticket.status === TicketStatus.REFUNDED) {
      return {
        success: false,
        title: 'Billet remboursé',
        message: 'Ce billet a été annulé et n’est plus valide.',
        ticket,
      };
    }

    if (ticket.status === TicketStatus.SCANNED) {
      const when = ticket.scannedAt ? ` (${ticket.scannedAt})` : '';
      return {
        success: false,
        title: 'Déjà scanné',
        message: `Ce billet a déjà été utilisé${when}. Entrée refusée.`,
        ticket,
      };
    }

    const event = ticket.event;
    ticket.status = TicketStatus.SCANNED;
    ticket.scannedAt = this.readableNow();
    await this.tickets.save(ticket);

    return {
      success: true,
      title: 'Entrée validée',
      message: `${event.name} — accès autorisé.`,
      ticket,
    };
  }

  private async findOwned(managerId: string, ticketId: string): Promise<Ticket> {
    const ticket = await this.tickets
      .createQueryBuilder('ticket')
      .innerJoin('ticket.event', 'event')
      .where('event.managerId = :managerId', { managerId })
      .andWhere('ticket.id = :ticketId', { ticketId })
      .getOne();
    if (!ticket) {
      throw new NotFoundException('Billet introuvable.');
    }
    return ticket;
  }

  private async activeCountForTier(
    eventId: string,
    tier: TicketTier,
  ): Promise<number> {
    return this.tickets.count({
      where: [
        { eventId, tier, status: TicketStatus.VALID },
        { eventId, tier, status: TicketStatus.SCANNED },
      ],
    });
  }

  private async uniqueCode(): Promise<string> {
    for (let attempt = 0; attempt < MAX_CODE_ATTEMPTS; attempt++) {
      const code = this.randomCode();
      const exists = await this.tickets.exists({ where: { code } });
      if (!exists) {
        return code;
      }
    }
    throw new Error('Could not generate a unique ticket code.');
  }

  private randomCode(): string {
    let code = 'OT-';
    for (let i = 0; i < CODE_LENGTH; i++) {
      code += CODE_ALPHABET[Math.floor(Math.random() * CODE_ALPHABET.length)];
    }
    return code;
  }

  private readableNow(): string {
    const now = new Date();
    const hh = String(now.getHours()).padStart(2, '0');
    const mm = String(now.getMinutes()).padStart(2, '0');
    return `aujourd’hui ${hh}:${mm}`;
  }
}
