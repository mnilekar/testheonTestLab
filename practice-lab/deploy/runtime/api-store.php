<?php
declare(strict_types=1);

const LAB_STORE_COUPON = 'TESTHEON10';
const LAB_STORE_VISUAL_DATE = '2026-10-15T09:30:00+05:30';

function lab_store_ensure_schema(PDO $pdo): void
{
    $pdo->exec('CREATE TABLE IF NOT EXISTS lab_store_cart (
        session_hash TEXT NOT NULL,
        product_id TEXT NOT NULL,
        quantity INTEGER NOT NULL,
        variant TEXT NOT NULL,
        added_at INTEGER NOT NULL,
        PRIMARY KEY (session_hash, product_id, variant),
        FOREIGN KEY (session_hash) REFERENCES lab_sessions(session_hash) ON DELETE CASCADE
    )');
    $pdo->exec('CREATE TABLE IF NOT EXISTS lab_store_state (
        session_hash TEXT PRIMARY KEY,
        coupon_code TEXT NOT NULL DEFAULT \'\',
        FOREIGN KEY (session_hash) REFERENCES lab_sessions(session_hash) ON DELETE CASCADE
    )');
    $pdo->exec('CREATE TABLE IF NOT EXISTS lab_store_scenarios (
        session_hash TEXT PRIMARY KEY,
        scenario TEXT NOT NULL,
        created_at INTEGER NOT NULL,
        FOREIGN KEY (session_hash) REFERENCES lab_sessions(session_hash) ON DELETE CASCADE
    )');
}

function lab_store_cleanup(PDO $pdo, int $now): void
{
    lab_store_ensure_schema($pdo);
    $delete = $pdo->prepare('DELETE FROM lab_store_scenarios WHERE created_at < ?');
    $delete->execute([$now - LAB_API_ABSOLUTE_TTL]);
}

function lab_store_reset_sandbox(PDO $pdo, string $sessionHash): void
{
    lab_store_ensure_schema($pdo);
    foreach (['lab_store_cart', 'lab_store_state', 'lab_store_scenarios'] as $table) {
        $delete = $pdo->prepare("DELETE FROM {$table} WHERE session_hash = ?");
        $delete->execute([$sessionHash]);
    }
}

function lab_store_read_string(array $body, string $field, string $requestId, int $max = 120): string
{
    $value = trim((string) ($body[$field] ?? ''));
    if ($value === '' || strlen($value) > $max) {
        lab_api_error($requestId, 422, 'VALIDATION_FAILED', 'The request contains invalid fields.', [
            ['field' => $field, 'issue' => "must contain 1-{$max} characters"],
        ]);
    }
    return $value;
}

function lab_store_product_art(string $category): string
{
    $slug = strtolower(preg_replace('/[^A-Za-z0-9]+/', '-', $category) ?? 'product');
    return '/practice/images/store/' . trim($slug, '-') . '.svg';
}

function lab_store_enrich_product(array $product): array
{
    $category = (string) ($product['category'] ?? 'Product');
    $seed = abs((int) crc32((string) $product['id']));
    $names = ['Aarav S.', 'Meera P.', 'Kabir N.', 'Isha R.'];
    return $product + [
        'summary' => 'A fictional ' . strtolower($category) . ' product prepared for deterministic ecommerce automation practice.',
        'images' => [
            ['src' => lab_store_product_art($category), 'alt' => (string) $product['name'] . ' front view'],
            ['src' => '/practice/images/store/product-detail.svg', 'alt' => (string) $product['name'] . ' detail view'],
            ['src' => '/practice/images/store/product-package.svg', 'alt' => (string) $product['name'] . ' practice packaging'],
        ],
        'variants' => [
            ['name' => 'Colour', 'values' => ['Testheon violet', 'Midnight', 'Cloud']],
            ['name' => 'Pack', 'values' => ['Single', 'Twin pack']],
        ],
        'reviews' => [
            ['author' => $names[$seed % count($names)], 'rating' => 5, 'text' => 'Predictable quality and a useful fictional review for locator practice.'],
            ['author' => $names[($seed + 1) % count($names)], 'rating' => 4, 'text' => 'The synthetic order arrived exactly when the test expected it.'],
        ],
    ];
}

function lab_store_catalog(PDO $pdo, array $session, array $seed, string $requestId): never
{
    $allowed = ['q', 'category', 'minPrice', 'maxPrice', 'rating', 'sort', 'page', 'limit', 'featured'];
    foreach (array_keys($_GET) as $parameter) {
        if (!in_array($parameter, $allowed, true)) {
            lab_api_error($requestId, 400, 'INVALID_PARAMETER', "Unknown store query parameter: {$parameter}.");
        }
    }
    $rows = array_values(lab_api_records($pdo, $session, $seed, 'products'));
    $query = trim((string) ($_GET['q'] ?? ''));
    $category = trim((string) ($_GET['category'] ?? ''));
    $minPrice = lab_api_parse_int('minPrice', 0, 0, 1000000, $requestId);
    $maxPrice = lab_api_parse_int('maxPrice', 1000000, 0, 1000000, $requestId);
    $rating = lab_api_parse_int('rating', 0, 0, 5, $requestId);
    if ($minPrice > $maxPrice) {
        lab_api_error($requestId, 422, 'VALIDATION_FAILED', 'Minimum price cannot exceed maximum price.', [['field' => 'minPrice']]);
    }
    $rows = array_values(array_filter($rows, static function (array $row) use ($query, $category, $minPrice, $maxPrice, $rating): bool {
        return ($query === '' || stripos((string) $row['name'] . ' ' . (string) $row['sku'], $query) !== false)
            && ($category === '' || strcasecmp((string) $row['category'], $category) === 0)
            && (float) $row['price'] >= $minPrice
            && (float) $row['price'] <= $maxPrice
            && (float) $row['rating'] >= $rating;
    }));
    $sort = (string) ($_GET['sort'] ?? 'featured');
    $sortMap = [
        'featured' => [['rating', -1], ['stock', -1]],
        'price-asc' => [['price', 1]],
        'price-desc' => [['price', -1]],
        'rating-desc' => [['rating', -1]],
        'name-asc' => [['name', 1]],
    ];
    if (!isset($sortMap[$sort])) {
        lab_api_error($requestId, 400, 'INVALID_PARAMETER', 'Unsupported store sort value.');
    }
    lab_api_sort_records($rows, $sortMap[$sort]);
    if (($_GET['featured'] ?? '') === '1') {
        $rows = array_slice($rows, 0, 6);
    }
    $total = count($rows);
    $page = lab_api_parse_int('page', 1, 1, 1000, $requestId);
    $limit = lab_api_parse_int('limit', 12, 1, 48, $requestId);
    $data = array_map('lab_store_enrich_product', array_slice($rows, ($page - 1) * $limit, $limit));
    $categories = array_values(array_unique(array_map(static fn (array $row): string => (string) $row['category'], array_values(lab_api_records($pdo, $session, $seed, 'products')))));
    sort($categories);
    lab_api_send([
        'data' => $data,
        'meta' => [
            'total' => $total,
            'page' => $page,
            'limit' => $limit,
            'pages' => max(1, (int) ceil($total / $limit)),
            'categories' => $categories,
            'currency' => 'INR',
        ],
        'requestId' => $requestId,
    ], 200, $requestId, ['X-Total-Count' => (string) $total]);
}

function lab_store_find_product(PDO $pdo, array $session, array $seed, string $id, string $requestId): array
{
    $products = lab_api_records($pdo, $session, $seed, 'products');
    if (!isset($products[$id])) {
        lab_api_error($requestId, 404, 'PRODUCT_NOT_FOUND', 'The requested practice product was not found.');
    }
    return lab_store_enrich_product($products[$id]);
}

function lab_store_cart(PDO $pdo, array $session, array $seed): array
{
    $products = lab_api_records($pdo, $session, $seed, 'products');
    $read = $pdo->prepare('SELECT product_id, quantity, variant FROM lab_store_cart WHERE session_hash = ? ORDER BY added_at, product_id');
    $read->execute([$session['hash']]);
    $items = [];
    $subtotal = 0.0;
    foreach ($read->fetchAll() as $row) {
        $product = $products[(string) $row['product_id']] ?? null;
        if (!is_array($product)) {
            continue;
        }
        $quantity = (int) $row['quantity'];
        $lineTotal = (float) $product['price'] * $quantity;
        $subtotal += $lineTotal;
        $items[] = [
            'productId' => (string) $product['id'],
            'name' => (string) $product['name'],
            'price' => (float) $product['price'],
            'quantity' => $quantity,
            'variant' => (string) $row['variant'],
            'stock' => (int) $product['stock'],
            'image' => lab_store_product_art((string) $product['category']),
            'lineTotal' => $lineTotal,
        ];
    }
    $state = $pdo->prepare('SELECT coupon_code FROM lab_store_state WHERE session_hash = ?');
    $state->execute([$session['hash']]);
    $coupon = (string) ($state->fetchColumn() ?: '');
    $discount = $coupon === LAB_STORE_COUPON ? round($subtotal * 0.10, 2) : 0.0;
    return [
        'items' => $items,
        'itemCount' => array_sum(array_column($items, 'quantity')),
        'subtotal' => $subtotal,
        'coupon' => $coupon === '' ? null : $coupon,
        'discount' => $discount,
        'total' => $subtotal - $discount,
        'currency' => 'INR',
    ];
}

function lab_store_identity(PDO $pdo, array $session, string $requestId): array
{
    lab_auth_ensure_schema($pdo);
    lab_auth_ensure_demo_users($pdo, (string) $session['hash']);
    return (array) lab_auth_resolve_identity($pdo, (string) $session['hash'], $requestId, true);
}

function lab_store_apply_scenario(PDO $pdo, array $session, string $requestId): void
{
    $read = $pdo->prepare('SELECT scenario FROM lab_store_scenarios WHERE session_hash = ?');
    $read->execute([$session['hash']]);
    $scenario = (string) ($read->fetchColumn() ?: '');
    if ($scenario === '') {
        return;
    }
    $delete = $pdo->prepare('DELETE FROM lab_store_scenarios WHERE session_hash = ?');
    $delete->execute([$session['hash']]);
    if ($scenario === 'timeout') {
        usleep(LAB_API_MAX_DELAY * 1000);
        lab_api_error($requestId, 503, 'SIMULATED_TIMEOUT', 'The deterministic store timeout completed after 10000 milliseconds.');
    }
    if ($scenario === 'malformed') {
        lab_api_common_headers($requestId);
        header('X-Practice-Scenario: malformed');
        http_response_code(200);
        echo '{"data":';
        exit;
    }
    if ($scenario === 'empty') {
        lab_api_send(['data' => [], 'meta' => ['scenario' => 'empty'], 'requestId' => $requestId], 200, $requestId);
    }
    $status = (int) $scenario;
    $headers = $status === 429 ? ['Retry-After' => '60'] : [];
    lab_api_error($requestId, $status, 'STORE_SIMULATED_' . $status, 'The next store request returned a deterministic simulated response.', [], $headers);
}

function lab_store_dispatch(PDO $pdo, array $session, array $seed, string $relative, string $method, string $requestId): never
{
    lab_store_ensure_schema($pdo);
    $route = substr($relative, strlen('v1/store/'));

    if ($route === 'scenario') {
        if ($method === 'GET') {
            $read = $pdo->prepare('SELECT scenario FROM lab_store_scenarios WHERE session_hash = ?');
            $read->execute([$session['hash']]);
            lab_api_send(['data' => ['next' => $read->fetchColumn() ?: null], 'requestId' => $requestId], 200, $requestId);
        }
        if ($method !== 'POST') {
            header('Allow: GET, POST');
            lab_api_error($requestId, 405, 'METHOD_NOT_ALLOWED', 'Use GET or POST for the store scenario.');
        }
        lab_api_require_mutation_guard($session, $requestId);
        $scenario = strtolower(lab_store_read_string(lab_api_read_json($requestId), 'scenario', $requestId, 20));
        $allowed = ['401', '403', '404', '409', '422', '429', '500', '503', 'timeout', 'malformed', 'empty'];
        if (!in_array($scenario, $allowed, true)) {
            lab_api_error($requestId, 422, 'SCENARIO_INVALID', 'Choose a published store scenario.');
        }
        $write = $pdo->prepare('INSERT INTO lab_store_scenarios(session_hash, scenario, created_at) VALUES (?, ?, ?)
            ON CONFLICT(session_hash) DO UPDATE SET scenario = excluded.scenario, created_at = excluded.created_at');
        $write->execute([$session['hash'], $scenario, time()]);
        lab_api_send(['data' => ['next' => $scenario, 'sessionOnly' => true], 'requestId' => $requestId], 202, $requestId);
    }

    if ($method === 'GET') {
        lab_store_apply_scenario($pdo, $session, $requestId);
    }

    if ($route === 'catalog' && $method === 'GET') {
        lab_store_catalog($pdo, $session, $seed, $requestId);
    }
    if (preg_match('#^products/([a-z0-9][a-z0-9-]{2,63})$#', $route, $matches) === 1 && $method === 'GET') {
        lab_api_send(['data' => lab_store_find_product($pdo, $session, $seed, $matches[1], $requestId), 'requestId' => $requestId], 200, $requestId);
    }
    if ($route === 'locations' && $method === 'GET') {
        lab_api_send(['data' => [
            'India' => [
                'Maharashtra' => ['Mumbai', 'Pune', 'Nagpur'],
                'Karnataka' => ['Bengaluru', 'Mysuru'],
                'Delhi' => ['New Delhi'],
            ],
            'Singapore' => ['Central Region' => ['Singapore']],
        ], 'requestId' => $requestId], 200, $requestId);
    }
    if ($route === 'cart' && $method === 'GET') {
        lab_api_send(['data' => lab_store_cart($pdo, $session, $seed), 'requestId' => $requestId], 200, $requestId);
    }
    if ($route === 'cart/items' && $method === 'POST') {
        lab_api_require_mutation_guard($session, $requestId);
        $body = lab_api_read_json($requestId);
        $productId = lab_store_read_string($body, 'productId', $requestId, 64);
        $product = lab_store_find_product($pdo, $session, $seed, $productId, $requestId);
        $quantity = filter_var($body['quantity'] ?? null, FILTER_VALIDATE_INT);
        $variant = trim((string) ($body['variant'] ?? 'Testheon violet / Single'));
        if ($quantity === false || $quantity < 1 || $quantity > 20 || $quantity > (int) $product['stock'] || $variant === '' || strlen($variant) > 100) {
            lab_api_error($requestId, 422, 'VALIDATION_FAILED', 'Choose an available quantity and variant.');
        }
        $write = $pdo->prepare('INSERT INTO lab_store_cart(session_hash, product_id, quantity, variant, added_at)
            VALUES (?, ?, ?, ?, ?)
            ON CONFLICT(session_hash, product_id, variant) DO UPDATE SET quantity = min(20, quantity + excluded.quantity)');
        $write->execute([$session['hash'], $productId, $quantity, $variant, time()]);
        lab_api_send(['data' => lab_store_cart($pdo, $session, $seed), 'requestId' => $requestId], 201, $requestId);
    }
    if (preg_match('#^cart/items/([a-z0-9][a-z0-9-]{2,63})$#', $route, $matches) === 1 && in_array($method, ['PATCH', 'DELETE'], true)) {
        lab_api_require_mutation_guard($session, $requestId);
        if ($method === 'DELETE') {
            $delete = $pdo->prepare('DELETE FROM lab_store_cart WHERE session_hash = ? AND product_id = ?');
            $delete->execute([$session['hash'], $matches[1]]);
        } else {
            $body = lab_api_read_json($requestId);
            $quantity = filter_var($body['quantity'] ?? null, FILTER_VALIDATE_INT);
            if ($quantity === false || $quantity < 1 || $quantity > 20) {
                lab_api_error($requestId, 422, 'VALIDATION_FAILED', 'Quantity must be between 1 and 20.');
            }
            $update = $pdo->prepare('UPDATE lab_store_cart SET quantity = ? WHERE session_hash = ? AND product_id = ?');
            $update->execute([$quantity, $session['hash'], $matches[1]]);
            if ($update->rowCount() === 0) {
                lab_api_error($requestId, 404, 'CART_ITEM_NOT_FOUND', 'The cart item was not found.');
            }
        }
        lab_api_send(['data' => lab_store_cart($pdo, $session, $seed), 'requestId' => $requestId], 200, $requestId);
    }
    if ($route === 'cart/coupon' && $method === 'POST') {
        lab_api_require_mutation_guard($session, $requestId);
        $code = strtoupper(lab_store_read_string(lab_api_read_json($requestId), 'code', $requestId, 30));
        if ($code === 'EXPIRED20') {
            lab_api_error($requestId, 409, 'COUPON_EXPIRED', 'EXPIRED20 is an intentionally expired practice coupon.');
        }
        if ($code !== LAB_STORE_COUPON) {
            lab_api_error($requestId, 404, 'COUPON_UNKNOWN', 'The practice coupon is unknown.');
        }
        $write = $pdo->prepare('INSERT INTO lab_store_state(session_hash, coupon_code) VALUES (?, ?)
            ON CONFLICT(session_hash) DO UPDATE SET coupon_code = excluded.coupon_code');
        $write->execute([$session['hash'], $code]);
        lab_api_send(['data' => lab_store_cart($pdo, $session, $seed), 'requestId' => $requestId], 200, $requestId);
    }
    if ($route === 'checkout' && $method === 'POST') {
        lab_api_require_mutation_guard($session, $requestId);
        $identity = lab_store_identity($pdo, $session, $requestId);
        lab_auth_require_permission($identity, 'orders.create', $requestId);
        $body = lab_api_read_json($requestId);
        $address = is_array($body['address'] ?? null) ? $body['address'] : [];
        foreach (['fullName', 'line1', 'country', 'state', 'city', 'postalCode'] as $field) {
            lab_store_read_string($address, $field, $requestId, 120);
        }
        $shipping = (string) ($body['shippingMethod'] ?? '');
        if (!in_array($shipping, ['standard', 'express'], true)) {
            lab_api_error($requestId, 422, 'VALIDATION_FAILED', 'Choose standard or express shipping.', [['field' => 'shippingMethod']]);
        }
        $payment = is_array($body['payment'] ?? null) ? $body['payment'] : [];
        $card = preg_replace('/\D+/', '', (string) ($payment['cardNumber'] ?? '')) ?? '';
        if ($card === '4000000000000002') {
            lab_api_error($requestId, 422, 'PAYMENT_DECLINED', 'The fake declined-card scenario was selected. No payment was attempted.');
        }
        if ($card !== '4242424242424242' || preg_match('/^\d{2}\/\d{2}$/', (string) ($payment['expiry'] ?? '')) !== 1 || preg_match('/^\d{3}$/', (string) ($payment['cvc'] ?? '')) !== 1) {
            lab_api_error($requestId, 422, 'PAYMENT_TEST_DATA_INVALID', 'Use a published fake test card number, expiry and CVC.');
        }
        $cart = lab_store_cart($pdo, $session, $seed);
        if ($cart['items'] === []) {
            lab_api_error($requestId, 409, 'CART_EMPTY', 'Add a practice product before checkout.');
        }
        $shippingCost = $shipping === 'express' ? 249.0 : 99.0;
        $orderId = 'ord-store-' . substr($requestId, 0, 12);
        $username = (string) $identity['user']['username'];
        $order = [
            'id' => $orderId,
            'customerId' => 'auth-' . str_replace('_', '-', $username),
            'status' => 'confirmed',
            'total' => (float) $cart['total'] + $shippingCost,
            'items' => array_map(static fn (array $item): array => [
                'productId' => $item['productId'],
                'quantity' => $item['quantity'],
                'price' => $item['price'],
                'variant' => $item['variant'],
            ], $cart['items']),
            'createdAt' => gmdate('c'),
        ];
        lab_api_write_overlay($pdo, $session, 'orders', $orderId, $order, false, $requestId);
        $deleteCart = $pdo->prepare('DELETE FROM lab_store_cart WHERE session_hash = ?');
        $deleteCart->execute([$session['hash']]);
        $deleteState = $pdo->prepare('DELETE FROM lab_store_state WHERE session_hash = ?');
        $deleteState->execute([$session['hash']]);
        lab_api_send(['data' => [
            'order' => $order,
            'shippingCost' => $shippingCost,
            'payment' => ['processor' => null, 'mode' => 'fake-test-card', 'charged' => false],
        ], 'requestId' => $requestId], 201, $requestId, ['Location' => '/practice/api/v1/orders/' . $orderId]);
    }
    if ($route === 'orders' && $method === 'GET') {
        $identity = lab_store_identity($pdo, $session, $requestId);
        $customerId = 'auth-' . str_replace('_', '-', (string) $identity['user']['username']);
        $orders = array_values(array_filter(lab_api_records($pdo, $session, $seed, 'orders'), static fn (array $order): bool => ($order['customerId'] ?? '') === $customerId));
        usort($orders, static fn (array $left, array $right): int => strcmp((string) $right['createdAt'], (string) $left['createdAt']));
        lab_api_send(['data' => $orders, 'meta' => ['total' => count($orders)], 'requestId' => $requestId], 200, $requestId);
    }
    if ($route === 'profile' && $method === 'GET') {
        $identity = lab_store_identity($pdo, $session, $requestId);
        $customerId = 'auth-' . str_replace('_', '-', (string) $identity['user']['username']);
        $orders = array_filter(lab_api_records($pdo, $session, $seed, 'orders'), static fn (array $order): bool => ($order['customerId'] ?? '') === $customerId);
        lab_api_send(['data' => [
            'user' => lab_auth_public_user($identity['user']),
            'authentication' => $identity['source'],
            'orderCount' => count($orders),
        ], 'requestId' => $requestId], 200, $requestId);
    }
    if ($route === 'reset' && $method === 'POST') {
        lab_api_require_mutation_guard($session, $requestId);
        lab_store_reset_sandbox($pdo, (string) $session['hash']);
        $delete = $pdo->prepare('DELETE FROM lab_overlays WHERE session_hash = ? AND generation = ? AND resource IN (\'products\', \'orders\')');
        $delete->execute([$session['hash'], (int) $session['row']['generation']]);
        lab_api_send(['data' => ['reset' => true, 'resources' => ['products', 'orders', 'cart', 'coupon', 'scenario']], 'requestId' => $requestId], 200, $requestId);
    }

    header('Allow: GET, POST, PATCH, DELETE');
    lab_api_error($requestId, 405, 'METHOD_NOT_ALLOWED', 'The store route or method is not available.');
}
