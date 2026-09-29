import { expect, test, type APIRequestContext } from '@playwright/test';

async function createSession(request: APIRequestContext): Promise<string> {
  const response = await request.post('lab/session?expiresIn=120', {
    headers: { 'X-Lab-Mode': 'header' },
  });
  expect(response.status()).toBe(201);
  return (await response.json()).data.sessionId as string;
}

test('API-created product appears in the filtered Store catalogue and reset removes it', async ({
  request,
}) => {
  const session = await createSession(request);
  const headers = { 'X-Lab-Session': session };
  const created = await request.post('products', {
    headers,
    data: {
      id: 'prd-store-created',
      name: 'API Seeded Test Beacon',
      sku: 'STORE-API-54',
      category: 'Electronics',
      price: 4803,
      stock: 7,
      rating: 5,
      currency: 'INR',
    },
  });
  expect(created.status()).toBe(201);
  const catalogue = await request.get(
    'store/catalog?q=Test%20Beacon&category=Electronics&minPrice=4000&maxPrice=5000&rating=5&sort=price-asc',
    { headers },
  );
  expect(catalogue.status()).toBe(200);
  const body = await catalogue.json();
  expect(body.data).toHaveLength(1);
  expect(body.data[0]).toMatchObject({
    id: 'prd-store-created',
    sku: 'STORE-API-54',
    category: 'Electronics',
    price: 4803,
  });
  expect(body.data[0].images).toHaveLength(3);
  expect(body.data[0].reviews).toHaveLength(2);
  expect(
    (await request.post('store/reset', { headers, data: {} })).status(),
  ).toBe(200);
  const afterReset = await request.get('store/catalog?q=Test%20Beacon', {
    headers,
  });
  expect((await afterReset.json()).data).toEqual([]);
});

test('cart quantities, coupons, and session isolation are deterministic', async ({
  request,
}) => {
  const session = await createSession(request);
  const headers = { 'X-Lab-Session': session };
  const secondSession = await createSession(request);
  const added = await request.post('store/cart/items', {
    headers,
    data: {
      productId: 'prd-002',
      quantity: 2,
      variant: 'Midnight / Single',
    },
  });
  expect(added.status()).toBe(201);
  expect((await added.json()).data).toMatchObject({ itemCount: 2 });
  const isolated = await request.get('store/cart', {
    headers: { 'X-Lab-Session': secondSession },
  });
  expect((await isolated.json()).data.items).toEqual([]);
  const updated = await request.patch('store/cart/items/prd-002', {
    headers,
    data: { quantity: 3 },
  });
  expect((await updated.json()).data.itemCount).toBe(3);
  const valid = await request.post('store/cart/coupon', {
    headers,
    data: { code: 'TESTHEON10' },
  });
  expect(valid.status()).toBe(200);
  const validCart = (await valid.json()).data;
  expect(validCart.coupon).toBe('TESTHEON10');
  expect(validCart.discount).toBeCloseTo(validCart.subtotal * 0.1, 2);
  expect(
    (
      await request.post('store/cart/coupon', {
        headers,
        data: { code: 'EXPIRED20' },
      })
    ).status(),
  ).toBe(409);
  expect(
    (
      await request.post('store/cart/coupon', {
        headers,
        data: { code: 'INVALID' },
      })
    ).status(),
  ).toBe(404);
  const removed = await request.delete('store/cart/items/prd-002', {
    headers,
  });
  expect((await removed.json()).data.items).toEqual([]);
});

test('one-shot store failures, malformed JSON, and empty arrays are consumed once', async ({
  request,
}) => {
  const session = await createSession(request);
  const headers = { 'X-Lab-Session': session };
  await request.post('store/scenario', { headers, data: { scenario: '500' } });
  const failed = await request.get('store/catalog?limit=1', { headers });
  expect(failed.status()).toBe(500);
  expect((await failed.json()).error.code).toBe('STORE_SIMULATED_500');
  expect(
    (await request.get('store/catalog?limit=1', { headers })).status(),
  ).toBe(200);

  await request.post('store/scenario', {
    headers,
    data: { scenario: 'malformed' },
  });
  const malformed = await request.get('store/catalog?limit=1', { headers });
  expect(malformed.status()).toBe(200);
  expect(await malformed.text()).toBe('{"data":');

  await request.post('store/scenario', {
    headers,
    data: { scenario: 'empty' },
  });
  const empty = await request.get('store/catalog?limit=1', { headers });
  expect((await empty.json()).data).toEqual([]);
  const scenarioState = await request.get('store/scenario', { headers });
  expect(scenarioState.status()).toBe(200);
  expect((await scenarioState.json()).data.next).toBeNull();
});

test('API registration logs in through checkout and UI order is API-verifiable and deletable', async ({
  request,
}) => {
  const session = await createSession(request);
  const headers = { 'X-Lab-Session': session };
  const registered = await request.post('auth/register', {
    headers,
    data: {
      username: 'store_shopper',
      displayName: 'Store Shopper',
      email: 'store.shopper@practice.test',
      password: 'StorePractice@54',
    },
  });
  expect(registered.status()).toBe(201);
  expect(
    (
      await request.post('auth/login', {
        headers,
        data: {
          username: 'store_shopper',
          password: 'StorePractice@54',
          rememberMe: false,
          idleSeconds: 300,
        },
      })
    ).status(),
  ).toBe(200);
  await request.post('store/cart/items', {
    headers,
    data: {
      productId: 'prd-002',
      quantity: 1,
      variant: 'Testheon violet / Single',
    },
  });
  const checkout = await request.post('store/checkout', {
    headers,
    data: {
      address: {
        fullName: 'Store Shopper',
        line1: '54 Practice Road',
        country: 'India',
        state: 'Maharashtra',
        city: 'Pune',
        postalCode: '411001',
      },
      shippingMethod: 'standard',
      payment: {
        cardNumber: '4242424242424242',
        expiry: '12/30',
        cvc: '123',
      },
    },
  });
  expect(checkout.status()).toBe(201);
  const result = (await checkout.json()).data;
  expect(result.payment).toEqual({
    processor: null,
    mode: 'fake-test-card',
    charged: false,
  });
  const orderId = result.order.id as string;
  const verified = await request.get(`orders/${orderId}`, { headers });
  expect(verified.status()).toBe(200);
  expect((await verified.json()).data).toMatchObject({
    id: orderId,
    status: 'confirmed',
  });
  const history = await request.get('store/orders', { headers });
  expect(
    (await history.json()).data.map((order: { id: string }) => order.id),
  ).toContain(orderId);
  expect(
    (await request.delete(`orders/${orderId}`, { headers })).status(),
  ).toBe(204);
  const afterDelete = await request.get('store/orders', { headers });
  expect((await afterDelete.json()).data).toEqual([]);
});

test('checkout rejects the fake decline card without creating an order', async ({
  request,
}) => {
  const session = await createSession(request);
  const headers = { 'X-Lab-Session': session };
  await request.post('auth/login', {
    headers,
    data: {
      username: 'standard_user',
      password: 'Practice@123',
      rememberMe: false,
      idleSeconds: 300,
    },
  });
  await request.post('store/cart/items', {
    headers,
    data: { productId: 'prd-002', quantity: 1, variant: 'Cloud / Single' },
  });
  const declined = await request.post('store/checkout', {
    headers,
    data: {
      address: {
        fullName: 'Standard Customer',
        line1: '48 Practice Avenue',
        country: 'India',
        state: 'Maharashtra',
        city: 'Pune',
        postalCode: '411001',
      },
      shippingMethod: 'express',
      payment: {
        cardNumber: '4000000000000002',
        expiry: '12/30',
        cvc: '123',
      },
    },
  });
  expect(declined.status()).toBe(422);
  expect((await declined.json()).error.code).toBe('PAYMENT_DECLINED');
  expect(
    (await (await request.get('store/orders', { headers })).json()).data,
  ).toEqual([]);
});
