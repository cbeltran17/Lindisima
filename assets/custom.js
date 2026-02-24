document.addEventListener('click', function (e) {
  const btn = e.target.closest('.home-collection-add-to-cart');
  if (!btn || btn.classList.contains('disabled')) return;

  const variantId = btn.dataset.variantId;
  if (!variantId) return;

  btn.classList.add('loading');
  btn.disabled = true;

  fetch('/cart/add.js', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    },
    body: JSON.stringify({
      id: variantId,
      quantity: 1
    })
  })
  .then(() => fetch('/cart.js'))
  .then(res => res.json())
  .then(cart => {
    updateMiniCart(cart);
  })
  .catch(err => console.error(err))
  .finally(() => {
    btn.classList.remove('loading');
    btn.disabled = false;
  });
});

/* -------------------------
  MINI CART UPDATE
-------------------------- */

function updateMiniCart(cart) {
  // Cart count
  const countEl = document.querySelector('.cart-count-number');
  if (countEl) countEl.textContent = cart.item_count;

  // Subtotal
  const subtotalEl = document.querySelector('[data-total-price]');
  if (subtotalEl) subtotalEl.textContent = formatMoney(cart.total_price);

  // Mini cart wrapper
  const miniCart = document.querySelector('.mini-cart');
  const itemsWrapper = document.querySelector('.mini-cart-item-wrapper');

  if (!miniCart || !itemsWrapper) return;

  miniCart.classList.remove('empty');

  // Remove old product items (keep subtotal block)
  itemsWrapper.querySelectorAll('.mini-cart-item:not(.cart-subtotal)')
    .forEach(el => el.remove());

  // Add products
  cart.items.forEach(item => {
    const itemHTML = `
      <article class="mini-cart-item"
        data-variant="${item.variant_id}"
        data-url="${item.url}"
        data-title="${item.product_title}">

        <figure class="mini-cart-item-image">
          <a href="${item.url}">
            <img src="${item.image}" alt="${item.product_title}">
          </a>
        </figure>

        <div class="mini-cart-item-details">
          <p class="mini-cart-item-quantity">
            Qty: <span>${item.quantity}</span>
          </p>

          <p class="mini-cart-item-title">
            <a href="${item.url}">
              ${item.product_title}
            </a>
          </p>

          <p class="mini-cart-item-price">
            <span class="final-price money">
              ${formatMoney(item.final_line_price)}
            </span>
          </p>
        </div>
      </article>
    `;

    itemsWrapper.insertAdjacentHTML('afterbegin', itemHTML);
  });
}

/* -------------------------
  MONEY FORMAT
-------------------------- */
function formatMoney(cents) {
  return (cents / 100).toLocaleString(undefined, {
    style: 'currency',
    currency: Shopify.currency.active
  });
}
