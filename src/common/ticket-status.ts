/**
 * Mirrors `TicketStatus` in the Flutter app (`lib/models/ticket_status.dart`) —
 * the string values are the wire format, keep them in sync.
 */
export enum TicketStatus {
  VALID = 'valid',
  SCANNED = 'scanned',
  REFUNDED = 'refunded',
}
