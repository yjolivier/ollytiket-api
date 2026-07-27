import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
} from 'typeorm';

/** An event manager account — the app's only kind of user. */
@Entity('managers')
export class Manager {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Index({ unique: true })
  @Column()
  phone: string;

  @Column()
  name: string;

  @Column()
  pinHash: string;

  /** Consecutive failed login attempts, reset on success. Backs lockout. */
  @Column({ default: 0 })
  failedAttempts: number;

  @Column({ type: 'timestamptz', nullable: true })
  lockedUntil: Date | null;

  @CreateDateColumn()
  createdAt: Date;
}
