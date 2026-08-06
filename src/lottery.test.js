const {
  normalizeProbability,
  pickLotteryNumber,
  isLocked,
  setLock,
  clearLock,
  DEFAULT_NUMBERS,
} = require('./lottery');

describe('lottery core', () => {
  test('normalizeProbability clamps values to [0,1]', () => {
    expect(normalizeProbability(-0.5)).toBe(0);
    expect(normalizeProbability(0)).toBe(0);
    expect(normalizeProbability(0.5)).toBe(0.5);
    expect(normalizeProbability(1)).toBe(1);
    expect(normalizeProbability(1.5)).toBe(1);
  });

  test('normalizeProbability throws for non-numbers', () => {
    expect(() => normalizeProbability(undefined)).toThrow();
    expect(() => normalizeProbability('0.5')).toThrow();
  });

  test('pickLotteryNumber returns odd or even based on probability', () => {
    const originalMathRandom = Math.random;
    Math.random = () => 0.1;
    const odd = pickLotteryNumber(0.7);
    expect(odd % 2).toBe(1);
    Math.random = () => 0.9;
    const even = pickLotteryNumber(0.7);
    expect(even % 2).toBe(0);
    Math.random = originalMathRandom;
  });

  test('pickLotteryNumber uses default numbers and stays within set', () => {
    const number = pickLotteryNumber(0.5);
    expect(DEFAULT_NUMBERS).toContain(number);
  });

  test('lock helpers maintain immutability', () => {
    const state = { locked: false, name: 'test' };
    const locked = setLock(state);
    expect(locked.locked).toBe(true);
    expect(state.locked).toBe(false);
    const cleared = clearLock(locked);
    expect(cleared.locked).toBe(false);
    expect(locked.locked).toBe(true);
  });
});
