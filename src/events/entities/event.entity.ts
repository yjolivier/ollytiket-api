import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Manager } from '../../managers/manager.entity';
import { TicketTier } from '../../common/ticket-tier';

/**
 * An event (concert). Field names/shape mirror `Event` in the Flutter app
 * (`lib/models/event.dart`) so the JSON response can be deserialized as-is.
 */
@Entity('events')
export class EventEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Index()
  @ManyToOne(() => Manager, { onDelete: 'CASCADE' })
  manager: Manager;

  @Column()
  managerId: string;

  @Column()
  name: string;

  /** ISO yyyy-MM-dd. */
  @Column()
  date: string;

  /** HH:mm. */
  @Column()
  time: string;

  @Column()
  city: string;

  @Column()
  country: string;

  @Column()
  venue: string;

  @Column({ default: '' })
  venueHint: string;

  @Column('int')
  capacity: number;

  @Column('int')
  margin: number;

  /** Seats per tier — does not include `grand` (always the remainder). */
  @Column('jsonb')
  alloc: Partial<Record<TicketTier, number>>;

  /** Price in FCFA per tier, including `grand`. */
  @Column('jsonb')
  prices: Partial<Record<TicketTier, number>>;

  @CreateDateColumn()
  createdAt: Date;
}
