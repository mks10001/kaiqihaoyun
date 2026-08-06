const admin = require('./admin');

describe('admin functions', () => {
  let document;
  let storage;
  let deps;

  beforeEach(() => {
    document = global.document.implementation.createHTMLDocument('admin');
    document.body.innerHTML = `
      <button id="adminOpen"></button>
      <div id="adminModal" style="display:none;"></div>
      <form id="adminLoginForm" style="display:block;"><input id="adminPasswordInput" value="" /><button type="submit">登录</button></form>
      <div id="adminLoginError" style="display:none;"></div>
      <input id="configTitle" value="" />
      <input id="configDescription" value="" />
      <button id="configSave"></button>
      <div id="orderSection"></div>
      <table id="ordersTable"><tbody></tbody></table>
      <div id="messageSection"></div>
      <table id="messagesTable"><tbody></tbody></table>
    `;
    const config = { product: { title: 'test', description: 'desc' }, adminPassword: 'ad123ad' };
    const orders = [];
    const messages = [];
    const locks = {};
    storage = {
      loadConfig: jest.fn(() => config),
      saveConfig: jest.fn(),
      loadOrders: jest.fn(() => orders),
      saveOrders: jest.fn((value) => {
        orders.splice(0, orders.length, ...value);
      }),
      loadMessages: jest.fn(() => messages),
      saveMessages: jest.fn((value) => {
        messages.splice(0, messages.length, ...value);
      }),
      clearUserLock: jest.fn((userId) => {
        delete locks[userId];
      }),
    };
    deps = { storage };
  });

  test('login with wrong password shows error', () => {
    const state = admin.initializeAdmin(document, deps);
    document.getElementById('adminPasswordInput').value = 'wrong';
    const event = new Event('submit', { bubbles: true, cancelable: true });
    document.getElementById('adminLoginForm').dispatchEvent(event);
    expect(document.getElementById('adminLoginError').style.display).toBe('block');
  });

  test('save config updates storage and calls callback', () => {
    let savedConfig;
    deps.onConfigSaved = (config) => {
      savedConfig = config;
    };
    const state = admin.initializeAdmin(document, deps);
    document.getElementById('configTitle').value = 'new title';
    document.getElementById('configDescription').value = 'new desc';
    document.getElementById('configSave').click();
    expect(storage.saveConfig).toHaveBeenCalled();
    expect(savedConfig.product.title).toBe('new title');
  });

  test('confirm payment updates order and clears lock', () => {
    const orders = [{ id: 'o1', userId: 'user1', status: 'pending-payment' }];
    storage.loadOrders.mockReturnValue(orders);
    const state = admin.initializeAdmin(document, deps);
    const button = document.createElement('button');
    button.dataset.orderId = 'o1';
    button.className = 'confirm-payment-button';
    document.getElementById('orderSection').appendChild(button);
    button.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    expect(orders[0].status).toBe('paid');
    expect(storage.saveOrders).toHaveBeenCalled();
    expect(storage.clearUserLock).toHaveBeenCalledWith('user1');
  });

  test('delete message removes message from storage', () => {
    const messages = [{ id: 'm1', text: 'hello' }];
    storage.loadMessages.mockReturnValue(messages);
    storage.saveMessages = jest.fn((value) => {
      messages.splice(0, messages.length, ...value);
    });
    const state = admin.initializeAdmin(document, deps);
    const button = document.createElement('button');
    button.dataset.messageId = 'm1';
    button.className = 'delete-message-button';
    document.getElementById('messageSection').appendChild(button);
    button.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    expect(storage.saveMessages).toHaveBeenCalled();
    expect(messages.length).toBe(0);
  });
});
