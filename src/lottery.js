const DEFAULT_NUMBERS = [1, 12, 3, 10, 5, 8, 7, 6, 9, 4, 11, 2, 13];

function normalizeProbability(probability) {
  if (typeof probability !== 'number' || Number.isNaN(probability)) {
    throw new Error('Probability must be a number');
  }
  if (probability < 0) return 0;
  if (probability > 1) return 1;
  return probability;
}

function pickLotteryNumber(probability) {
  const p = normalizeProbability(probability);
  const roll = Math.random();
  const wantOdd = roll < p;
  const oddNumbers = DEFAULT_NUMBERS.filter((n) => n % 2 === 1);
  const evenNumbers = DEFAULT_NUMBERS.filter((n) => n % 2 === 0);
  const pool = wantOdd ? oddNumbers : evenNumbers;
  const index = Math.floor(Math.random() * pool.length);
  return pool[index];
}

function isLocked(userState) {
  return Boolean(userState && userState.locked);
}

function setLock(userState) {
  return { ...userState, locked: true };
}

function clearLock(userState) {
  return { ...userState, locked: false };
}

const lotteryExports = {
  DEFAULT_NUMBERS,
  normalizeProbability,
  pickLotteryNumber,
  isLocked,
  setLock,
  clearLock,
};

if (typeof module !== 'undefined' && module.exports) {
  module.exports = lotteryExports;
}

if (typeof window !== 'undefined') {
  window.Lottery = lotteryExports;
}
