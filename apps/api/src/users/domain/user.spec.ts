import { User } from './user';
import { Username } from './username';

describe('User', () => {
  it('starts with Win Count 0 and increments on recordWin', () => {
    const user = User.create('u1', Username.of('alice'));
    expect(user.winCount).toBe(0);
    user.recordWin();
    expect(user.winCount).toBe(1);
  });
});
