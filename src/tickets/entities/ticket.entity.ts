import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { EventEntity } from '../../events/entities/event.entity';
import { TicketTier } from '../../common/ticket-tier';
import { TicketStatus } from '../../common/ticket-status';

/**
 * A single ticket. Field names/shape mirror `Ticket` in the Flutter app
 * (`lib/models/ticket.dart`) so the JSON response can be deserialized as-is.
 */
@Entity('tickets')
export class Ticket {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Index()
  @ManyToOne(() => EventEntity, { onDelete: 'CASCADE' })
  event: EventEntity;

  @Column()
  eventId: string;

  /** "+225 ..." */
  @Column()
  phone: string;

  /** "OT-XXXXXXXX" */
  @Index({ unique: true })
  @Column()
  code: string;

  @Column({ type: 'enum', enum: TicketTier })
  tier: TicketTier;

  @Column({ type: 'enum', enum: TicketStatus, default: TicketStatus.VALID })
  status: TicketStatus;

  /** Readable timestamp once scanned, e.g. "aujourd'hui 18:42". */
  @Column({ type: 'varchar', nullable: true })
  scannedAt: string | null;

  @CreateDateColumn()
  createdAt: Date;
}
