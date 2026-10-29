import { InvalidUsernameError, Username } from './username';

describe('Username', () => {
  it('trims and lowercases', () => {
    expect(Username.of('  Alice_1 ').value).toBe('alice_1');
  });

  it.each(['ab', 'a'.repeat(21), 'bad name', 'bad-name', ''])('rejects %p', (raw) => {
    expect(() => Username.of(raw)).toThrow(InvalidUsernameError);
  });

  it('compares case-insensitively', () => {
    expect(Username.of('Bob').equals(Username.of('bob'))).toBe(true);
  });
});
