type JsonRecord = Record<string, unknown>;

export {};

class StoreApiError extends Error {
  status: number;
  code: string;

  constructor(status: number, code: string, message: string) {
    super(message);
    this.status = status;
    this.code = code;
  }
}

const root = document.querySelector<HTMLElement>('[data-store-page]');
if (!root) throw new Error('Missing Testheon Store root.');

const pageName = root.dataset.storePage ?? 'home';
const visualStable =
  new URLSearchParams(location.search).get('visual') === 'stable';
if (visualStable) document.documentElement.dataset.visualMode = 'stable';

let csrfToken = '';

function element<T extends Element>(selector: string): T {
  const found = document.querySelector<T>(selector);
  if (!found) throw new Error(`Missing store element: ${selector}`);
  return found;
}

function optional<T extends Element>(selector: string): T | null {
  return document.querySelector<T>(selector);
}

function escapeHtml(value: unknown): string {
  return String(value ?? '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}

function money(value: unknown): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(Number(value ?? 0));
}

function errorMessage(error: unknown): string {
  if (error instanceof StoreApiError) {
    return `${error.code} (${error.status}): ${error.message}`;
  }
  if (error instanceof DOMException && error.name === 'AbortError') {
    return 'REQUEST_TIMEOUT: the frontend stopped waiting after 3.5 seconds.';
  }
  return error instanceof Error ? error.message : 'Unknown store error';
}

async function api(
  path: string,
  options: RequestInit & { mutation?: boolean; timeoutMs?: number } = {},
): Promise<JsonRecord> {
  const controller = new AbortController();
  const timeout = window.setTimeout(
    () => controller.abort(),
    options.timeoutMs ?? 3500,
  );
  const headers = new Headers(options.headers);
  headers.set('Accept', 'application/json');
  if (options.body) headers.set('Content-Type', 'application/json');
  if (options.mutation) headers.set('X-Lab-CSRF', csrfToken);
  try {
    const response = await fetch(`/practice/api/v1/${path}`, {
      ...options,
      credentials: 'same-origin',
      headers,
      signal: controller.signal,
    });
    const raw = await response.text();
    let payload: JsonRecord;
    try {
      payload = raw === '' ? {} : (JSON.parse(raw) as JsonRecord);
    } catch {
      throw new StoreApiError(
        response.status,
        'MALFORMED_JSON',
        'The response body was not valid JSON.',
      );
    }
    if (!response.ok) {
      const detail = payload.error as JsonRecord | undefined;
      throw new StoreApiError(
        response.status,
        String(detail?.code ?? 'REQUEST_FAILED'),
        String(detail?.message ?? `Request returned ${response.status}`),
      );
    }
    return payload;
  } finally {
    window.clearTimeout(timeout);
  }
}

async function ensureSession(): Promise<void> {
  const payload = await api('lab/session');
  const data = payload.data as JsonRecord;
  csrfToken = String(data.csrfToken ?? '');
  element<HTMLElement>('#store-global-status').textContent = visualStable
    ? 'Isolated sandbox ready · visual mode stable'
    : 'Isolated sandbox ready · live deterministic mode';
}

function productCard(product: JsonRecord, index = 0): string {
  const images = product.images as JsonRecord[] | undefined;
  const image = images?.[0] ?? {};
  return `<article class="store-product-card" data-product-id="${escapeHtml(product.id)}">
    <a class="store-product-card__image" href="/practice/apps/ecommerce/product/?id=${encodeURIComponent(String(product.id))}">
      <img src="${escapeHtml(image.src)}" alt="${escapeHtml(image.alt)}" width="480" height="320" loading="${index < 3 ? 'eager' : 'lazy'}" decoding="async" />
    </a>
    <div class="store-product-card__body">
      <p class="card__eyebrow">${escapeHtml(product.category)} · ${escapeHtml(product.rating)} ★</p>
      <h3><a href="/practice/apps/ecommerce/product/?id=${encodeURIComponent(String(product.id))}">${escapeHtml(product.name)}</a></h3>
      <p>${escapeHtml(product.summary)}</p>
      <div class="store-product-card__footer"><strong>${money(product.price)}</strong><span>${Number(product.stock) > 0 ? `${escapeHtml(product.stock)} in stock` : 'Out of stock'}</span></div>
      <button class="fixture-button" type="button" data-add-product="${escapeHtml(product.id)}" ${Number(product.stock) < 1 ? 'disabled' : ''}>Add to cart</button>
    </div>
  </article>`;
}

async function addToCart(
  productId: string,
  quantity = 1,
  variant = 'Testheon violet / Single',
): Promise<void> {
  const payload = await api('store/cart/items', {
    method: 'POST',
    mutation: true,
    body: JSON.stringify({ productId, quantity, variant }),
  });
  updateCartCount(payload.data as JsonRecord);
  element<HTMLElement>('#store-global-status').textContent =
    `${productId} added to the session cart.`;
}

function bindAddButtons(container: ParentNode): void {
  for (const button of container.querySelectorAll<HTMLButtonElement>(
    '[data-add-product]',
  )) {
    button.addEventListener('click', async () => {
      button.disabled = true;
      try {
        await addToCart(button.dataset.addProduct ?? '');
        button.textContent = 'Added';
      } catch (error) {
        element<HTMLElement>('#store-global-status').textContent =
          errorMessage(error);
        button.disabled = false;
      }
    });
  }
}

function updateCartCount(cart: JsonRecord): void {
  optional<HTMLElement>('#store-cart-count')?.replaceChildren(
    document.createTextNode(String(cart.itemCount ?? 0)),
  );
}

async function refreshCartCount(): Promise<void> {
  try {
    const payload = await api('store/cart');
    const data = payload.data;
    if (data && !Array.isArray(data)) updateCartCount(data as JsonRecord);
  } catch {
    updateCartCount({ itemCount: 0 });
  }
}

async function initHome(): Promise<void> {
  const featured = element<HTMLElement>('#store-featured');
  try {
    const payload = await api('store/catalog?featured=1&limit=6');
    const products = payload.data as JsonRecord[];
    featured.innerHTML = products.length
      ? products.map(productCard).join('')
      : '<p class="store-empty">No products returned. This is an assertion-ready empty state.</p>';
    bindAddButtons(featured);
  } catch (error) {
    featured.innerHTML = `<p class="store-error" role="alert">${escapeHtml(errorMessage(error))}</p>`;
  }

  element<HTMLButtonElement>('#store-reset').addEventListener(
    'click',
    async () => {
      try {
        await api('store/reset', {
          method: 'POST',
          mutation: true,
          body: '{}',
        });
        element<HTMLElement>('#store-global-status').textContent =
          'Store products, orders, cart, coupon and scenarios reset to seed data.';
        await refreshCartCount();
        await initHomeProductsOnly(featured);
      } catch (error) {
        element<HTMLElement>('#store-global-status').textContent =
          errorMessage(error);
      }
    },
  );

  let armed = '';
  for (const button of document.querySelectorAll<HTMLButtonElement>(
    '[data-store-scenario]',
  )) {
    button.addEventListener('click', async () => {
      try {
        armed = button.dataset.storeScenario ?? '';
        await api('store/scenario', {
          method: 'POST',
          mutation: true,
          body: JSON.stringify({ scenario: armed }),
        });
        element<HTMLElement>('#store-scenario-result').textContent =
          `${armed} armed for the next store GET request.`;
      } catch (error) {
        element<HTMLElement>('#store-scenario-result').textContent =
          errorMessage(error);
      }
    });
  }
  element<HTMLButtonElement>('#run-store-scenario').addEventListener(
    'click',
    async () => {
      const output = element<HTMLElement>('#store-scenario-result');
      output.textContent = `Running ${armed || 'unmodified'} catalogue request…`;
      try {
        const payload = await api('store/catalog?limit=1');
        const data = payload.data as unknown[];
        output.textContent =
          data.length === 0
            ? 'EMPTY_ARRAY: the UI received no products and remains usable.'
            : `200: received ${data.length} product after the one-shot scenario.`;
      } catch (error) {
        output.textContent = errorMessage(error);
      } finally {
        armed = '';
      }
    },
  );
}

async function initHomeProductsOnly(container: HTMLElement): Promise<void> {
  const payload = await api('store/catalog?featured=1&limit=6');
  const products = payload.data as JsonRecord[];
  container.innerHTML = products.map(productCard).join('');
  bindAddButtons(container);
}

async function initProducts(): Promise<void> {
  const form = element<HTMLFormElement>('#store-filter-form');
  const list = element<HTMLElement>('#store-product-list');
  const status = element<HTMLElement>('#store-list-status');
  const category = element<HTMLSelectElement>('#store-category');
  const range = element<HTMLInputElement>('#store-max-price');
  const output = element<HTMLOutputElement>('#store-max-output');
  const url = new URL(location.href);
  let currentPage = Number(url.searchParams.get('page') ?? 1);
  let pageCount = 1;
  if (url.searchParams.get('category'))
    category.dataset.initial = url.searchParams.get('category') ?? '';

  const load = async (): Promise<void> => {
    status.textContent = 'Loading filtered catalogue…';
    const data = new FormData(form);
    const params = new URLSearchParams();
    for (const [key, value] of data.entries()) {
      if (String(value) !== '') params.set(key, String(value));
    }
    params.set('page', String(currentPage));
    params.set('limit', '12');
    try {
      const payload = await api(`store/catalog?${params}`);
      const products = payload.data as JsonRecord[];
      const meta = payload.meta as JsonRecord;
      pageCount = Number(meta.pages ?? 1);
      if (category.options.length === 1) {
        for (const name of meta.categories as string[])
          category.add(new Option(name, name));
        category.value = category.dataset.initial ?? '';
        if (category.value) return load();
      }
      list.innerHTML = products.length
        ? products.map(productCard).join('')
        : '<p class="store-empty">No products match these filters.</p>';
      bindAddButtons(list);
      status.textContent = `${meta.total} products match · page ${meta.page} of ${meta.pages}.`;
      element<HTMLElement>('#store-page-label').textContent =
        `Page ${meta.page} of ${meta.pages}`;
      element<HTMLButtonElement>('#store-prev-page').disabled =
        currentPage <= 1;
      element<HTMLButtonElement>('#store-next-page').disabled =
        currentPage >= pageCount;
    } catch (error) {
      list.innerHTML = `<p class="store-error" role="alert">${escapeHtml(errorMessage(error))}</p>`;
      status.textContent = 'Catalogue request failed visibly.';
    }
  };

  range.addEventListener('input', () => (output.textContent = range.value));
  form.addEventListener('submit', (event) => {
    event.preventDefault();
    currentPage = 1;
    void load();
  });
  element<HTMLButtonElement>('#store-prev-page').addEventListener(
    'click',
    () => {
      currentPage = Math.max(1, currentPage - 1);
      void load();
    },
  );
  element<HTMLButtonElement>('#store-next-page').addEventListener(
    'click',
    () => {
      currentPage = Math.min(pageCount, currentPage + 1);
      void load();
    },
  );
  await load();
}

async function initProduct(): Promise<void> {
  const container = element<HTMLElement>('#store-product-detail');
  const id = new URL(location.href).searchParams.get('id') ?? 'prd-001';
  try {
    const payload = await api(`store/products/${encodeURIComponent(id)}`);
    const product = payload.data as JsonRecord;
    const images = product.images as JsonRecord[];
    const variants = product.variants as JsonRecord[];
    const reviews = product.reviews as JsonRecord[];
    container.innerHTML = `<div class="store-gallery">${images.map((image, index) => `<img src="${escapeHtml(image.src)}" alt="${escapeHtml(image.alt)}" width="640" height="420" loading="${index === 0 ? 'eager' : 'lazy'}" decoding="async" ${index === 0 ? 'data-primary-image="true"' : ''} />`).join('')}</div>
      <div class="store-detail__content"><p class="eyebrow">${escapeHtml(product.category)} · ${escapeHtml(product.sku)}</p><h1>${escapeHtml(product.name)}</h1><p class="store-price">${money(product.price)}</p><p>${escapeHtml(product.summary)}</p><p class="store-stock">${Number(product.stock) > 0 ? `${escapeHtml(product.stock)} units in stock` : 'Out of stock'}</p>
      <form id="store-add-form" class="store-panel store-add-form"><div><label for="product-variant">Variant</label><select id="product-variant" name="variant">${(variants[0]?.values as string[]).map((value) => `<option>${escapeHtml(value)} / Single</option>`).join('')}</select></div><div><label for="product-quantity">Quantity</label><input id="product-quantity" name="quantity" type="number" min="1" max="20" value="1" /></div><button class="button button--primary" type="submit">Add to cart</button><p id="product-add-result" class="result" role="status">Not added yet.</p></form>
      <section aria-labelledby="reviews-title"><h2 id="reviews-title">Fictional sample reviews</h2><div class="store-reviews">${reviews.map((review) => `<article><h3>${escapeHtml(review.author)} · ${escapeHtml(review.rating)} ★</h3><p>${escapeHtml(review.text)}</p></article>`).join('')}</div></section></div>`;
    element<HTMLFormElement>('#store-add-form').addEventListener(
      'submit',
      async (event) => {
        event.preventDefault();
        const form = new FormData(event.currentTarget as HTMLFormElement);
        try {
          await addToCart(
            id,
            Number(form.get('quantity')),
            String(form.get('variant')),
          );
          element<HTMLElement>('#product-add-result').textContent =
            'Added to the session cart.';
        } catch (error) {
          element<HTMLElement>('#product-add-result').textContent =
            errorMessage(error);
        }
      },
    );
  } catch (error) {
    container.innerHTML = `<div><p class="eyebrow">Product details</p><h1>Product unavailable</h1><p class="store-error" role="alert">${escapeHtml(errorMessage(error))}</p></div>`;
  }
}

function cartMarkup(cart: JsonRecord): string {
  const items = cart.items as JsonRecord[];
  if (!items.length)
    return '<p class="store-empty">Your session cart is empty.</p>';
  return `<div class="table-wrap"><table aria-label="Shopping cart"><thead><tr><th>Product</th><th>Variant</th><th>Quantity</th><th>Line total</th><th>Action</th></tr></thead><tbody>${items.map((item) => `<tr data-cart-product="${escapeHtml(item.productId)}"><th scope="row">${escapeHtml(item.name)}</th><td>${escapeHtml(item.variant)}</td><td><label class="sr-only" for="qty-${escapeHtml(item.productId)}">Quantity for ${escapeHtml(item.name)}</label><input id="qty-${escapeHtml(item.productId)}" data-cart-quantity="${escapeHtml(item.productId)}" type="number" min="1" max="20" value="${escapeHtml(item.quantity)}" /></td><td>${money(item.lineTotal)}</td><td><button class="button button--quiet" type="button" data-cart-remove="${escapeHtml(item.productId)}">Remove</button></td></tr>`).join('')}</tbody></table></div><dl class="store-totals"><div><dt>Subtotal</dt><dd>${money(cart.subtotal)}</dd></div><div><dt>Coupon ${escapeHtml(cart.coupon ?? 'None')}</dt><dd>−${money(cart.discount)}</dd></div><div><dt>Total</dt><dd>${money(cart.total)}</dd></div></dl>`;
}

async function initCart(): Promise<void> {
  const container = element<HTMLElement>('#store-cart');
  const load = async (): Promise<void> => {
    try {
      const payload = await api('store/cart');
      const cart = payload.data as JsonRecord;
      container.innerHTML = cartMarkup(cart);
      updateCartCount(cart);
      for (const input of container.querySelectorAll<HTMLInputElement>(
        '[data-cart-quantity]',
      )) {
        input.addEventListener('change', async () => {
          try {
            const payload = await api(
              `store/cart/items/${encodeURIComponent(input.dataset.cartQuantity ?? '')}`,
              {
                method: 'PATCH',
                mutation: true,
                body: JSON.stringify({ quantity: Number(input.value) }),
              },
            );
            container.innerHTML = cartMarkup(payload.data as JsonRecord);
            await load();
          } catch (error) {
            element<HTMLElement>('#store-global-status').textContent =
              errorMessage(error);
          }
        });
      }
      for (const button of container.querySelectorAll<HTMLButtonElement>(
        '[data-cart-remove]',
      )) {
        button.addEventListener('click', async () => {
          try {
            await api(
              `store/cart/items/${encodeURIComponent(button.dataset.cartRemove ?? '')}`,
              { method: 'DELETE', mutation: true },
            );
            await load();
          } catch (error) {
            element<HTMLElement>('#store-global-status').textContent =
              errorMessage(error);
          }
        });
      }
    } catch (error) {
      container.innerHTML = `<p class="store-error" role="alert">${escapeHtml(errorMessage(error))}</p>`;
    }
  };
  element<HTMLFormElement>('#store-coupon-form').addEventListener(
    'submit',
    async (event) => {
      event.preventDefault();
      const code = String(
        new FormData(event.currentTarget as HTMLFormElement).get('code'),
      );
      try {
        await api('store/cart/coupon', {
          method: 'POST',
          mutation: true,
          body: JSON.stringify({ code }),
        });
        element<HTMLElement>('#store-coupon-result').textContent =
          'TESTHEON10 applied: 10% discount.';
        await load();
      } catch (error) {
        element<HTMLElement>('#store-coupon-result').textContent =
          errorMessage(error);
      }
    },
  );
  await load();
}

async function initCheckout(): Promise<void> {
  const loginPanel = element<HTMLElement>('#checkout-login-panel');
  const loginForm = element<HTMLFormElement>('#checkout-login-form');
  const loginButton = element<HTMLButtonElement>(
    '#checkout-login-form button[type="submit"]',
  );
  const form = element<HTMLFormElement>('#store-checkout-form');
  const checkoutButton = element<HTMLButtonElement>(
    '#store-checkout-form button[type="submit"]',
  );
  const summary = element<HTMLElement>('#checkout-summary');
  const renderSummary = async (): Promise<void> => {
    const payload = await api('store/cart');
    const cart = payload.data as JsonRecord;
    const items = cart.items as JsonRecord[];
    summary.innerHTML = `<h2>Order summary</h2>${items.length ? `<ul>${items.map((item) => `<li><span>${escapeHtml(item.name)} × ${escapeHtml(item.quantity)}</span><strong>${money(item.lineTotal)}</strong></li>`).join('')}</ul><p><strong>Cart total ${money(cart.total)}</strong></p>` : '<p class="store-empty">Your cart is empty.</p>'}`;
    updateCartCount(cart);
  };
  const revealCheckout = (): void => {
    loginPanel.hidden = true;
    form.hidden = false;
  };
  loginForm.addEventListener('submit', async (event) => {
    event.preventDefault();
    const values = Object.fromEntries(
      new FormData(event.currentTarget as HTMLFormElement).entries(),
    );
    try {
      await api('auth/login', {
        method: 'POST',
        mutation: true,
        body: JSON.stringify({
          ...values,
          rememberMe: false,
          idleSeconds: 300,
        }),
      });
      element<HTMLElement>('#checkout-login-result').textContent =
        'Signed in; guest cart preserved.';
      revealCheckout();
    } catch (error) {
      element<HTMLElement>('#checkout-login-result').textContent =
        errorMessage(error);
    }
  });
  loginButton.disabled = false;

  await renderSummary();
  try {
    await api('auth/me');
    revealCheckout();
  } catch {
    element<HTMLElement>('#checkout-login-result').textContent =
      'Sign in with a public practice account; your guest cart stays intact.';
  }

  const locations = (await api('store/locations')).data as Record<
    string,
    Record<string, string[]>
  >;
  const country = element<HTMLSelectElement>('#checkout-country');
  const state = element<HTMLSelectElement>('#checkout-state');
  const city = element<HTMLSelectElement>('#checkout-city');
  for (const name of Object.keys(locations))
    country.add(new Option(name, name));
  country.addEventListener('change', () => {
    state.replaceChildren(new Option('Select state', ''));
    city.replaceChildren(new Option('Select city', ''));
    city.disabled = true;
    for (const name of Object.keys(locations[country.value] ?? {}))
      state.add(new Option(name, name));
    state.disabled = country.value === '';
  });
  state.addEventListener('change', () => {
    city.replaceChildren(new Option('Select city', ''));
    for (const name of locations[country.value]?.[state.value] ?? [])
      city.add(new Option(name, name));
    city.disabled = state.value === '';
  });
  country.value = 'India';
  country.dispatchEvent(new Event('change'));
  state.value = 'Maharashtra';
  state.dispatchEvent(new Event('change'));
  city.value = 'Pune';

  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    const data = new FormData(form);
    const body = {
      address: {
        fullName: data.get('fullName'),
        line1: data.get('line1'),
        country: data.get('country'),
        state: data.get('state'),
        city: data.get('city'),
        postalCode: data.get('postalCode'),
      },
      shippingMethod: data.get('shippingMethod'),
      payment: {
        cardNumber: data.get('cardNumber'),
        expiry: data.get('expiry'),
        cvc: data.get('cvc'),
      },
    };
    try {
      const payload = await api('store/checkout', {
        method: 'POST',
        mutation: true,
        body: JSON.stringify(body),
      });
      const checkout = payload.data as JsonRecord;
      sessionStorage.setItem('testheon:lastOrder', JSON.stringify(checkout));
      const order = checkout.order as JsonRecord;
      location.assign(
        `/practice/apps/ecommerce/confirmation/?order=${encodeURIComponent(String(order.id))}${visualStable ? '&visual=stable' : ''}`,
      );
    } catch (error) {
      element<HTMLElement>('#checkout-result').textContent =
        errorMessage(error);
    }
  });
  checkoutButton.disabled = false;
}

function confirmationMarkup(checkout: JsonRecord): string {
  const order = checkout.order as JsonRecord;
  const date = visualStable
    ? '15 Oct 2026, 9:30 AM IST'
    : new Date(String(order.createdAt)).toLocaleString('en-IN');
  return `<p class="eyebrow">Fake order confirmation</p><h1>Practice order confirmed</h1><p class="lede">No payment processor was contacted and no money was charged.</p><dl class="store-confirmation__facts"><div><dt>Order ID</dt><dd data-testid="confirmed-order-id">${escapeHtml(order.id)}</dd></div><div><dt>Status</dt><dd>${escapeHtml(order.status)}</dd></div><div><dt>Total</dt><dd>${money(order.total)}</dd></div><div><dt>Placed</dt><dd>${escapeHtml(date)}</dd></div></dl><div class="hero__actions"><a class="button button--primary" href="/practice/apps/ecommerce/orders/">View order history</a><a class="button button--secondary" href="/practice/apps/ecommerce/products/">Continue practising</a></div>`;
}

async function initConfirmation(): Promise<void> {
  const container = element<HTMLElement>('#store-confirmation');
  const stored = sessionStorage.getItem('testheon:lastOrder');
  if (stored) {
    container.innerHTML = confirmationMarkup(JSON.parse(stored) as JsonRecord);
    return;
  }
  const id = new URL(location.href).searchParams.get('order');
  if (!id) {
    container.innerHTML =
      '<p class="eyebrow">Fake order confirmation</p><h1>No recent order</h1><p class="store-empty">Complete the practice checkout to create an order ID.</p>';
    return;
  }
  try {
    const payload = await api(`orders/${encodeURIComponent(id)}`);
    container.innerHTML = confirmationMarkup({ order: payload.data });
  } catch (error) {
    container.innerHTML = `<p class="eyebrow">Fake order confirmation</p><h1>Order unavailable</h1><p class="store-error">${escapeHtml(errorMessage(error))}</p>`;
  }
}

async function initOrders(): Promise<void> {
  const container = element<HTMLElement>('#store-orders');
  const load = async (): Promise<void> => {
    try {
      const payload = await api('store/orders');
      const orders = payload.data as JsonRecord[];
      container.innerHTML = orders.length
        ? `<table aria-label="Order history"><thead><tr><th>Order ID</th><th>Status</th><th>Items</th><th>Total</th><th>Created</th></tr></thead><tbody>${orders.map((order) => `<tr><th scope="row"><code>${escapeHtml(order.id)}</code></th><td>${escapeHtml(order.status)}</td><td>${(order.items as unknown[]).length}</td><td>${money(order.total)}</td><td>${escapeHtml(visualStable ? '15 Oct 2026' : new Date(String(order.createdAt)).toLocaleDateString('en-IN'))}</td></tr>`).join('')}</tbody></table>`
        : '<p class="store-empty">No practice orders for this signed-in customer.</p>';
    } catch (error) {
      container.innerHTML = `<p class="store-error" role="alert">${escapeHtml(errorMessage(error))} <a href="/practice/apps/ecommerce/checkout/">Sign in at checkout</a>.</p>`;
    }
  };
  element<HTMLButtonElement>('#store-refresh-orders').addEventListener(
    'click',
    () => void load(),
  );
  await load();
}

async function initProfile(): Promise<void> {
  const container = element<HTMLElement>('#store-profile');
  try {
    const payload = await api('store/profile');
    const data = payload.data as JsonRecord;
    const user = data.user as JsonRecord;
    container.innerHTML = `<p class="eyebrow">Authenticated through ${escapeHtml(data.authentication)}</p><h2>${escapeHtml(user.displayName)}</h2><dl class="auth-facts"><div><dt>Username</dt><dd>${escapeHtml(user.username)}</dd></div><div><dt>Role</dt><dd>${escapeHtml(user.role)}</dd></div><div><dt>Synthetic email</dt><dd>${escapeHtml(user.email)}</dd></div><div><dt>Practice orders</dt><dd>${escapeHtml(data.orderCount)}</dd></div></dl>`;
  } catch (error) {
    container.innerHTML = `<h2>Sign-in required</h2><p class="store-error" role="alert">${escapeHtml(errorMessage(error))}</p>`;
  }
}

async function start(): Promise<void> {
  try {
    await ensureSession();
    await refreshCartCount();
    if (pageName === 'home') await initHome();
    if (pageName === 'products' && optional('#store-filter-form'))
      await initProducts();
    if (pageName === 'products' && optional('#store-product-detail'))
      await initProduct();
    if (pageName === 'cart' && optional('#store-cart')) await initCart();
    if (pageName === 'cart' && optional('#store-checkout-form'))
      await initCheckout();
    if (pageName === 'cart' && optional('#store-confirmation'))
      await initConfirmation();
    if (pageName === 'orders') await initOrders();
    if (pageName === 'profile') await initProfile();
  } catch (error) {
    element<HTMLElement>('#store-global-status').textContent =
      errorMessage(error);
  }
}

void start();
