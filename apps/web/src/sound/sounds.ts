export type Sound = 'roll' | 'bust' | 'hold' | 'win';

/** A Roll or Hold just shown on the board, by a human or a replayed Bot step. */
export type BoardEvent = { kind: 'ROLL'; bust: boolean } | { kind: 'HOLD'; won: boolean };

/** A winning Hold is silent here: the Win sound plays when the win overlay appears. */
export function soundFor(event: BoardEvent): Sound | null {
  if (event.kind === 'ROLL') return event.bust ? 'bust' : 'roll';
  return event.won ? null : 'hold';
}
