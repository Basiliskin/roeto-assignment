/** Default opponent for the auto-created Game: `player2`, or `player1` if you are player2. */
export const defaultOpponentFor = (username: string): string =>
  username.trim().toLowerCase() === 'player2' ? 'player1' : 'player2';
