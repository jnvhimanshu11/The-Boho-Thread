// ============================================================
// LUXE STORE — checkout.js
// Multi-step checkout flow with validation
// ============================================================

import { getCart, getCartTotal, clearCart, formatPrice, showToast } from './store.js';
import { getCurrentUser } from './firebase-config.js';

let currentStep = 1;
let shippingData = {};
let paymentMethod = 'card';

document.addEventListener('DOMContentLoaded', () => {
  const items = Object.values(getCart()).filter(i => i.qty > 0);
  if (!items.length) {
    window.location.href = '../index.html';
    return;
  }

  prefillUserData();
  renderOrderSummary();
  initPaymentOptions();
  initStepButtons();
});

function prefillUserData() {
  const user = getCurrentUser();
  if (!user) return;
  const emailEl = document.getElementById('checkoutEmail');
  if (emailEl) emailEl.value = user.email || '';
  if (user.displayName) {
    const parts = user.displayName.split(' ');
    const firstEl = document.getElementById('firstName');
    const lastEl  = document.getElementById('lastName');
    if (firstEl) firstEl.value = parts[0] || '';
    if (lastEl)  lastEl.value  = parts.slice(1).join(' ') || '';
  }
}

function renderOrderSummary() {
  const items    = Object.values(getCart()).filter(i => i.qty > 0);
  const subtotal = getCartTotal();
  const gst      = Math.round(subtotal * 0.18);
  const shipping  = subtotal >= 999 ? 0 : 99;
  const total     = subtotal + gst + shipping;

  document.getElementById('osSummaryItems').innerHTML = items.map(item => `
    <div class="os-item">
      <span class="os-item-emoji">${item.emoji}</span>
      <div class="os-item-info">
        <div class="os-item-name">${item.name}</div>
        <div class="os-item-qty">Qty: ${item.qty}</div>
      </div>
      <div class="os-item-price">${formatPrice(item.price * item.qty)}</div>
    </div>`).join('');

  document.getElementById('osSubtotal').textContent = formatPrice(subtotal);
  document.getElementById('osShipping').textContent = shipping === 0 ? 'FREE' : formatPrice(shipping);
  document.getElementById('osGst').textContent      = formatPrice(gst);
  document.getElementById('osTotal').textContent    = formatPrice(total);
}

function initPaymentOptions() {
  document.querySelectorAll('.payment-option input').forEach(radio => {
    radio.addEventListener('change', (e) => {
      paymentMethod = e.target.value;
      document.querySelectorAll('.payment-option').forEach(opt => opt.classList.remove('active'));
      e.target.closest('.payment-option').classList.add('active');
      document.getElementById('cardFields').style.display = paymentMethod === 'card' ? '' : 'none';
      document.getElementById('upiFields').style.display  = paymentMethod === 'upi'  ? '' : 'none';
    });
  });
}

function initStepButtons() {
  // Step 1 → 2
  document.getElementById('nextToPayment')?.addEventListener('click', () => {
    if (!validateStep1()) return;
    collectShippingData();
    goToStep(2);
  });

  // Step 2 → 3
  document.getElementById('nextToConfirm')?.addEventListener('click', () => {
    if (!validateStep2()) return;
    populateConfirmStep();
    goToStep(3);
  });

  // Back buttons
  document.getElementById('backToDetails')?.addEventListener('click', () => goToStep(1));
  document.getElementById('backToPayment')?.addEventListener('click', () => goToStep(2));

  // Place Order
  document.getElementById('placeOrderBtn')?.addEventListener('click', placeOrder);
}

function goToStep(step) {
  currentStep = step;
  ['formStep1','formStep2','formStep3'].forEach((id, i) => {
    document.getElementById(id).style.display = (i + 1 === step) ? '' : 'none';
  });
  ['step2','step3'].forEach((id, i) => {
    const el = document.getElementById(id);
    if (el) el.classList.toggle('active', step > i + 1);
  });
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function validateStep1() {
  const required = ['firstName','lastName','checkoutEmail','checkoutPhone','address1','city','state','pinCode'];
  for (const id of required) {
    const el = document.getElementById(id);
    if (!el?.value.trim()) {
      el?.focus();
      showToast(`Please fill in all required fields`, 'error');
      el?.classList.add('input-error');
      setTimeout(() => el?.classList.remove('input-error'), 2000);
      return false;
    }
  }
  const pin = document.getElementById('pinCode')?.value;
  if (!/^\d{6}$/.test(pin)) { showToast('Please enter a valid 6-digit PIN code', 'error'); return false; }
  const email = document.getElementById('checkoutEmail')?.value;
  if (!/\S+@\S+\.\S+/.test(email)) { showToast('Please enter a valid email address', 'error'); return false; }
  return true;
}

function validateStep2() {
  if (paymentMethod === 'card') {
    const num = document.getElementById('cardNumber')?.value.replace(/\s/g, '');
    if (!num || num.length < 15) { showToast('Please enter a valid card number', 'error'); return false; }
    const exp = document.getElementById('cardExpiry')?.value;
    if (!exp || exp.length < 5) { showToast('Please enter a valid expiry date', 'error'); return false; }
    const cvv = document.getElementById('cardCvv')?.value;
    if (!cvv || cvv.length < 3) { showToast('Please enter a valid CVV', 'error'); return false; }
  }
  if (paymentMethod === 'upi') {
    const upi = document.getElementById('upiId')?.value.trim();
    if (!upi || !upi.includes('@')) { showToast('Please enter a valid UPI ID', 'error'); return false; }
  }
  return true;
}

function collectShippingData() {
  shippingData = {
    name:    `${document.getElementById('firstName')?.value} ${document.getElementById('lastName')?.value}`.trim(),
    email:   document.getElementById('checkoutEmail')?.value,
    phone:   document.getElementById('checkoutPhone')?.value,
    address: `${document.getElementById('address1')?.value}${document.getElementById('address2')?.value ? ', ' + document.getElementById('address2').value : ''}`,
    city:    document.getElementById('city')?.value,
    state:   document.getElementById('state')?.value,
    pin:     document.getElementById('pinCode')?.value,
  };
}

function populateConfirmStep() {
  document.getElementById('confirmAddress').innerHTML = `
    <strong>${shippingData.name}</strong><br/>
    ${shippingData.address}<br/>
    ${shippingData.city}, ${shippingData.state} - ${shippingData.pin}<br/>
    📞 ${shippingData.phone}<br/>
    ✉️ ${shippingData.email}
  `;
  const payLabels = { card: '💳 Credit/Debit Card', upi: '📱 UPI', netbanking: '🏦 Net Banking', cod: '💵 Cash on Delivery' };
  document.getElementById('confirmPayment').textContent = payLabels[paymentMethod] || paymentMethod;

  const items = Object.values(getCart()).filter(i => i.qty > 0);
  document.getElementById('confirmItems').innerHTML = `
    <h4 style="margin-bottom:12px;font-family:var(--font-serif)">Items (${items.length})</h4>
    ${items.map(item => `
      <div style="display:flex;align-items:center;gap:12px;padding:10px 0;border-bottom:1px solid var(--border)">
        <span style="font-size:1.6rem">${item.emoji}</span>
        <div style="flex:1"><div style="font-weight:600;font-size:0.9rem">${item.name}</div><div style="font-size:0.82rem;color:var(--text-muted)">Qty: ${item.qty}</div></div>
        <div style="font-weight:600;color:var(--accent)">${formatPrice(item.price * item.qty)}</div>
      </div>`).join('')}
  `;
}

function placeOrder() {
  if (!document.getElementById('termsCheck')?.checked) {
    showToast('Please agree to the Terms of Service', 'error'); return;
  }
  const btn = document.getElementById('placeOrderBtn');
  btn.textContent = 'Processing…';
  btn.disabled = true;

  // Simulate payment processing
  setTimeout(() => {
    const items    = Object.values(getCart()).filter(i => i.qty > 0);
    const subtotal = getCartTotal();
    const gst      = Math.round(subtotal * 0.18);
    const shipping  = subtotal >= 999 ? 0 : 99;

    const orderId = 'ORD-' + Date.now();
    const orders  = JSON.parse(localStorage.getItem('luxe_orders') || '[]');
    orders.unshift({
      id:      orderId,
      items:   items.map(i => ({ id: i.id, name: i.name, emoji: i.emoji, price: i.price, qty: i.qty })),
      total:   subtotal + gst + shipping,
      shipping: shippingData,
      payment:  paymentMethod,
      date:    new Date().toISOString(),
      status:  'Processing'
    });
    localStorage.setItem('luxe_orders', JSON.stringify(orders.slice(0, 50)));
    clearCart();

    // Show success
    document.getElementById('checkoutPage').style.display = 'none';
    document.getElementById('checkoutSuccess').style.display = '';
    document.getElementById('successOrderId').textContent = orderId;
  }, 2000);
}

// Card formatting helpers
window.formatCardNumber = (input) => {
  let v = input.value.replace(/\D/g, '').substring(0, 16);
  input.value = v.replace(/(.{4})/g, '$1 ').trim();
};
window.formatExpiry = (input) => {
  let v = input.value.replace(/\D/g, '').substring(0, 4);
  if (v.length >= 2) v = v.substring(0, 2) + ' / ' + v.substring(2);
  input.value = v;
};
