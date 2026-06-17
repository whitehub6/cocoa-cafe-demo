import './style.css';

// State Management
let cart = [];

// Load cart from LocalStorage
function loadCart() {
  const savedCart = localStorage.getItem('cocoa_cart');
  if (savedCart) {
    try {
      cart = JSON.parse(savedCart);
    } catch (e) {
      cart = [];
    }
  }
  updateCartUI();
}

// Save cart to LocalStorage
function saveCart() {
  localStorage.setItem('cocoa_cart', JSON.stringify(cart));
}

// Add Item to Cart
function addToCart(id, name, price) {
  const existingItemIndex = cart.findIndex(item => item.id === id);
  if (existingItemIndex > -1) {
    cart[existingItemIndex].quantity += 1;
  } else {
    cart.push({ id, name, price: parseFloat(price), quantity: 1 });
  }
  
  saveCart();
  updateCartUI();
  showToast(`${name} added to cart`);
}

// Update Item Quantity
function updateQuantity(id, change) {
  const itemIndex = cart.findIndex(item => item.id === id);
  if (itemIndex > -1) {
    cart[itemIndex].quantity += change;
    if (cart[itemIndex].quantity <= 0) {
      cart.splice(itemIndex, 1);
    }
    saveCart();
    updateCartUI();
  }
}

// Remove Item from Cart
function removeFromCart(id) {
  const itemIndex = cart.findIndex(item => item.id === id);
  if (itemIndex > -1) {
    const itemName = cart[itemIndex].name;
    cart.splice(itemIndex, 1);
    saveCart();
    updateCartUI();
    showToast(`${itemName} removed`);
  }
}

// Update Cart Badge and Drawer UI
function updateCartUI() {
  const cartBadge = document.getElementById('cartBadge');
  const cartItemsList = document.getElementById('cartItemsList');
  const cartTotalAmount = document.getElementById('cartTotalAmount');
  const checkoutTotalAmount = document.getElementById('checkoutTotalAmount');
  const checkoutBtn = document.getElementById('checkoutBtn');
  
  // Total item count
  const totalCount = cart.reduce((sum, item) => sum + item.quantity, 0);
  if (cartBadge) {
    cartBadge.textContent = totalCount;
  }
  
  // Calculate Subtotal
  const totalAmount = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  if (cartTotalAmount) {
    cartTotalAmount.textContent = `₹${totalAmount}`;
  }
  if (checkoutTotalAmount) {
    checkoutTotalAmount.textContent = `₹${totalAmount}`;
  }

  // Toggle checkout button state
  if (checkoutBtn) {
    checkoutBtn.disabled = cart.length === 0;
  }

  // Populate drawer items
  if (cartItemsList) {
    if (cart.length === 0) {
      cartItemsList.innerHTML = '<li class="empty-cart-message">Your cart is currently empty.</li>';
    } else {
      cartItemsList.innerHTML = cart.map(item => `
        <li class="cart-item">
          <div class="cart-item-info">
            <span class="cart-item-name">${item.name}</span>
            <span class="cart-item-price">₹${item.price} &times; ${item.quantity}</span>
          </div>
          <div class="cart-item-actions">
            <div class="quantity-control">
              <button class="btn-qty-minus" data-id="${item.id}">-</button>
              <span>${item.quantity}</span>
              <button class="btn-qty-plus" data-id="${item.id}">+</button>
            </div>
            <button class="btn-remove-item" data-id="${item.id}" aria-label="Remove item">&times;</button>
          </div>
        </li>
      `).join('');

      // Add listeners to new controls inside the list
      cartItemsList.querySelectorAll('.btn-qty-minus').forEach(btn => {
        btn.addEventListener('click', () => updateQuantity(btn.dataset.id, -1));
      });
      cartItemsList.querySelectorAll('.btn-qty-plus').forEach(btn => {
        btn.addEventListener('click', () => updateQuantity(btn.dataset.id, 1));
      });
      cartItemsList.querySelectorAll('.btn-remove-item').forEach(btn => {
        btn.addEventListener('click', () => removeFromCart(btn.dataset.id));
      });
    }
  }
}

// Show Toast Alert
function showToast(message) {
  const toast = document.getElementById('cocoaToast');
  if (toast) {
    toast.textContent = message;
    toast.classList.add('show');
    
    // Clear previous timeout if exists
    if (toast.timeoutId) {
      clearTimeout(toast.timeoutId);
    }
    
    toast.timeoutId = setTimeout(() => {
      toast.classList.remove('show');
    }, 2500);
  }
}

// Toggles Cart Drawer
const cartTrigger = document.getElementById('cartTrigger');
const closeCart = document.getElementById('closeCart');
const cartDrawer = document.getElementById('cartDrawer');
const cartBackdrop = document.getElementById('cartBackdrop');

function toggleCartDrawer() {
  if (cartDrawer && cartBackdrop) {
    cartDrawer.classList.toggle('show');
    cartBackdrop.classList.toggle('show');
  }
}

if (cartTrigger) cartTrigger.addEventListener('click', toggleCartDrawer);
if (closeCart) closeCart.addEventListener('click', toggleCartDrawer);
if (cartBackdrop) cartBackdrop.addEventListener('click', toggleCartDrawer);

// Checkout Modal Toggles
const checkoutBtn = document.getElementById('checkoutBtn');
const closeCheckout = document.getElementById('closeCheckout');
const checkoutModal = document.getElementById('checkoutModal');

function toggleCheckoutModal(show = true) {
  if (checkoutModal) {
    if (show) {
      checkoutModal.classList.add('show');
      // Close drawer if open
      if (cartDrawer) {
        cartDrawer.classList.remove('show');
        cartBackdrop.classList.remove('show');
      }
    } else {
      checkoutModal.classList.remove('show');
      // Reset forms back to normal view
      document.getElementById('checkoutFormStep').style.display = 'block';
      document.getElementById('checkoutReceiptStep').style.display = 'none';
    }
  }
}

if (checkoutBtn) checkoutBtn.addEventListener('click', () => toggleCheckoutModal(true));
if (closeCheckout) closeCheckout.addEventListener('click', () => toggleCheckoutModal(false));

// Toggle Address field based on pickup/delivery select
const orderOption = document.getElementById('orderOption');
const deliveryAddressGroup = document.getElementById('deliveryAddressGroup');
const orderAddress = document.getElementById('orderAddress');

if (orderOption && deliveryAddressGroup && orderAddress) {
  orderOption.addEventListener('change', () => {
    if (orderOption.value === 'pickup') {
      deliveryAddressGroup.style.display = 'none';
      orderAddress.removeAttribute('required');
    } else {
      deliveryAddressGroup.style.display = 'flex';
      orderAddress.setAttribute('required', 'required');
    }
  });
}

// Handle Order Form Submission
const orderForm = document.getElementById('orderForm');
const checkoutFormStep = document.getElementById('checkoutFormStep');
const checkoutReceiptStep = document.getElementById('checkoutReceiptStep');

if (orderForm && checkoutFormStep && checkoutReceiptStep) {
  orderForm.addEventListener('submit', (e) => {
    e.preventDefault();

    const name = document.getElementById('orderName').value;
    const phone = document.getElementById('orderPhone').value;
    const option = document.getElementById('orderOption').value;
    const address = orderAddress ? orderAddress.value : '';
    const notes = document.getElementById('orderNotes').value;
    
    // Calculate total order amount
    const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const orderNo = Math.floor(Math.random() * 90000) + 10000;
    const dateStr = new Date().toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });

    // Build items rows for invoice receipt
    const itemsHtml = cart.map(item => `
      <tr>
        <td>${item.name} &times; ${item.quantity}</td>
        <td>₹${item.price * item.quantity}</td>
      </tr>
    `).join('');

    // Inject invoice template
    checkoutReceiptStep.innerHTML = `
      <div class="receipt-icon">✓</div>
      <h3>Merci! <span>/ Thank You</span></h3>
      <p class="lead">Your order proposal has been sent to our cafe in Virar. We will call you to confirm.</p>
      
      <div class="retro-invoice">
        <div class="invoice-header">
          <div class="invoice-title">COCOÁ</div>
          <div class="invoice-meta">
            <span>Order No: #${orderNo}</span>
            <span>Date: ${dateStr}</span>
          </div>
        </div>
        
        <div class="invoice-details-box">
          <div>
            <h5>Client</h5>
            <p>${name}</p>
            <p>${phone}</p>
          </div>
          <div>
            <h5>Delivery Method</h5>
            <p>${option === 'pickup' ? 'Self-Pickup at Cafe' : 'Home Delivery'}</p>
            <p>${option === 'delivery' ? address : 'Virar West, Mumbai'}</p>
          </div>
        </div>

        <table class="invoice-items">
          <thead>
            <tr>
              <th>Item & Qty</th>
              <th>Amount</th>
            </tr>
          </thead>
          <tbody>
            ${itemsHtml}
          </tbody>
        </table>

        <div class="invoice-totals">
          <div class="invoice-total-row">
            <span>Subtotal</span>
            <span>₹${subtotal}</span>
          </div>
          <div class="invoice-total-row">
            <span>Delivery Fee</span>
            <span>${option === 'delivery' ? '₹30' : '₹0'}</span>
          </div>
          <div class="invoice-total-row grand-total">
            <span>Grand Total</span>
            <span>₹${option === 'delivery' ? subtotal + 30 : subtotal}</span>
          </div>
        </div>
        
        ${notes ? `
          <div style="margin-top: 1.5rem; font-size: 0.8rem; border-top: 1px dashed var(--color-border-muted); padding-top: 0.75rem;">
            <h5>Instructions:</h5>
            <p style="font-style: italic; color: var(--color-text-secondary);">${notes}</p>
          </div>
        ` : ''}
      </div>

      <button class="btn-primary-diner" id="closeReceiptBtn">Close & Done</button>
    `;

    // Clear cart state
    cart = [];
    saveCart();
    updateCartUI();

    // Toggle steps
    checkoutFormStep.style.display = 'none';
    checkoutReceiptStep.style.display = 'block';

    // Add Close Event listener to receipt button
    const closeReceiptBtn = document.getElementById('closeReceiptBtn');
    if (closeReceiptBtn) {
      closeReceiptBtn.addEventListener('click', () => {
        toggleCheckoutModal(false);
      });
    }
  });
}

// Add to Cart event delegator for the dynamic menu additions
document.body.addEventListener('click', (e) => {
  const target = e.target;
  if (target.classList.contains('btn-add-to-cart') || target.classList.contains('btn-add-to-cart-small')) {
    const id = target.dataset.id;
    const name = target.dataset.name;
    const price = target.dataset.price;
    if (id && name && price) {
      addToCart(id, name, price);
    }
  }
});

// Scroll reveal animations
function reveal() {
  const reveals = document.querySelectorAll('.reveal');
  const windowHeight = window.innerHeight;
  const elementVisible = 80;

  reveals.forEach(element => {
    const elementTop = element.getBoundingClientRect().top;
    if (elementTop < windowHeight - elementVisible) {
      element.classList.add('active');
    }
  });
}

window.addEventListener('scroll', reveal);

// Initial Load Actions
document.addEventListener('DOMContentLoaded', () => {
  loadCart();
  reveal();
});

// Fallback if DOMContentLoaded already fired
loadCart();
reveal();
