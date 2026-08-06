(function (root, factory) {
  if (typeof module === 'object' && module.exports) {
    module.exports = factory();
  } else {
    root.UI = factory();
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

  function validateContactInfo(contact) {
    const errors = {};
    if (!contact || !contact.name || !contact.name.trim()) {
      errors.name = '姓名不能为空';
    }
    if (!contact || !contact.phone || !contact.phone.trim()) {
      errors.phone = '手机号不能为空';
    }
    if (!contact || !contact.address || !contact.address.trim()) {
      errors.address = '详细地址不能为空';
    }
    return {
      valid: Object.keys(errors).length === 0,
      errors,
    };
  }

  function getResultType(number) {
    const isOdd = number % 2 === 1;
    return {
      number,
      isOdd,
      title: isOdd ? '恭喜您抽中奇数，进入付费流程' : '恭喜您抽中偶数，免单领取',
      description: isOdd
        ? '请填写信息并完成支付，管理员确认后解除锁定。'
        : '请填写信息以领取免单资格。',
      badge: isOdd ? '奇数购' : '偶数免单',
    };
  }

  function createOrder(number, contact, userId) {
    const isOdd = number % 2 === 1;
    return {
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`,
      userId,
      number,
      isOdd,
      contact: {
        name: escapeHtml(contact.name),
        phone: escapeHtml(contact.phone),
        address: escapeHtml(contact.address),
      },
      status: isOdd ? 'pending-payment' : 'free',
      createdAt: new Date().toISOString(),
    };
  }

  function query(document, selector) {
    return document.querySelector(selector);
  }

  function showElement(element) {
    if (element) element.style.display = 'block';
  }

  function hideElement(element) {
    if (element) element.style.display = 'none';
  }

  function setText(element, text) {
    if (element) element.textContent = text;
  }

  function renderProduct(document, config) {
    setText(query(document, '#productTitle'), config.product.title || '开奖活动');
    setText(query(document, '#productDescription'), config.product.description || '参与抽奖');
  }

  function renderResult(document, result, config) {
    setText(query(document, '#resultNumber'), String(result.number));
    setText(query(document, '#resultTitle'), result.title);
    setText(query(document, '#resultDescription'), result.description);
    setText(query(document, '#resultBadge'), result.badge);
    setText(query(document, '#wechatQrcodeText'), config.qrcode.wechat || '请扫描微信二维码');
    setText(query(document, '#paymentQrcodeText'), result.isOdd ? config.qrcode.payment || '请扫描付款二维码' : '');
    if (result.isOdd) {
      showElement(query(document, '#paymentSection'));
    } else {
      hideElement(query(document, '#paymentSection'));
    }
    showElement(query(document, '#resultModal'));
  }

  function initializeApp(document, deps) {
    const drawButton = query(document, '#drawButton');
    const contactForm = query(document, '#contactForm');
    const paymentModal = query(document, '#paymentModal');
    const resultModal = query(document, '#resultModal');
    const errorList = query(document, '#formErrors');
    const lockWarning = query(document, '#lockWarning');
    let currentNumber = null;

    renderProduct(document, deps.config);

    function displayErrors(errors) {
      if (!errorList) return;
      errorList.innerHTML = '';
      Object.values(errors).forEach((message) => {
        const item = document.createElement('li');
        item.textContent = message;
        errorList.appendChild(item);
      });
      showElement(errorList);
    }

    function clearErrors() {
      if (!errorList) return;
      errorList.innerHTML = '';
      hideElement(errorList);
    }

    function handleLocked() {
      setText(lockWarning, '您当前已被锁定，请先完成付款或联系管理员解除锁定。');
      showElement(lockWarning);
      showElement(paymentModal);
    }

    function handleDraw() {
      clearErrors();
      if (deps.storage.isUserLocked(deps.userId)) {
        handleLocked();
        return;
      }
      currentNumber = deps.lottery.pickLotteryNumber(deps.config.oddProbability);
      showElement(contactForm);
    }

    function handleFormSubmit(event) {
      event.preventDefault();
      const contact = {
        name: query(document, '#nameInput').value,
        phone: query(document, '#phoneInput').value,
        address: query(document, '#addressInput').value,
      };
      const validation = validateContactInfo(contact);
      if (!validation.valid) {
        displayErrors(validation.errors);
        return;
      }
      const order = createOrder(currentNumber, contact, deps.userId);
      const orders = deps.storage.loadOrders();
      orders.push(order);
      deps.storage.saveOrders(orders);
      if (order.isOdd) {
        deps.storage.setUserLock(deps.userId);
      }
      renderResult(document, getResultType(order.number), deps.config);
      hideElement(contactForm);
    }

    if (drawButton) {
      drawButton.addEventListener('click', handleDraw);
    }
    if (contactForm) {
      contactForm.addEventListener('submit', handleFormSubmit);
    }
  }

  return {
    escapeHtml,
    validateContactInfo,
    getResultType,
    createOrder,
    renderProduct,
    renderResult,
    initializeApp,
  };
});
