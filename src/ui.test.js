const ui = require('./ui');

describe('UI helpers', () => {
  test('validateContactInfo rejects missing fields', () => {
    const result = ui.validateContactInfo({ name: '', phone: '', address: '' });
    expect(result.valid).toBe(false);
    expect(result.errors.name).toBeDefined();
    expect(result.errors.phone).toBeDefined();
    expect(result.errors.address).toBeDefined();
  });

  test('validateContactInfo accepts valid contact', () => {
    const result = ui.validateContactInfo({ name: '张三', phone: '13800138000', address: '北京' });
    expect(result.valid).toBe(true);
    expect(result.errors).toEqual({});
  });

  test('getResultType returns odd or even metadata', () => {
    const odd = ui.getResultType(3);
    expect(odd.isOdd).toBe(true);
    expect(odd.badge).toContain('奇数');
    const even = ui.getResultType(4);
    expect(even.isOdd).toBe(false);
    expect(even.badge).toContain('偶数');
  });

  test('createOrder stores contact safely and sets status', () => {
    const order = ui.createOrder(5, { name: '张三', phone: '138', address: '地址' }, 'user');
    expect(order.number).toBe(5);
    expect(order.userId).toBe('user');
    expect(order.status).toBe('pending-payment');
    expect(order.contact.name).toBe('张三');
  });
});

describe('UI initialization and interaction', () => {
  let document;
  let storage;
  let lottery;

  beforeEach(() => {
    document = global.document.implementation.createHTMLDocument('测试');
    document.body.innerHTML = `
      <div id="productTitle"></div>
      <div id="productDescription"></div>
      <button id="drawButton">点击抽奖</button>
      <form id="contactForm" style="display:none;">
        <input id="nameInput" />
        <input id="phoneInput" />
        <input id="addressInput" />
        <button type="submit">提交</button>
      </form>
      <div id="resultModal" style="display:none;">
        <div id="resultNumber"></div>
      </div>
      <div id="paymentModal" style="display:none;"></div>
      <div id="formErrors" style="display:none;"></div>
      <div id="lockWarning" style="display:none;"></div>
      <div id="paymentSection"></div>
    `;
    const orders = [];
    const locks = {};
    storage = {
      loadOrders: () => orders,
      saveOrders: (value) => {
        orders.splice(0, orders.length, ...value);
      },
      isUserLocked: () => Boolean(locks['user1']),
      setUserLock: () => {
        locks['user1'] = true;
      },
    };
    lottery = { pickLotteryNumber: () => 8 };
  });

  test('click draw shows contact form when not locked', () => {
    const config = { product: { title: '活动', description: '说明' }, qrcode: {}, oddProbability: 0.7 };
    ui.initializeApp(document, { storage, lottery, config, userId: 'user1' });
    document.getElementById('drawButton').click();
    expect(document.getElementById('contactForm').style.display).toBe('block');
    expect(document.getElementById('paymentModal').style.display).toBe('none');
  });

  test('click draw when locked shows payment modal', () => {
    storage.isUserLocked = () => true;
    const config = { product: { title: '活动', description: '说明' }, qrcode: {}, oddProbability: 0.7 };
    ui.initializeApp(document, { storage, lottery, config, userId: 'user1' });
    document.getElementById('drawButton').click();
    expect(document.getElementById('paymentModal').style.display).toBe('block');
    expect(document.getElementById('lockWarning').style.display).toBe('block');
  });

  test('submitting contact form saves order and shows result', () => {
    const config = { product: { title: '活动', description: '说明' }, qrcode: { wechat: 'wechat', payment: 'payment' }, oddProbability: 0.7 };
    ui.initializeApp(document, { storage, lottery, config, userId: 'user1' });
    document.getElementById('drawButton').click();
    document.getElementById('nameInput').value = '张三';
    document.getElementById('phoneInput').value = '13800138000';
    document.getElementById('addressInput').value = '地址';
    const event = new Event('submit', { bubbles: true, cancelable: true });
    document.getElementById('contactForm').dispatchEvent(event);
    expect(storage.loadOrders()).toHaveLength(1);
    expect(document.getElementById('resultModal').style.display).toBe('block');
  });
});
