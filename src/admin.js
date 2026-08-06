(function (root, factory) {
  if (typeof module === 'object' && module.exports) {
    module.exports = factory();
  } else {
    root.Admin = factory();
  }
})(typeof self !== 'undefined' ? self : this, function () {
  function escapeHtml(value) {
    if (value == null) return '';
    return String(value)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  function renderOrderList(document, orders) {
    const tbody = document.querySelector('#ordersTable tbody');
    if (!tbody) return;
    tbody.innerHTML = '';
    orders.forEach((order) => {
      const row = document.createElement('tr');
      row.innerHTML = `
        <td>${escapeHtml(order.id)}</td>
        <td>${escapeHtml(order.contact.name)}</td>
        <td>${escapeHtml(order.phone || order.contact.phone)}</td>
        <td>${escapeHtml(String(order.number))}</td>
        <td>${escapeHtml(order.status)}</td>
        <td><button data-order-id="${escapeHtml(order.id)}" class="confirm-payment-button">确认付款</button></td>
      `;
      tbody.appendChild(row);
    });
  }

  function renderMessages(document, messages) {
    const tbody = document.querySelector('#messagesTable tbody');
    if (!tbody) return;
    tbody.innerHTML = '';
    messages.forEach((message) => {
      const row = document.createElement('tr');
      row.innerHTML = `
        <td>${escapeHtml(message.id)}</td>
        <td>${escapeHtml(message.text)}</td>
        <td><button data-message-id="${escapeHtml(message.id)}" class="delete-message-button">删除</button></td>
      `;
      tbody.appendChild(row);
    });
  }

  function initializeAdmin(document, deps) {
    const adminButton = document.querySelector('#adminOpen');
    const adminModal = document.querySelector('#adminModal');
    const orderSection = document.querySelector('#orderSection');
    const messageSection = document.querySelector('#messageSection');
    const loginForm = document.querySelector('#adminLoginForm');
    const adminPasswordInput = document.querySelector('#adminPasswordInput');
    const loginError = document.querySelector('#adminLoginError');
    const configTitle = document.querySelector('#configTitle');
    const configDescription = document.querySelector('#configDescription');
    const configSave = document.querySelector('#configSave');

    function renderConfig(config) {
      if (configTitle) configTitle.value = config.product.title;
      if (configDescription) configDescription.value = config.product.description;
    }

    function refreshOrders() {
      renderOrderList(document, deps.storage.loadOrders());
    }

    function refreshMessages() {
      renderMessages(document, deps.storage.loadMessages());
    }

    function openAdmin() {
      if (adminModal) adminModal.style.display = 'block';
      renderConfig(deps.storage.loadConfig());
      refreshOrders();
      refreshMessages();
    }

    function closeAdmin() {
      if (adminModal) adminModal.style.display = 'none';
    }

    function handleLogin(event) {
      event.preventDefault();
      const password = adminPasswordInput.value;
      const config = deps.storage.loadConfig();
      if (password !== config.adminPassword) {
        if (loginError) {
          loginError.textContent = '密码错误';
          loginError.style.display = 'block';
        }
        return;
      }
      if (loginError) loginError.style.display = 'none';
      openAdmin();
    }

    function handleSaveConfig() {
      const config = deps.storage.loadConfig();
      config.product.title = configTitle.value;
      config.product.description = configDescription.value;
      deps.storage.saveConfig(config);
      if (deps.onConfigSaved) deps.onConfigSaved(config);
    }

    function handleOrderAction(event) {
      const target = event.target;
      if (!target.matches('.confirm-payment-button')) return;
      const orderId = target.dataset.orderId;
      const orders = deps.storage.loadOrders();
      const order = orders.find((item) => item.id === orderId);
      if (!order) return;
      order.status = 'paid';
      deps.storage.saveOrders(orders);
      if (deps.storage.clearUserLock) {
        deps.storage.clearUserLock(order.userId);
      }
      refreshOrders();
    }

    function handleMessageDelete(event) {
      const target = event.target;
      if (!target.matches('.delete-message-button')) return;
      const messageId = target.dataset.messageId;
      const messages = deps.storage.loadMessages().filter((item) => item.id !== messageId);
      deps.storage.saveMessages(messages);
      refreshMessages();
    }

    if (adminButton) {
      adminButton.addEventListener('click', () => {
        if (loginForm) loginForm.style.display = 'block';
      });
    }
    if (loginForm) {
      loginForm.addEventListener('submit', handleLogin);
    }
    if (configSave) {
      configSave.addEventListener('click', handleSaveConfig);
    }
    if (orderSection) {
      orderSection.addEventListener('click', handleOrderAction);
    }
    if (messageSection) {
      messageSection.addEventListener('click', handleMessageDelete);
    }

    return {
      openAdmin,
      closeAdmin,
      refreshOrders,
      refreshMessages,
    };
  }

  return {
    renderOrderList,
    renderMessages,
    initializeAdmin,
  };
});
