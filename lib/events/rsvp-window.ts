const SECOND = 1000;
const MINUTE = 60 * SECOND;
const HOUR = 60 * MINUTE;
const DAY = 24 * HOUR;

/** Same rule as the database policy: replies are accepted while now < rsvp_deadline. */
export function isRsvpOpen(deadline: Date, now: Date): boolean {
  return now.getTime() < deadline.getTime();
}

export interface TimeRemaining {
  readonly days: number;
  readonly hours: number;
  readonly minutes: number;
  readonly seconds: number;
}

/** Days, hours, minutes and seconds until `target`; all zero once it has passed. */
export function timeUntil(target: Date, now: Date): TimeRemaining {
  const remaining = Math.max(0, target.getTime() - now.getTime());
  return {
    days: Math.floor(remaining / DAY),
    hours: Math.floor((remaining % DAY) / HOUR),
    minutes: Math.floor((remaining % HOUR) / MINUTE),
    seconds: Math.floor((remaining % MINUTE) / SECOND),
  };
}
