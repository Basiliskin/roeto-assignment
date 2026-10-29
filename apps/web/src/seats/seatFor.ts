import { Seat, Session } from './session';

/** The seat (token) that acts for `userId`, e.g. the current Player. */
export const seatFor = (session: Session, userId: string | null): Seat | undefined =>
  session.seats.find((seat) => seat.user.id === userId);
