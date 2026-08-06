const STORAGE_KEYS = { config: 'lottery_config_v2', orders: 'lottery_orders_v2', messages: 'lottery_msgs_v2', locks: 'lottery_locks_v2' };

function safeParse(value, fallback) {
  try {
    return JSON.parse(value);
  } catch (error) {
    return fallback;
  }
}

function loadFromLocalStorage(storage, key, fallback) {
  const raw = storage.getItem(key);
  if (raw === null) return fallback;
  return safeParse(raw, fallback);
}

function saveToLocalStorage(storage, key, value) {
  storage.setItem(key, JSON.stringify(value));
}

function getDefaultConfig() {
  return {
    oddProbability: 0.7,
    product: {
      title: '开启你的好运',
      description: '参与抽奖，有机会免单或低价购。',
      image: '',
    },
    qrcode: {
      wechat: '',
      payment: '',
    },
    adminPassword: 'ad123ad',
  };
}

function loadConfig(storage) {
  return loadFromLocalStorage(storage, STORAGE_KEYS.config, getDefaultConfig());
}

function saveConfig(storage, config) {
  saveToLocalStorage(storage, STORAGE_KEYS.config, config);
}

function loadOrders(storage) {
  return loadFromLocalStorage(storage, STORAGE_KEYS.orders, []);
}

function saveOrders(storage, orders) {
  saveToLocalStorage(storage, STORAGE_KEYS.orders, orders);
}

function loadMessages(storage) {
  return loadFromLocalStorage(storage, STORAGE_KEYS.messages, []);
}

function saveMessages(storage, messages) {
  saveToLocalStorage(storage, STORAGE_KEYS.messages, messages);
}

function loadLocks(storage) {
  return loadFromLocalStorage(storage, STORAGE_KEYS.locks, {});
}

function saveLocks(storage, locks) {
  saveToLocalStorage(storage, STORAGE_KEYS.locks, locks);
}

function setUserLock(storage, userId) {
  const locks = loadLocks(storage);
  locks[userId] = true;
  saveLocks(storage, locks);
}

function clearUserLock(storage, userId) {
  const locks = loadLocks(storage);
  delete locks[userId];
  saveLocks(storage, locks);
}

function isUserLocked(storage, userId) {
  const locks = loadLocks(storage);
  return Boolean(locks[userId]);
}

const storageExports = {
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
};

if (typeof module !== 'undefined' && module.exports) {
  module.exports = storageExports;
}

if (typeof window !== 'undefined') {
  window.Storage = storageExports;
}
