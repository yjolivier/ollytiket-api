import { Ticket } from './entities/ticket.entity';

/** Mirrors `ScanOutcome` in the Flutter app (`lib/data/scan_outcome.dart`). */
export interface ScanOutcome {
  success: boolean;
  title: string;
  message: string;
  ticket?: Ticket;
}
