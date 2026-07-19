/* =========================================================================
   LUDOVICE Storefront — shared behaviour
   Cart state lives in localStorage so it persists across the 8 pages.
   ========================================================================= */

const LUDOVICE_CART_KEY = 'ludovice_cart_v1';

const Cart = {
  read() {
    try {
      return JSON.parse(localStorage.getItem(LUDOVICE_CART_KEY)) || [];
    } catch (e) { return []; }
  },
  save(items) {
    localStorage.setItem(LUDOVICE_CART_KEY, JSON.stringify(items));
    Cart.refreshBadge();
  },
  add(product, qty = 1) {
    const items = Cart.read();
    const existing = items.find(i => i.id === product.id);
    if (existing) { existing.qty += qty; }
    else {
      items.push({
        id: product.id, name: product.name, price: product.price,
        img: product.img, category: product.categoryLabel, qty
      });
    }
    Cart.save(items);
    toast(`${product.name} added to your order`);
  },
  remove(id) {
    Cart.save(Cart.read().filter(i => i.id !== id));
  },
  setQty(id, qty) {
    const items = Cart.read();
    const it = items.find(i => i.id === id);
    if (it) { it.qty = Math.max(1, qty); }
    Cart.save(items);
  },
  clear() { Cart.save([]); },
  count() { return Cart.read().reduce((s, i) => s + i.qty, 0); },
  subtotal() { return Cart.read().reduce((s, i) => s + i.qty * i.price, 0); },
  refreshBadge() {
    document.querySelectorAll('[data-cart-count]').forEach(el => {
      el.textContent = Cart.count();
    });
  }
};

function money(n) {
  return '₱' + Number(n).toLocaleString('en-PH', { minimumFractionDigits: 0 });
}

function toast(msg) {
  let t = document.getElementById('ludo-toast');
  if (!t) {
    t = document.createElement('div');
    t.id = 'ludo-toast';
    t.className = 'toast';
    t.innerHTML = `<span class="dot"></span><span class="toast-msg"></span>`;
    document.body.appendChild(t);
  }
  t.querySelector('.toast-msg').textContent = msg;
  t.classList.add('show');
  clearTimeout(t._timer);
  t._timer = setTimeout(() => t.classList.remove('show'), 2600);
}

function initNav() {
  const toggle = document.querySelector('.nav__toggle');
  const links = document.querySelector('.nav__links');
  if (toggle && links) {
    toggle.addEventListener('click', () => {
      const open = links.style.display === 'flex';
      links.style.display = open ? 'none' : 'flex';
      links.style.cssText += open ? '' : 'position:absolute;top:100%;left:0;right:0;flex-direction:column;background:#0a0e27;padding:20px 28px;gap:18px;border-bottom:1px solid rgba(248,250,252,.12);';
    });
  }
}

function initReveal() {
  const els = document.querySelectorAll('.reveal');
  if (!els.length) return;
  const io = new IntersectionObserver((entries) => {
    entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('is-visible'); io.unobserve(e.target); } });
  }, { threshold: .15 });
  els.forEach(el => io.observe(el));
}

function starString(rating) {
  const full = Math.round(rating);
  return '★'.repeat(full) + '☆'.repeat(5 - full);
}

document.addEventListener('DOMContentLoaded', () => {
  Cart.refreshBadge();
  initNav();
  initReveal();

  // Year in footer
  document.querySelectorAll('[data-year]').forEach(el => el.textContent = new Date().getFullYear());
});
