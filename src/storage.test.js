const {
  STORAGE_KEYS,
  getDefaultConfig,
  loadConfig,
  saveConfig,
  loadOrders,
  saveOrders,
  loadMessages,
  saveMessages,
  loadLocks,
  saveLocks,
  setUserLock,
  clearUserLock,
  isUserLocked,
} = require('./storage');

describe('storage helpers', () => {
  let storage;

  beforeEach(() => {
    storage = window.localStorage;
    storage.clear();
  });

  test('loadConfig returns defaults when empty', () => {
    const config = loadConfig(storage);
    expect(config).toEqual(getDefaultConfig());
  });

  test('saveConfig and loadConfig preserve values', () => {
    const config = { oddProbability: 0.5, product: { title: 'X' }, qrcode: {}, adminPassword: 'ad123ad' };
    saveConfig(storage, config);
    expect(loadConfig(storage)).toEqual(config);
  });

  test('loadOrders returns empty array when missing', () => {
    expect(loadOrders(storage)).toEqual([]);
  });

  test('saveOrders and loadOrders work', () => {
    const orders = [{ id: 1 }];
    saveOrders(storage, orders);
    expect(loadOrders(storage)).toEqual(orders);
  });

  test('loadMessages returns empty array when missing', () => {
    expect(loadMessages(storage)).toEqual([]);
  });

  test('saveMessages and loadMessages work', () => {
    const messages = [{ text: 'hi' }];
    saveMessages(storage, messages);
    expect(loadMessages(storage)).toEqual(messages);
  });

  test('loadLocks returns empty object when missing', () => {
    expect(loadLocks(storage)).toEqual({});
  });

  test('setUserLock, isUserLocked, clearUserLock manage locks', () => {
    expect(isUserLocked(storage, 'user1')).toBe(false);
    setUserLock(storage, 'user1');
    expect(isUserLocked(storage, 'user1')).toBe(true);
    clearUserLock(storage, 'user1');
    expect(isUserLocked(storage, 'user1')).toBe(false);
  });
});
