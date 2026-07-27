/**
 * Mirrors `TicketTier` in the Flutter app (`lib/models/ticket_tier.dart`) —
 * the string values are the wire format, keep them in sync.
 */
export enum TicketTier {
  VVVIP = 'vvvip',
  VVIP = 'vvip',
  VIP = 'vip',
  STANDARD = 'standard',
  GRAND = 'grand',
}

/** Tiers with an explicit seat allocation — `grand` is always the remainder. */
export const ALLOCATABLE_TIERS = [
  TicketTier.VVVIP,
  TicketTier.VVIP,
  TicketTier.VIP,
  TicketTier.STANDARD,
];

export const TICKET_TIER_LABELS: Record<TicketTier, string> = {
  [TicketTier.VVVIP]: 'VVVIP',
  [TicketTier.VVIP]: 'VVIP',
  [TicketTier.VIP]: 'VIP',
  [TicketTier.STANDARD]: 'Standard',
  [TicketTier.GRAND]: 'Grand public',
};
