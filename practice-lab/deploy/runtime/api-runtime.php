<?php
declare(strict_types=1);

const LAB_API_VERSION = '1.0.0';
const LAB_API_FIXTURE_VERSION = '1.0.0';
const LAB_API_IDLE_TTL = 7200;
const LAB_API_ABSOLUTE_TTL = 86400;
const LAB_API_MAX_SESSIONS = 250;
const LAB_API_MAX_OVERLAYS = 2000;
const LAB_API_MAX_PAGE = 100;
const LAB_API_MAX_SEARCH = 200;
const LAB_API_MAX_BODY = 65536;
const LAB_API_MAX_STORAGE = 268435456;
const LAB_API_MAX_DELAY = 10000;
const LAB_API_REAL_RATE = 300;
const LAB_API_UPLOAD_MAX_FILE = 2097152;
const LAB_API_UPLOAD_MAX_FILES = 5;
const LAB_API_UPLOAD_SESSION_BYTES = 6291456;
const LAB_API_UPLOAD_TTL = 600;

require_once __DIR__ . '/api-auth.php';
require_once __DIR__ . '/api-store.php';

function lab_api_contracts(): array
{
    return [
        'users' => [
            'prefix' => 'usr',
            'required' => ['name', 'email', 'role', 'active'],
            'fields' => ['name' => 'string', 'email' => 'email', 'role' => 'string', 'active' => 'bool'],
            'filters' => ['role', 'active'],
            'sortable' => ['id', 'name', 'email', 'role', 'active'],
            'unique' => ['email'],
        ],
        'products' => [
            'prefix' => 'prd',
            'required' => ['name', 'sku', 'category', 'price', 'stock', 'rating'],
            'fields' => ['name' => 'string', 'sku' => 'string', 'category' => 'string', 'price' => 'number', 'stock' => 'int', 'rating' => 'number', 'currency' => 'string'],
            'filters' => ['category', 'stock'],
            'sortable' => ['id', 'name', 'sku', 'category', 'price', 'stock', 'rating'],
            'unique' => ['sku'],
            'cursor' => true,
        ],
        'orders' => [
            'prefix' => 'ord',
            'required' => ['customerId', 'status', 'total', 'items'],
            'fields' => ['customerId' => 'id', 'status' => 'string', 'total' => 'number', 'items' => 'items', 'createdAt' => 'string'],
            'filters' => ['status', 'customerId'],
            'sortable' => ['id', 'status', 'customerId', 'total', 'createdAt'],
            'unique' => [],
        ],
        'customers' => [
            'prefix' => 'cus',
            'required' => ['name', 'email', 'city', 'tier', 'active'],
            'fields' => ['name' => 'string', 'email' => 'email', 'city' => 'string', 'tier' => 'string', 'active' => 'bool'],
            'filters' => ['city', 'tier', 'active'],
            'sortable' => ['id', 'name', 'email', 'city', 'tier', 'active'],
            'unique' => ['email'],
        ],
        'employees' => [
            'prefix' => 'emp',
            'required' => ['name', 'department', 'location', 'title', 'active'],
            'fields' => ['name' => 'string', 'department' => 'string', 'location' => 'string', 'title' => 'string', 'active' => 'bool'],
            'filters' => ['department', 'location', 'active'],
            'sortable' => ['id', 'name', 'department', 'location', 'title', 'active'],
            'unique' => [],
            'cursor' => true,
        ],
        'tasks' => [
            'prefix' => 'tsk',
            'required' => ['title', 'status', 'priority', 'assigneeId', 'dueDate'],
            'fields' => ['title' => 'string', 'status' => 'string', 'priority' => 'string', 'assigneeId' => 'id', 'dueDate' => 'date'],
            'filters' => ['status', 'priority', 'assigneeId'],
            'sortable' => ['id', 'title', 'status', 'priority', 'assigneeId', 'dueDate'],
            'unique' => [],
        ],
        'tickets' => [
            'prefix' => 'tkt',
            'required' => ['subject', 'status', 'priority', 'customerId', 'assigneeId'],
            'fields' => ['subject' => 'string', 'status' => 'string', 'priority' => 'string', 'customerId' => 'id', 'assigneeId' => 'id'],
            'filters' => ['status', 'priority', 'customerId', 'assigneeId'],
            'sortable' => ['id', 'subject', 'status', 'priority', 'customerId', 'assigneeId'],
            'unique' => [],
        ],
        'bookings' => [
            'prefix' => 'bkg',
            'required' => ['guestName', 'city', 'checkIn', 'checkOut', 'status', 'total'],
            'fields' => ['guestName' => 'string', 'city' => 'string', 'checkIn' => 'date', 'checkOut' => 'date', 'status' => 'string', 'total' => 'number'],
            'filters' => ['city', 'status'],
            'sortable' => ['id', 'guestName', 'city', 'checkIn', 'checkOut', 'status', 'total'],
            'unique' => [],
        ],
    ];
}

function lab_api_request_id(): string
{
    $provided = (string) ($_SERVER['HTTP_X_REQUEST_ID'] ?? '');
    if (preg_match('/^[A-Za-z0-9._-]{8,64}$/', $provided) === 1) {
        return $provided;
    }
    return bin2hex(random_bytes(8));
}

function lab_api_common_headers(string $requestId, string $contentType = 'application/json; charset=utf-8'): void
{
    header('Content-Type: ' . $contentType);
    header('X-Request-ID: ' . $requestId);
    header('X-Robots-Tag: noindex, nofollow');
    header('Cache-Control: no-store, private');
    header('Pragma: no-cache');
    header('X-LiteSpeed-Cache-Control: no-cache');
    header('X-Content-Type-Options: nosniff');
    header('Referrer-Policy: no-referrer');
}

function lab_api_send(array $payload, int $status, string $requestId, array $headers = []): never
{
    lab_api_common_headers($requestId);
    foreach ($headers as $name => $value) {
        header($name . ': ' . $value);
    }
    http_response_code($status);
    if ($status !== 204) {
        echo json_encode($payload, JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE | JSON_THROW_ON_ERROR);
    }
    exit;
}

function lab_api_error(string $requestId, int $status, string $code, string $message, array $details = [], array $headers = []): never
{
    $route = preg_replace('/[^A-Za-z0-9_\/-]/', '', (string) parse_url($_SERVER['REQUEST_URI'] ?? '', PHP_URL_PATH));
    error_log(sprintf('[practice-lab] request=%s status=%d code=%s route=%s', $requestId, $status, $code, $route));
    lab_api_send([
        'error' => ['code' => $code, 'message' => $message, 'details' => array_values($details)],
        'requestId' => $requestId,
    ], $status, $requestId, $headers);
}

function lab_api_storage_root(): string
{
    $documentRoot = realpath((string) ($_SERVER['DOCUMENT_ROOT'] ?? ''));
    if ($documentRoot === false) {
        throw new RuntimeException('Document root is unavailable.');
    }
    $base = dirname($documentRoot, 2);
    return $base . '/.practice-lab-data-' . substr(hash('sha256', $documentRoot), 0, 12);
}

function lab_api_storage_bytes(string $root): int
{
    $total = 0;
    foreach (['practice-lab.sqlite', 'practice-lab.sqlite-wal', 'practice-lab.sqlite-shm'] as $name) {
        $path = $root . '/' . $name;
        if (is_file($path)) {
            clearstatcache(true, $path);
            $total += (int) filesize($path);
        }
    }
    return $total;
}

function lab_api_upload_root(): string
{
    return lab_api_storage_root() . '/uploads';
}

function lab_api_delete_upload_directory(string $sessionHash): void
{
    if (preg_match('/^[a-f0-9]{64}$/', $sessionHash) !== 1) {
        return;
    }
    $directory = lab_api_upload_root() . '/' . $sessionHash;
    if (!is_dir($directory)) {
        return;
    }
    foreach (scandir($directory) ?: [] as $name) {
        if ($name === '.' || $name === '..') {
            continue;
        }
        $path = $directory . '/' . $name;
        if (is_file($path) && preg_match('/^[a-f0-9]{32}\.upload$/', $name) === 1) {
            @unlink($path);
        }
    }
    @rmdir($directory);
}

function lab_api_db(): PDO
{
    static $pdo;
    if ($pdo instanceof PDO) {
        return $pdo;
    }
    $root = lab_api_storage_root();
    if (!is_dir($root) && !mkdir($root, 0700, true) && !is_dir($root)) {
        throw new RuntimeException('Private storage cannot be created.');
    }
    @chmod($root, 0700);
    $database = $root . '/practice-lab.sqlite';
    $pdo = new PDO('sqlite:' . $database, null, null, [
        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
        PDO::ATTR_EMULATE_PREPARES => false,
    ]);
    $pdo->exec('PRAGMA foreign_keys = ON');
    $pdo->exec('PRAGMA busy_timeout = 250');
    $pdo->exec('PRAGMA journal_mode = DELETE');
    $pdo->exec('PRAGMA synchronous = NORMAL');
    $pdo->exec('CREATE TABLE IF NOT EXISTS lab_sessions (
        session_hash TEXT PRIMARY KEY,
        created_at INTEGER NOT NULL,
        last_seen INTEGER NOT NULL,
        idle_ttl INTEGER NOT NULL,
        absolute_ttl INTEGER NOT NULL,
        generation INTEGER NOT NULL DEFAULT 0,
        fixture_version TEXT NOT NULL,
        sim_window INTEGER NOT NULL DEFAULT 0,
        sim_count INTEGER NOT NULL DEFAULT 0
    )');
    $pdo->exec('CREATE TABLE IF NOT EXISTS lab_overlays (
        session_hash TEXT NOT NULL,
        generation INTEGER NOT NULL,
        resource TEXT NOT NULL,
        record_id TEXT NOT NULL,
        data_json TEXT NOT NULL,
        deleted INTEGER NOT NULL DEFAULT 0,
        updated_at INTEGER NOT NULL,
        PRIMARY KEY (session_hash, generation, resource, record_id),
        FOREIGN KEY (session_hash) REFERENCES lab_sessions(session_hash) ON DELETE CASCADE
    )');
    $pdo->exec('CREATE TABLE IF NOT EXISTS lab_rate_limits (
        scope TEXT NOT NULL,
        key_hash TEXT NOT NULL,
        window INTEGER NOT NULL,
        count INTEGER NOT NULL,
        PRIMARY KEY (scope, key_hash, window)
    )');
    $pdo->exec('CREATE TABLE IF NOT EXISTS lab_uploads (
        session_hash TEXT NOT NULL,
        upload_id TEXT NOT NULL,
        original_name TEXT NOT NULL,
        storage_name TEXT NOT NULL,
        mime TEXT NOT NULL,
        size_bytes INTEGER NOT NULL,
        preview_json TEXT NOT NULL,
        created_at INTEGER NOT NULL,
        expires_at INTEGER NOT NULL,
        PRIMARY KEY (session_hash, upload_id),
        FOREIGN KEY (session_hash) REFERENCES lab_sessions(session_hash) ON DELETE CASCADE
    )');
    if (is_file($database)) {
        @chmod($database, 0600);
    }
    return $pdo;
}

function lab_api_cleanup(PDO $pdo, int $limit = 25): array
{
    $now = time();
    $select = $pdo->prepare('SELECT session_hash FROM lab_sessions
        WHERE (? - last_seen) > idle_ttl OR (? - created_at) > absolute_ttl
        ORDER BY last_seen ASC LIMIT ?');
    $select->bindValue(1, $now, PDO::PARAM_INT);
    $select->bindValue(2, $now, PDO::PARAM_INT);
    $select->bindValue(3, max(1, min(100, $limit)), PDO::PARAM_INT);
    $select->execute();
    $expired = $select->fetchAll(PDO::FETCH_COLUMN);
    if ($expired !== []) {
        $delete = $pdo->prepare('DELETE FROM lab_sessions WHERE session_hash = ?');
        foreach ($expired as $hash) {
            lab_api_delete_upload_directory((string) $hash);
            $delete->execute([(string) $hash]);
        }
    }
    $expiredUploads = $pdo->prepare('SELECT session_hash, storage_name FROM lab_uploads
        WHERE expires_at < ? ORDER BY expires_at ASC LIMIT ?');
    $expiredUploads->bindValue(1, $now, PDO::PARAM_INT);
    $expiredUploads->bindValue(2, max(1, min(100, $limit)), PDO::PARAM_INT);
    $expiredUploads->execute();
    $uploadRows = $expiredUploads->fetchAll();
    if ($uploadRows !== []) {
        $removeUpload = $pdo->prepare('DELETE FROM lab_uploads WHERE session_hash = ? AND storage_name = ?');
        foreach ($uploadRows as $upload) {
            $path = lab_api_upload_root() . '/' . (string) $upload['session_hash'] . '/' . (string) $upload['storage_name'];
            if (is_file($path)) {
                @unlink($path);
            }
            $removeUpload->execute([(string) $upload['session_hash'], (string) $upload['storage_name']]);
        }
    }
    $window = intdiv($now, 60) - 2;
    $rates = $pdo->prepare('DELETE FROM lab_rate_limits WHERE window < ?');
    $rates->execute([$window]);
    lab_auth_cleanup($pdo, $now);
    lab_store_cleanup($pdo, $now);
    return [
        'expiredSessionsRemoved' => count($expired),
        'expiredUploadsRemoved' => count($uploadRows),
        'oldRateWindowsRemoved' => $rates->rowCount(),
    ];
}

function lab_api_cli_cleanup(): array
{
    $pdo = lab_api_db();
    $result = lab_api_cleanup($pdo, 100);
    $result['storageBytes'] = lab_api_storage_bytes(lab_api_storage_root());
    return $result;
}

function lab_api_real_rate_limit(PDO $pdo, string $requestId): void
{
    $address = (string) ($_SERVER['REMOTE_ADDR'] ?? 'unknown');
    $key = hash_hmac('sha256', $address, (string) lab_config()['api_secret']);
    $window = intdiv(time(), 60);
    $pdo->exec('BEGIN IMMEDIATE');
    try {
        $insert = $pdo->prepare('INSERT INTO lab_rate_limits(scope, key_hash, window, count)
            VALUES (\'ip\', ?, ?, 1)
            ON CONFLICT(scope, key_hash, window) DO UPDATE SET count = count + 1');
        $insert->execute([$key, $window]);
        $read = $pdo->prepare('SELECT count FROM lab_rate_limits WHERE scope = \'ip\' AND key_hash = ? AND window = ?');
        $read->execute([$key, $window]);
        $count = (int) $read->fetchColumn();
        $pdo->exec('COMMIT');
    } catch (Throwable $error) {
        $pdo->exec('ROLLBACK');
        throw $error;
    }
    if ($count > LAB_API_REAL_RATE) {
        lab_api_error($requestId, 429, 'RATE_LIMITED', 'The real API protection limit was reached.', [], ['Retry-After' => '60']);
    }
}

function lab_api_token_valid(string $token): bool
{
    return preg_match('/^[a-f0-9]{48}$/', $token) === 1;
}

function lab_api_create_session(PDO $pdo, string $requestId, string $mode, int $expiresIn = LAB_API_ABSOLUTE_TTL): array
{
    lab_api_cleanup($pdo);
    $active = (int) $pdo->query('SELECT COUNT(*) FROM lab_sessions')->fetchColumn();
    if ($active >= LAB_API_MAX_SESSIONS) {
        lab_api_error($requestId, 503, 'CAPACITY_REACHED', 'The active sandbox capacity is full.', [], ['Retry-After' => '60']);
    }
    $token = bin2hex(random_bytes(24));
    $hash = hash('sha256', $token);
    $now = time();
    $absolute = max(1, min(LAB_API_ABSOLUTE_TTL, $expiresIn));
    $idle = min(LAB_API_IDLE_TTL, $absolute);
    $insert = $pdo->prepare('INSERT INTO lab_sessions
        (session_hash, created_at, last_seen, idle_ttl, absolute_ttl, generation, fixture_version, sim_window, sim_count)
        VALUES (?, ?, ?, ?, ?, 0, ?, 0, 0)');
    $insert->execute([$hash, $now, $now, $idle, $absolute, LAB_API_FIXTURE_VERSION]);
    if ($mode === 'cookie') {
        setcookie('lab_sid', $token, [
            'expires' => $now + $absolute,
            'path' => '/practice/',
            'secure' => true,
            'httponly' => true,
            'samesite' => 'Lax',
        ]);
    }
    return [
        'token' => $token,
        'hash' => $hash,
        'mode' => $mode,
        'row' => [
            'created_at' => $now,
            'last_seen' => $now,
            'idle_ttl' => $idle,
            'absolute_ttl' => $absolute,
            'generation' => 0,
            'fixture_version' => LAB_API_FIXTURE_VERSION,
        ],
    ];
}

function lab_api_resolve_session(PDO $pdo, string $requestId, bool $create = true): array
{
    $header = trim((string) ($_SERVER['HTTP_X_LAB_SESSION'] ?? ''));
    $cookie = trim((string) ($_COOKIE['lab_sid'] ?? ''));
    if ($header !== '' && $cookie !== '' && !hash_equals($header, $cookie)) {
        lab_api_error($requestId, 400, 'SESSION_CONFLICT', 'Cookie and header identify different sandboxes.');
    }
    $token = $header !== '' ? $header : $cookie;
    $mode = $header !== '' ? 'header' : 'cookie';
    if ($token === '') {
        if (!$create) {
            lab_api_error($requestId, 401, 'SESSION_REQUIRED', 'A Lab sandbox is required.');
        }
        return lab_api_create_session($pdo, $requestId, 'cookie');
    }
    if (!lab_api_token_valid($token)) {
        lab_api_error($requestId, 401, 'SESSION_INVALID', 'The Lab sandbox token is invalid.');
    }
    $hash = hash('sha256', $token);
    $read = $pdo->prepare('SELECT * FROM lab_sessions WHERE session_hash = ?');
    $read->execute([$hash]);
    $row = $read->fetch();
    if (!is_array($row)) {
        lab_api_error($requestId, 401, 'SESSION_INVALID', 'The Lab sandbox does not exist.');
    }
    $now = time();
    if (($now - (int) $row['last_seen']) > (int) $row['idle_ttl']
        || ($now - (int) $row['created_at']) > (int) $row['absolute_ttl']) {
        $delete = $pdo->prepare('DELETE FROM lab_sessions WHERE session_hash = ?');
        $delete->execute([$hash]);
        lab_api_error($requestId, 401, 'SESSION_EXPIRED', 'The Lab sandbox expired.');
    }
    if ((string) $row['fixture_version'] !== LAB_API_FIXTURE_VERSION) {
        lab_api_error($requestId, 409, 'SESSION_FIXTURE_OUTDATED', 'Reset with a new sandbox for this fixture version.');
    }
    $touch = $pdo->prepare('UPDATE lab_sessions SET last_seen = ? WHERE session_hash = ?');
    $touch->execute([$now, $hash]);
    $row['last_seen'] = $now;
    return ['token' => $token, 'hash' => $hash, 'mode' => $mode, 'row' => $row];
}

function lab_api_csrf_token(string $sessionToken): string
{
    return hash_hmac('sha256', 'csrf|' . $sessionToken, (string) lab_config()['api_secret']);
}

function lab_api_require_mutation_guard(array $session, string $requestId): void
{
    if ($session['mode'] === 'header') {
        return;
    }
    $scheme = (!empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off') ? 'https' : 'http';
    $expectedOrigin = $scheme . '://' . (string) ($_SERVER['HTTP_HOST'] ?? '');
    $origin = (string) ($_SERVER['HTTP_ORIGIN'] ?? '');
    $token = (string) ($_SERVER['HTTP_X_LAB_CSRF'] ?? '');
    if (!hash_equals($expectedOrigin, $origin)
        || !hash_equals(lab_api_csrf_token((string) $session['token']), $token)) {
        lab_api_error($requestId, 403, 'CSRF_REJECTED', 'Cookie-mode mutations require the matching origin and CSRF token.');
    }
}

function lab_api_read_json(string $requestId): array
{
    $length = (int) ($_SERVER['CONTENT_LENGTH'] ?? 0);
    if ($length > LAB_API_MAX_BODY) {
        lab_api_error($requestId, 413, 'BODY_TOO_LARGE', 'JSON bodies are limited to 65536 bytes.');
    }
    $contentType = strtolower(trim(explode(';', (string) ($_SERVER['CONTENT_TYPE'] ?? ''))[0]));
    if ($contentType !== 'application/json') {
        lab_api_error($requestId, 415, 'UNSUPPORTED_MEDIA_TYPE', 'Use application/json.');
    }
    $raw = file_get_contents('php://input', false, null, 0, LAB_API_MAX_BODY + 1);
    if (!is_string($raw) || strlen($raw) > LAB_API_MAX_BODY) {
        lab_api_error($requestId, 413, 'BODY_TOO_LARGE', 'JSON bodies are limited to 65536 bytes.');
    }
    if ($raw === '') {
        lab_api_error($requestId, 400, 'INVALID_JSON', 'A JSON object body is required.');
    }
    try {
        $decoded = json_decode($raw, true, 32, JSON_THROW_ON_ERROR);
    } catch (JsonException) {
        lab_api_error($requestId, 400, 'INVALID_JSON', 'The request body is not valid JSON.');
    }
    if (!is_array($decoded) || array_is_list($decoded)) {
        lab_api_error($requestId, 400, 'INVALID_JSON', 'The request body must be a JSON object.');
    }
    return $decoded;
}

function lab_api_seed(string $dataRoot): array
{
    static $cache = [];
    if (!isset($cache[$dataRoot])) {
        $path = $dataRoot . '/fixtures-v1.json';
        $raw = is_file($path) ? file_get_contents($path) : false;
        if (!is_string($raw)) {
            throw new RuntimeException('Fixture data is unavailable.');
        }
        $decoded = json_decode($raw, true, 64, JSON_THROW_ON_ERROR);
        if (($decoded['metadata']['fixtureVersion'] ?? null) !== LAB_API_FIXTURE_VERSION) {
            throw new RuntimeException('Fixture data version mismatch.');
        }
        $cache[$dataRoot] = $decoded;
    }
    return $cache[$dataRoot];
}

function lab_api_records(PDO $pdo, array $session, array $seed, string $resource): array
{
    $records = [];
    foreach (($seed['data'][$resource] ?? []) as $record) {
        $records[(string) $record['id']] = $record;
    }
    $query = $pdo->prepare('SELECT record_id, data_json, deleted FROM lab_overlays
        WHERE session_hash = ? AND generation = ? AND resource = ?');
    $query->execute([$session['hash'], (int) $session['row']['generation'], $resource]);
    foreach ($query->fetchAll() as $overlay) {
        $id = (string) $overlay['record_id'];
        if ((int) $overlay['deleted'] === 1) {
            unset($records[$id]);
        } else {
            $record = json_decode((string) $overlay['data_json'], true, 32, JSON_THROW_ON_ERROR);
            $records[$id] = $record;
        }
    }
    return $records;
}

function lab_api_validate_record(array $body, array $contract, bool $partial, string $requestId): array
{
    $details = [];
    $allowed = array_keys($contract['fields']);
    foreach ($body as $field => $_value) {
        if ($field !== 'id' && !in_array($field, $allowed, true)) {
            $details[] = ['field' => (string) $field, 'issue' => 'is not allowed'];
        }
    }
    if (!$partial) {
        foreach ($contract['required'] as $field) {
            if (!array_key_exists($field, $body)) {
                $details[] = ['field' => $field, 'issue' => 'is required'];
            }
        }
    }
    if (isset($body['id']) && (!is_string($body['id']) || preg_match('/^[a-z0-9][a-z0-9-]{2,63}$/', $body['id']) !== 1)) {
        $details[] = ['field' => 'id', 'issue' => 'must be a safe 3-64 character identifier'];
    }
    foreach ($contract['fields'] as $field => $type) {
        if (!array_key_exists($field, $body)) {
            continue;
        }
        $value = $body[$field];
        $valid = match ($type) {
            'string' => is_string($value) && $value !== '' && strlen($value) <= 500,
            'email' => is_string($value) && strlen($value) <= 254 && filter_var($value, FILTER_VALIDATE_EMAIL) !== false,
            'bool' => is_bool($value),
            'int' => is_int($value) && $value >= 0,
            'number' => (is_int($value) || is_float($value)) && is_finite((float) $value) && $value >= 0,
            'id' => is_string($value) && preg_match('/^[a-z0-9][a-z0-9-]{2,63}$/', $value) === 1,
            'date' => is_string($value) && preg_match('/^\d{4}-\d{2}-\d{2}$/', $value) === 1,
            'items' => lab_api_items_valid($value),
            default => false,
        };
        if (!$valid) {
            $details[] = ['field' => $field, 'issue' => 'has an invalid type or value'];
        }
    }
    if ($details !== []) {
        lab_api_error($requestId, 422, 'VALIDATION_FAILED', 'The request contains invalid fields.', $details);
    }
    return $body;
}

function lab_api_items_valid(mixed $value): bool
{
    if (!is_array($value) || count($value) > 20) {
        return false;
    }
    foreach ($value as $item) {
        if (!is_array($item)
            || !is_string($item['productId'] ?? null)
            || preg_match('/^[a-z0-9][a-z0-9-]{2,63}$/', (string) $item['productId']) !== 1
            || !is_int($item['quantity'] ?? null)
            || (int) $item['quantity'] < 1
            || (int) $item['quantity'] > 20
            || !(is_int($item['price'] ?? null) || is_float($item['price'] ?? null))
            || (float) $item['price'] < 0) {
            return false;
        }
    }
    return true;
}

function lab_api_assert_unique(array $records, array $candidate, array $contract, string $requestId, ?string $currentId = null): void
{
    foreach ($contract['unique'] as $field) {
        if (!array_key_exists($field, $candidate)) {
            continue;
        }
        foreach ($records as $id => $record) {
            if ($id !== $currentId && isset($record[$field]) && strcasecmp((string) $record[$field], (string) $candidate[$field]) === 0) {
                lab_api_error($requestId, 409, 'DUPLICATE_RECORD', "A record with that {$field} already exists.", [['field' => $field]]);
            }
        }
    }
}

function lab_api_write_overlay(PDO $pdo, array $session, string $resource, string $id, array $record, bool $deleted, string $requestId): void
{
    if (lab_api_storage_bytes(lab_api_storage_root()) >= LAB_API_MAX_STORAGE) {
        lab_api_error($requestId, 503, 'STORAGE_CAP_REACHED', 'The Lab storage allocation is full.', [], ['Retry-After' => '60']);
    }
    $generation = (int) $session['row']['generation'];
    $count = $pdo->prepare('SELECT COUNT(*) FROM lab_overlays WHERE session_hash = ? AND generation = ?');
    $count->execute([$session['hash'], $generation]);
    if ((int) $count->fetchColumn() >= LAB_API_MAX_OVERLAYS) {
        lab_api_error($requestId, 409, 'SESSION_RECORD_CAP', 'This sandbox reached its record cap. Reset it to continue.');
    }
    $pdo->exec('BEGIN IMMEDIATE');
    try {
        $check = $pdo->prepare('SELECT generation FROM lab_sessions WHERE session_hash = ?');
        $check->execute([$session['hash']]);
        if ((int) $check->fetchColumn() !== $generation) {
            $pdo->exec('ROLLBACK');
            lab_api_error($requestId, 409, 'SESSION_RESET_RACE', 'The sandbox was reset during this mutation. Retry the request.');
        }
        $write = $pdo->prepare('INSERT INTO lab_overlays
            (session_hash, generation, resource, record_id, data_json, deleted, updated_at)
            VALUES (?, ?, ?, ?, ?, ?, ?)
            ON CONFLICT(session_hash, generation, resource, record_id)
            DO UPDATE SET data_json = excluded.data_json, deleted = excluded.deleted, updated_at = excluded.updated_at');
        $write->execute([
            $session['hash'],
            $generation,
            $resource,
            $id,
            json_encode($record, JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE | JSON_THROW_ON_ERROR),
            $deleted ? 1 : 0,
            time(),
        ]);
        $pdo->exec('COMMIT');
    } catch (Throwable $error) {
        if ($pdo->inTransaction()) {
            $pdo->rollBack();
        } else {
            try {
                $pdo->exec('ROLLBACK');
            } catch (Throwable) {
            }
        }
        throw $error;
    }
}

function lab_api_parse_int(string $name, int $default, int $min, int $max, string $requestId): int
{
    if (!isset($_GET[$name]) || $_GET[$name] === '') {
        return $default;
    }
    $value = filter_var($_GET[$name], FILTER_VALIDATE_INT);
    if ($value === false || $value < $min || $value > $max) {
        lab_api_error($requestId, 400, 'INVALID_PARAMETER', "{$name} must be between {$min} and {$max}.", [['parameter' => $name]]);
    }
    return (int) $value;
}

function lab_api_apply_controls(string $requestId): void
{
    $delay = lab_api_parse_int('delay', 0, 0, LAB_API_MAX_DELAY, $requestId);
    if ($delay > 0) {
        usleep($delay * 1000);
    }
    if (isset($_GET['simulate'])) {
        $status = filter_var($_GET['simulate'], FILTER_VALIDATE_INT);
        $allowed = [400, 401, 403, 404, 409, 422, 429, 500, 503];
        if ($status === false || !in_array((int) $status, $allowed, true)) {
            lab_api_error($requestId, 400, 'INVALID_PARAMETER', 'simulate must be an allowlisted status.', [['parameter' => 'simulate']]);
        }
        $headers = (int) $status === 429 ? ['Retry-After' => '60'] : [];
        lab_api_error($requestId, (int) $status, 'SIMULATED_' . (int) $status, 'This is a deterministic simulated response.', [], $headers);
    }
}

function lab_api_value_matches(mixed $actual, string $expected): bool
{
    if (is_bool($actual)) {
        return ($actual && $expected === 'true') || (!$actual && $expected === 'false');
    }
    return strcasecmp((string) $actual, $expected) === 0;
}

function lab_api_sort_records(array &$rows, array $fields): void
{
    usort($rows, static function (array $left, array $right) use ($fields): int {
        foreach ($fields as [$field, $direction]) {
            $a = $left[$field] ?? null;
            $b = $right[$field] ?? null;
            $comparison = (is_numeric($a) && is_numeric($b))
                ? ((float) $a <=> (float) $b)
                : strcasecmp((string) $a, (string) $b);
            if ($comparison !== 0) {
                return $comparison * $direction;
            }
        }
        return strcmp((string) $left['id'], (string) $right['id']);
    });
}

function lab_api_base_url(): string
{
    $scheme = (!empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off') ? 'https' : 'http';
    return $scheme . '://' . (string) ($_SERVER['HTTP_HOST'] ?? 'localhost')
        . (string) parse_url($_SERVER['REQUEST_URI'] ?? '', PHP_URL_PATH);
}

function lab_api_cursor_encode(int $offset, int $seed, string $size): string
{
    $json = json_encode(['offset' => $offset, 'seed' => $seed, 'size' => $size], JSON_THROW_ON_ERROR);
    return rtrim(strtr(base64_encode($json), '+/', '-_'), '=');
}

function lab_api_cursor_decode(string $cursor, int $seed, string $size, string $requestId): int
{
    if (strlen($cursor) > 500 || preg_match('/^[A-Za-z0-9_-]+$/', $cursor) !== 1) {
        lab_api_error($requestId, 400, 'INVALID_CURSOR', 'The cursor is invalid.');
    }
    $padding = str_repeat('=', (4 - strlen($cursor) % 4) % 4);
    $decoded = base64_decode(strtr($cursor . $padding, '-_', '+/'), true);
    $payload = is_string($decoded) ? json_decode($decoded, true) : null;
    if (!is_array($payload)
        || !is_int($payload['offset'] ?? null)
        || (int) ($payload['seed'] ?? -1) !== $seed
        || (string) ($payload['size'] ?? '') !== $size) {
        lab_api_error($requestId, 400, 'INVALID_CURSOR', 'The cursor does not match this collection query.');
    }
    return max(0, (int) $payload['offset']);
}

function lab_api_list_resource(PDO $pdo, array $session, array $seedData, string $resource, array $contract, string $requestId): never
{
    $allowed = array_merge(['page', 'limit', 'cursor', 'sort', 'q', 'delay', 'simulate', 'seed', 'size'], $contract['filters']);
    foreach (array_keys($_GET) as $parameter) {
        if (!in_array($parameter, $allowed, true)) {
            lab_api_error($requestId, 400, 'INVALID_PARAMETER', "Unknown query parameter: {$parameter}.", [['parameter' => $parameter]]);
        }
    }
    $rows = array_values(lab_api_records($pdo, $session, $seedData, $resource));
    $size = (string) ($_GET['size'] ?? 'large');
    $sizeCaps = ['small' => 10, 'medium' => 50, 'large' => PHP_INT_MAX];
    if (!isset($sizeCaps[$size])) {
        lab_api_error($requestId, 400, 'INVALID_PARAMETER', 'size must be small, medium, or large.');
    }
    $rows = array_slice($rows, 0, $sizeCaps[$size]);
    foreach ($contract['filters'] as $field) {
        if (isset($_GET[$field])) {
            $expected = (string) $_GET[$field];
            if (strlen($expected) > LAB_API_MAX_SEARCH) {
                lab_api_error($requestId, 400, 'INVALID_PARAMETER', "{$field} is too long.");
            }
            $rows = array_values(array_filter($rows, static fn (array $row): bool => lab_api_value_matches($row[$field] ?? null, $expected)));
        }
    }
    if (isset($_GET['q'])) {
        $query = trim((string) $_GET['q']);
        if ($query === '' || strlen($query) > LAB_API_MAX_SEARCH) {
            lab_api_error($requestId, 400, 'INVALID_PARAMETER', 'q must contain 1-200 characters.');
        }
        $rows = array_values(array_filter($rows, static function (array $row) use ($query): bool {
            return stripos(json_encode($row, JSON_UNESCAPED_UNICODE | JSON_THROW_ON_ERROR), $query) !== false;
        }));
    }
    $seed = lab_api_parse_int('seed', 4803, 0, 2147483647, $requestId);
    if (isset($_GET['sort'])) {
        $sortFields = [];
        foreach (explode(',', (string) $_GET['sort']) as $raw) {
            $raw = trim($raw);
            $direction = str_starts_with($raw, '-') ? -1 : 1;
            $field = ltrim($raw, '-');
            if ($field === '' || !in_array($field, $contract['sortable'], true)) {
                lab_api_error($requestId, 400, 'INVALID_PARAMETER', "Unsupported sort field: {$field}.");
            }
            $sortFields[] = [$field, $direction];
        }
        lab_api_sort_records($rows, $sortFields);
    } else {
        usort($rows, static function (array $a, array $b) use ($seed): int {
            $left = hash('sha256', $seed . '|' . (string) $a['id']);
            $right = hash('sha256', $seed . '|' . (string) $b['id']);
            return strcmp($left, $right) ?: strcmp((string) $a['id'], (string) $b['id']);
        });
    }
    $total = count($rows);
    $limit = lab_api_parse_int('limit', 20, 1, LAB_API_MAX_PAGE, $requestId);
    $cursorMode = isset($_GET['cursor']);
    if ($cursorMode && empty($contract['cursor'])) {
        lab_api_error($requestId, 400, 'INVALID_CURSOR', 'Cursor pagination is available only for products and employees.');
    }
    if ($cursorMode && isset($_GET['page'])) {
        lab_api_error($requestId, 400, 'INVALID_PARAMETER', 'page and cursor cannot be combined.');
    }
    $offset = $cursorMode
        ? lab_api_cursor_decode((string) $_GET['cursor'], $seed, $size, $requestId)
        : (lab_api_parse_int('page', 1, 1, 1000000, $requestId) - 1) * $limit;
    $page = intdiv($offset, $limit) + 1;
    $data = array_slice($rows, $offset, $limit);
    $nextOffset = $offset + count($data);
    $nextCursor = (!empty($contract['cursor']) && $nextOffset < $total)
        ? lab_api_cursor_encode($nextOffset, $seed, $size)
        : null;
    $query = $_GET;
    $links = [];
    if ($nextOffset < $total) {
        if (!empty($contract['cursor'])) {
            $query['cursor'] = $nextCursor;
            unset($query['page']);
        } else {
            $query['page'] = $page + 1;
        }
        $links[] = '<' . lab_api_base_url() . '?' . http_build_query($query) . '>; rel="next"';
    }
    if (!$cursorMode && $page > 1) {
        $query = $_GET;
        $query['page'] = $page - 1;
        $links[] = '<' . lab_api_base_url() . '?' . http_build_query($query) . '>; rel="prev"';
    }
    $headers = ['X-Total-Count' => (string) $total];
    if ($links !== []) {
        $headers['Link'] = implode(', ', $links);
    }
    lab_api_send([
        'data' => $data,
        'meta' => [
            'total' => $total,
            'page' => $page,
            'limit' => $limit,
            'nextCursor' => $nextCursor,
            'fixtureVersion' => LAB_API_FIXTURE_VERSION,
            'seed' => $seed,
            'size' => $size,
        ],
        'requestId' => $requestId,
    ], 200, $requestId, $headers);
}

function lab_api_resource_route(PDO $pdo, array $session, array $seedData, string $resource, ?string $id, string $method, string $requestId): never
{
    $contracts = lab_api_contracts();
    $contract = $contracts[$resource];
    lab_api_apply_controls($requestId);
    $records = lab_api_records($pdo, $session, $seedData, $resource);
    if ($id === null) {
        if ($method === 'GET') {
            lab_api_list_resource($pdo, $session, $seedData, $resource, $contract, $requestId);
        }
        if ($method !== 'POST') {
            header('Allow: GET, POST');
            lab_api_error($requestId, 405, 'METHOD_NOT_ALLOWED', 'Use GET or POST for this collection.');
        }
        lab_api_require_mutation_guard($session, $requestId);
        $body = lab_api_validate_record(lab_api_read_json($requestId), $contract, false, $requestId);
        $newId = isset($body['id']) ? (string) $body['id'] : $contract['prefix'] . '-new-' . substr($requestId, 0, 12);
        if (isset($records[$newId])) {
            lab_api_error($requestId, 409, 'DUPLICATE_RECORD', 'A record with that id already exists.', [['field' => 'id']]);
        }
        unset($body['id']);
        $record = ['id' => $newId] + $body;
        lab_api_assert_unique($records, $record, $contract, $requestId);
        lab_api_write_overlay($pdo, $session, $resource, $newId, $record, false, $requestId);
        lab_api_send(['data' => $record, 'requestId' => $requestId], 201, $requestId, [
            'Location' => '/practice/api/v1/' . $resource . '/' . rawurlencode($newId),
        ]);
    }
    if (preg_match('/^[a-z0-9][a-z0-9-]{2,63}$/', $id) !== 1) {
        lab_api_error($requestId, 400, 'INVALID_IDENTIFIER', 'The resource identifier is invalid.');
    }
    if (!isset($records[$id])) {
        lab_api_error($requestId, 404, 'NOT_FOUND', 'The requested record was not found.');
    }
    if ($method === 'GET') {
        lab_api_send(['data' => $records[$id], 'requestId' => $requestId], 200, $requestId);
    }
    if (!in_array($method, ['PUT', 'PATCH', 'DELETE'], true)) {
        header('Allow: GET, PUT, PATCH, DELETE');
        lab_api_error($requestId, 405, 'METHOD_NOT_ALLOWED', 'Use GET, PUT, PATCH, or DELETE for this item.');
    }
    lab_api_require_mutation_guard($session, $requestId);
    if ($method === 'DELETE') {
        lab_api_write_overlay($pdo, $session, $resource, $id, [], true, $requestId);
        lab_api_send([], 204, $requestId);
    }
    $partial = $method === 'PATCH';
    $body = lab_api_validate_record(lab_api_read_json($requestId), $contract, $partial, $requestId);
    if (isset($body['id']) && $body['id'] !== $id) {
        lab_api_error($requestId, 422, 'VALIDATION_FAILED', 'The body id must match the route id.', [['field' => 'id']]);
    }
    unset($body['id']);
    if ($partial && $body === []) {
        lab_api_error($requestId, 422, 'VALIDATION_FAILED', 'PATCH must change at least one field.');
    }
    $record = $partial ? array_replace($records[$id], $body) : (['id' => $id] + $body);
    lab_api_assert_unique($records, $record, $contract, $requestId, $id);
    lab_api_write_overlay($pdo, $session, $resource, $id, $record, false, $requestId);
    lab_api_send(['data' => $record, 'requestId' => $requestId], 200, $requestId);
}

function lab_api_uploaded_files(string $requestId): array
{
    $field = $_FILES['files'] ?? null;
    if (!is_array($field) || !isset($field['name'], $field['tmp_name'], $field['error'], $field['size'])) {
        lab_api_error($requestId, 400, 'FILES_REQUIRED', 'Upload one or more files in the files field.');
    }
    $names = is_array($field['name']) ? $field['name'] : [$field['name']];
    $paths = is_array($field['tmp_name']) ? $field['tmp_name'] : [$field['tmp_name']];
    $errors = is_array($field['error']) ? $field['error'] : [$field['error']];
    $sizes = is_array($field['size']) ? $field['size'] : [$field['size']];
    $fullPaths = isset($field['full_path'])
        ? (is_array($field['full_path']) ? $field['full_path'] : [$field['full_path']])
        : $names;
    if (count($names) < 1 || count($names) > LAB_API_UPLOAD_MAX_FILES
        || count($paths) !== count($names) || count($errors) !== count($names)
        || count($sizes) !== count($names)) {
        lab_api_error($requestId, 413, 'FILE_COUNT_LIMIT', 'Upload between 1 and 5 files per request.');
    }
    $files = [];
    foreach ($names as $index => $name) {
        $files[] = [
            'name' => (string) $name,
            'full_path' => (string) ($fullPaths[$index] ?? $name),
            'tmp_name' => (string) ($paths[$index] ?? ''),
            'error' => (int) ($errors[$index] ?? UPLOAD_ERR_NO_FILE),
            'size' => (int) ($sizes[$index] ?? 0),
        ];
    }
    return $files;
}

function lab_api_sniff_upload(array $file, string $requestId): array
{
    $name = (string) $file['name'];
    $fullPath = (string) $file['full_path'];
    if ($name === '' || strlen($name) > 180 || preg_match('/[\x00-\x1f\x7f]/', $name) === 1
        || basename($name) !== $name || basename($fullPath) !== $fullPath
        || str_contains($name, '..') || str_contains($fullPath, '..')) {
        lab_api_error($requestId, 422, 'PATH_REJECTED', 'Upload filenames cannot contain paths, traversal, or control characters.');
    }
    $uploadError = (int) $file['error'];
    if (in_array($uploadError, [UPLOAD_ERR_INI_SIZE, UPLOAD_ERR_FORM_SIZE], true)) {
        lab_api_error($requestId, 413, 'FILE_TOO_LARGE', 'Each uploaded file must be between 1 byte and 2 MiB.');
    }
    if ($uploadError !== UPLOAD_ERR_OK || !is_uploaded_file((string) $file['tmp_name'])) {
        lab_api_error($requestId, 422, 'UPLOAD_INCOMPLETE', 'The uploaded file did not complete safely.');
    }
    $size = (int) $file['size'];
    if ($size < 1 || $size > LAB_API_UPLOAD_MAX_FILE) {
        lab_api_error($requestId, 413, 'FILE_TOO_LARGE', 'Each uploaded file must be between 1 byte and 2 MiB.');
    }
    $extension = strtolower((string) pathinfo($name, PATHINFO_EXTENSION));
    $rules = [
        'png' => ['image/png'],
        'jpg' => ['image/jpeg'],
        'jpeg' => ['image/jpeg'],
        'csv' => ['text/csv', 'text/plain', 'application/csv'],
        'txt' => ['text/plain'],
        'pdf' => ['application/pdf'],
    ];
    if (!isset($rules[$extension])) {
        lab_api_error($requestId, 415, 'EXTENSION_REJECTED', 'The file extension is not allowlisted.');
    }
    $finfo = new finfo(FILEINFO_MIME_TYPE);
    $mime = $finfo->file((string) $file['tmp_name']);
    if (!is_string($mime) || !in_array($mime, $rules[$extension], true)) {
        lab_api_error($requestId, 415, 'CONTENT_REJECTED', 'File content does not match its allowlisted extension and MIME type.');
    }
    $bytes = file_get_contents((string) $file['tmp_name'], false, null, 0, min($size, 65536));
    if (!is_string($bytes)) {
        lab_api_error($requestId, 422, 'CONTENT_UNREADABLE', 'File content could not be inspected.');
    }
    $preview = ['kind' => $extension, 'summary' => 'Validated private file.'];
    if ($extension === 'png' || $extension === 'jpg' || $extension === 'jpeg') {
        $image = @getimagesize((string) $file['tmp_name']);
        if (!is_array($image) || ($image['mime'] ?? '') !== $mime) {
            lab_api_error($requestId, 415, 'CONTENT_REJECTED', 'Image structure does not match its declared format.');
        }
        $preview = ['kind' => 'image', 'width' => (int) $image[0], 'height' => (int) $image[1]];
    } elseif ($extension === 'pdf') {
        if (!str_starts_with($bytes, '%PDF-')) {
            lab_api_error($requestId, 415, 'CONTENT_REJECTED', 'PDF signature is invalid.');
        }
        $preview = ['kind' => 'pdf', 'summary' => 'Validated PDF; raw bytes are never served.'];
    } else {
        if (str_contains($bytes, "\0") || preg_match('//u', $bytes) !== 1) {
            lab_api_error($requestId, 415, 'CONTENT_REJECTED', 'Text uploads must contain valid UTF-8 text without binary bytes.');
        }
        $trimmed = ltrim($bytes);
        if (preg_match('/^<(?:!doctype|html|script|svg)\b/i', $trimmed) === 1) {
            lab_api_error($requestId, 415, 'ACTIVE_CONTENT_REJECTED', 'HTML and active SVG content are not accepted.');
        }
        if ($extension === 'csv') {
            $lines = array_slice(preg_split('/\r?\n/', trim($bytes)) ?: [], 0, 11);
            $rows = array_map(static fn (string $line): array => array_slice(str_getcsv($line), 0, 12), $lines);
            if (count($rows) < 1 || count($rows[0]) < 2) {
                lab_api_error($requestId, 415, 'CONTENT_REJECTED', 'CSV uploads must contain at least two columns.');
            }
            $preview = ['kind' => 'csv', 'rows' => $rows];
        } else {
            $safe = preg_replace('/[\x00-\x08\x0b\x0c\x0e-\x1f\x7f]/', '', $bytes) ?? '';
            preg_match_all('/./us', $safe, $characters);
            $preview = ['kind' => 'text', 'text' => implode('', array_slice($characters[0] ?? [], 0, 500))];
        }
    }
    return ['name' => $name, 'tmp_name' => (string) $file['tmp_name'], 'size' => $size, 'mime' => $mime, 'preview' => $preview];
}

function lab_api_upload_route(PDO $pdo, array $session, string $method, string $requestId): never
{
    if ($method !== 'POST') {
        header('Allow: POST');
        lab_api_error($requestId, 405, 'METHOD_NOT_ALLOWED', 'Use POST for file uploads.');
    }
    lab_api_require_mutation_guard($session, $requestId);
    $contentLength = (int) ($_SERVER['CONTENT_LENGTH'] ?? 0);
    if ($contentLength > (LAB_API_UPLOAD_MAX_FILES * LAB_API_UPLOAD_MAX_FILE + 262144)) {
        lab_api_error($requestId, 413, 'UPLOAD_REQUEST_TOO_LARGE', 'The multipart upload request is too large.');
    }
    lab_api_cleanup($pdo);
    $files = array_map(
        static fn (array $file): array => lab_api_sniff_upload($file, $requestId),
        lab_api_uploaded_files($requestId)
    );
    $usage = $pdo->prepare('SELECT COUNT(*) AS file_count, COALESCE(SUM(size_bytes), 0) AS total_bytes
        FROM lab_uploads WHERE session_hash = ? AND expires_at >= ?');
    $usage->execute([$session['hash'], time()]);
    $current = $usage->fetch();
    $incomingBytes = array_sum(array_column($files, 'size'));
    if ((int) ($current['file_count'] ?? 0) + count($files) > LAB_API_UPLOAD_MAX_FILES
        || (int) ($current['total_bytes'] ?? 0) + $incomingBytes > LAB_API_UPLOAD_SESSION_BYTES) {
        lab_api_error($requestId, 409, 'UPLOAD_QUOTA_REACHED', 'This sandbox allows 5 files and 6 MiB until uploads expire or the sandbox resets.');
    }
    $directory = lab_api_upload_root() . '/' . $session['hash'];
    if (!is_dir($directory) && !mkdir($directory, 0700, true) && !is_dir($directory)) {
        lab_api_error($requestId, 503, 'UPLOAD_STORAGE_UNAVAILABLE', 'Private upload storage is unavailable.');
    }
    @chmod($directory, 0700);
    $created = [];
    $written = [];
    $now = time();
    try {
        $pdo->exec('BEGIN IMMEDIATE');
        $insert = $pdo->prepare('INSERT INTO lab_uploads
            (session_hash, upload_id, original_name, storage_name, mime, size_bytes, preview_json, created_at, expires_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)');
        foreach ($files as $file) {
            $id = 'upl-' . bin2hex(random_bytes(8));
            $storageName = bin2hex(random_bytes(16)) . '.upload';
            $destination = $directory . '/' . $storageName;
            if (!move_uploaded_file((string) $file['tmp_name'], $destination)) {
                throw new RuntimeException('A validated upload could not be moved into private storage.');
            }
            @chmod($destination, 0600);
            $written[] = $destination;
            $expiresAt = $now + LAB_API_UPLOAD_TTL;
            $insert->execute([
                $session['hash'],
                $id,
                $file['name'],
                $storageName,
                $file['mime'],
                $file['size'],
                json_encode($file['preview'], JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE | JSON_THROW_ON_ERROR),
                $now,
                $expiresAt,
            ]);
            $created[] = [
                'id' => $id,
                'name' => $file['name'],
                'mime' => $file['mime'],
                'size' => $file['size'],
                'preview' => $file['preview'],
                'expiresInSeconds' => LAB_API_UPLOAD_TTL,
            ];
        }
        $pdo->exec('COMMIT');
    } catch (Throwable) {
        if ($pdo->inTransaction()) {
            $pdo->rollBack();
        }
        foreach ($written as $path) {
            if (is_file($path)) {
                @unlink($path);
            }
        }
        lab_api_error($requestId, 503, 'UPLOAD_STORAGE_UNAVAILABLE', 'The validated upload could not be stored safely.');
    }
    lab_api_send(['data' => $created, 'requestId' => $requestId], 201, $requestId);
}

function lab_api_pdf_bytes(string $text): string
{
    $safe = preg_replace('/[^\x20-\x7e]/', '?', $text) ?? 'Testheon report';
    $safe = str_replace(['\\', '(', ')'], ['\\\\', '\\(', '\\)'], $safe);
    $stream = "BT /F1 12 Tf 50 760 Td ({$safe}) Tj ET";
    $objects = [
        '<< /Type /Catalog /Pages 2 0 R >>',
        '<< /Type /Pages /Kids [3 0 R] /Count 1 >>',
        '<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Resources << /Font << /F1 5 0 R >> >> /Contents 4 0 R >>',
        "<< /Length " . strlen($stream) . ">>\nstream\n{$stream}\nendstream",
        '<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>',
    ];
    $pdf = "%PDF-1.4\n";
    $offsets = [0];
    foreach ($objects as $index => $object) {
        $offsets[] = strlen($pdf);
        $number = $index + 1;
        $pdf .= "{$number} 0 obj\n{$object}\nendobj\n";
    }
    $xref = strlen($pdf);
    $pdf .= "xref\n0 " . (count($objects) + 1) . "\n0000000000 65535 f \n";
    for ($index = 1; $index <= count($objects); $index++) {
        $pdf .= sprintf('%010d 00000 n ', $offsets[$index]) . "\n";
    }
    return $pdf . "trailer << /Size " . (count($objects) + 1) . " /Root 1 0 R >>\nstartxref\n{$xref}\n%%EOF\n";
}

function lab_api_send_download(string $filename, string $mime, string $bytes, string $requestId): never
{
    if (preg_match('/^[a-z0-9][a-z0-9._-]{2,80}$/', $filename) !== 1) {
        throw new RuntimeException('Unsafe download filename.');
    }
    lab_api_common_headers($requestId, $mime);
    header('Content-Disposition: attachment; filename="' . $filename . '"');
    header('Content-Length: ' . strlen($bytes));
    http_response_code(200);
    echo $bytes;
    exit;
}

function lab_api_download_route(PDO $pdo, array $session, array $seed, string $kind, string $method, string $requestId): never
{
    if ($method !== 'GET') {
        header('Allow: GET');
        lab_api_error($requestId, 405, 'METHOD_NOT_ALLOWED', 'Use GET for downloads.');
    }
    foreach (array_keys($_GET) as $parameter) {
        if ($parameter !== 'delay') {
            lab_api_error($requestId, 400, 'INVALID_PARAMETER', 'Downloads accept only the delay query parameter.');
        }
    }
    $delay = lab_api_parse_int('delay', 0, 0, LAB_API_MAX_DELAY, $requestId);
    if ($delay > 0) {
        usleep($delay * 1000);
    }
    if ($kind === 'static-pdf') {
        lab_api_send_download('testheon-practice-checklist.pdf', 'application/pdf', lab_api_pdf_bytes('Testheon Practice Lab safe PDF fixture'), $requestId);
    }
    if ($kind === 'static-csv') {
        lab_api_send_download('testheon-practice-data.csv', 'text/csv; charset=utf-8', "case,status\nPW-FILE-001,passed\n", $requestId);
    }
    if ($kind === 'static-txt') {
        lab_api_send_download('testheon-practice-notes.txt', 'text/plain; charset=utf-8', "Testheon Practice Lab\nSynthetic download fixture.\n", $requestId);
    }
    $tasks = array_values(lab_api_records($pdo, $session, $seed, 'tasks'));
    if ($kind === 'dynamic-csv') {
        $stream = fopen('php://temp', 'r+');
        if ($stream === false) {
            lab_api_error($requestId, 503, 'REPORT_UNAVAILABLE', 'The report buffer is unavailable.');
        }
        fputcsv($stream, ['id', 'title', 'status', 'priority']);
        foreach (array_slice($tasks, 0, 20) as $task) {
            fputcsv($stream, [$task['id'], $task['title'], $task['status'], $task['priority']]);
        }
        rewind($stream);
        $csv = stream_get_contents($stream);
        fclose($stream);
        lab_api_send_download('testheon-session-tasks.csv', 'text/csv; charset=utf-8', is_string($csv) ? $csv : '', $requestId);
    }
    if ($kind === 'dynamic-pdf') {
        $counts = array_count_values(array_map(static fn (array $task): string => (string) $task['status'], $tasks));
        $line = sprintf('Testheon task report: todo %d, in progress %d, done %d.', $counts['todo'] ?? 0, $counts['in-progress'] ?? 0, $counts['done'] ?? 0);
        lab_api_send_download('testheon-session-report.pdf', 'application/pdf', lab_api_pdf_bytes($line), $requestId);
    }
    lab_api_error($requestId, 404, 'DOWNLOAD_NOT_FOUND', 'The requested download fixture does not exist.');
}

function lab_api_docs(string $requestId): never
{
    lab_api_common_headers($requestId, 'text/html; charset=utf-8');
    http_response_code(200);
    $resources = implode('', array_map(
        static fn (string $resource): string => '<li><code>/practice/api/v1/' . htmlspecialchars($resource, ENT_QUOTES) . '</code> — GET, POST, GET/PUT/PATCH/DELETE by ID</li>',
        array_keys(lab_api_contracts())
    ));
    echo '<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">'
        . '<meta name="robots" content="noindex,follow"><title>Testheon Practice API documentation</title>'
        . '<style>body{font:16px/1.6 Inter,system-ui,sans-serif;color:#111827;margin:0;background:#f7f6ff}main{max-width:900px;margin:auto;padding:3rem 1.25rem}h1,h2{font-family:Poppins,system-ui,sans-serif;line-height:1.2}code,pre{background:#ede9fe;border-radius:.35rem;padding:.15rem .35rem}pre{padding:1rem;overflow:auto}.card{background:white;border:1px solid #ddd6fe;border-radius:1rem;padding:1.25rem;margin:1rem 0}a{color:#6d28d9}</style>'
        . '</head><body><main><p><a href="/practice/">← Practice Lab</a></p><h1>Testheon Practice API</h1>'
        . '<p>Synthetic, deterministic REST practice data with isolated sandboxes. All responses are noindex and private/no-store.</p>'
        . '<div class="card"><h2>Resources</h2><ul>' . $resources . '</ul></div>'
        . '<div class="card"><h2>Sessions</h2><p>Browsers receive the secure <code>lab_sid</code> cookie. API-only tests may create header mode with <code>X-Lab-Mode: header</code>, then send <code>X-Lab-Session</code>.</p>'
        . '<p><code>GET /practice/api/v1/lab/session</code> returns sandbox stats. <code>POST /practice/api/v1/lab/reset</code> restores seed data for only that sandbox.</p></div>'
        . '<div class="card"><h2>Collection controls</h2><p><code>page</code>, <code>limit</code>, <code>cursor</code> on products/employees, <code>sort</code>, field filters, <code>q</code>, <code>delay=0..10000</code>, <code>simulate</code>, <code>seed</code>, and <code>size</code>.</p></div>'
        . '<div class="card"><h2>Authentication practice</h2><p><code>POST /practice/api/v1/auth/token</code> issues short-lived bearer and refresh tokens. Session-cookie, bearer-token and public demo API-key exercises are isolated from WordPress accounts.</p>'
        . '<p>Use <code>GET /practice/api/v1/auth/roles</code> for the permission matrix and <a href="/practice/apps/auth/">open the Auth app</a> for UI flows.</p></div>'
        . '<div class="card"><h2>Testheon Store</h2><p><code>GET /practice/api/v1/store/catalog</code> supports search, category, price, rating, sort and pagination. Cart, coupon, checkout, order, profile, location, reset and one-shot scenario routes share the same isolated sandbox.</p>'
        . '<p><a href="/practice/apps/ecommerce/">Open the indexable Store overview</a> for API setup → UI test → API verification and network interception exercises.</p></div>'
        . '<div class="card"><h2>Contract and errors</h2><p><a href="/practice/api/v1/openapi.json">OpenAPI 3.1 JSON</a></p>'
        . '<pre>{"error":{"code":"VALIDATION_FAILED","message":"...","details":[]},"requestId":"..."}</pre>'
        . '<p>Every identity and credential is synthetic, session-scoped practice data.</p></div>'
        . '</main></body></html>';
    exit;
}

function lab_api_cors(string $requestId): void
{
    $origin = (string) ($_SERVER['HTTP_ORIGIN'] ?? '');
    if ($origin !== '' && preg_match('#^https?://(?:localhost|127\.0\.0\.1)(?::[0-9]{1,5})?$#', $origin) === 1) {
        header('Access-Control-Allow-Origin: ' . $origin);
        header('Vary: Origin');
        header('Access-Control-Allow-Methods: GET, POST, PUT, PATCH, DELETE, OPTIONS');
        header('Access-Control-Allow-Headers: Authorization, Content-Type, X-Lab-Session, X-Lab-Mode, X-Lab-CSRF, X-Practice-Api-Key, X-Request-ID');
        header('Access-Control-Max-Age: 600');
    }
    if (($_SERVER['REQUEST_METHOD'] ?? 'GET') === 'OPTIONS') {
        lab_api_send([], 204, $requestId);
    }
}

function lab_api_dispatch(string $dataRoot): never
{
    $requestId = lab_api_request_id();
    lab_api_cors($requestId);
    $rawPath = (string) parse_url($_SERVER['REQUEST_URI'] ?? '/practice/api/', PHP_URL_PATH);
    $path = rawurldecode($rawPath);
    if (str_contains($path, "\0") || str_contains($path, '\\') || str_contains($path, '..') || str_contains($path, '%')) {
        lab_api_error($requestId, 400, 'INVALID_PATH', 'The request path is invalid.');
    }
    $prefix = '/practice/api';
    if (!str_starts_with($path, $prefix)) {
        lab_api_error($requestId, 404, 'NOT_FOUND', 'The API route was not found.');
    }
    $relative = trim(substr($path, strlen($prefix)), '/');
    if ($relative === '') {
        lab_api_docs($requestId);
    }
    if ($relative === 'v1/openapi.json') {
        $openApi = file_get_contents($dataRoot . '/openapi.json');
        if (!is_string($openApi)) {
            lab_api_error($requestId, 503, 'CONTRACT_UNAVAILABLE', 'The API contract is unavailable.');
        }
        lab_api_common_headers($requestId);
        http_response_code(200);
        echo $openApi;
        exit;
    }
    try {
        $pdo = lab_api_db();
        lab_api_real_rate_limit($pdo, $requestId);
    } catch (Throwable) {
        lab_api_error($requestId, 503, 'STORAGE_UNAVAILABLE', 'Practice storage is unavailable.');
    }
    $method = strtoupper((string) ($_SERVER['REQUEST_METHOD'] ?? 'GET'));
    if ($relative === 'v1/health') {
        if ($method !== 'GET' && $method !== 'HEAD') {
            header('Allow: GET, HEAD');
            lab_api_error($requestId, 405, 'METHOD_NOT_ALLOWED', 'Use GET for health.');
        }
        try {
            $seed = lab_api_seed($dataRoot);
            $active = (int) $pdo->query('SELECT COUNT(*) FROM lab_sessions')->fetchColumn();
            lab_api_send([
                'status' => 'ok',
                'version' => LAB_API_VERSION,
                'fixtureVersion' => (string) $seed['metadata']['fixtureVersion'],
                'storage' => ['status' => 'ok', 'driver' => 'sqlite', 'activeSessions' => $active, 'bytes' => lab_api_storage_bytes(lab_api_storage_root())],
                'requestId' => $requestId,
            ], 200, $requestId);
        } catch (Throwable) {
            lab_api_error($requestId, 503, 'HEALTH_FAILED', 'The Practice API is not healthy.');
        }
    }
    if ($relative === 'v1/lab/session') {
        if ($method === 'POST') {
            $expires = lab_api_parse_int('expiresIn', LAB_API_ABSOLUTE_TTL, 1, LAB_API_ABSOLUTE_TTL, $requestId);
            $existing = trim((string) ($_SERVER['HTTP_X_LAB_SESSION'] ?? '')) !== '' || trim((string) ($_COOKIE['lab_sid'] ?? '')) !== '';
            $session = $existing
                ? lab_api_resolve_session($pdo, $requestId, false)
                : lab_api_create_session($pdo, $requestId, strtolower((string) ($_SERVER['HTTP_X_LAB_MODE'] ?? '')) === 'header' ? 'header' : 'cookie', $expires);
            $status = $existing ? 200 : 201;
        } elseif ($method === 'GET') {
            $session = lab_api_resolve_session($pdo, $requestId, true);
            $status = 200;
        } else {
            header('Allow: GET, POST');
            lab_api_error($requestId, 405, 'METHOD_NOT_ALLOWED', 'Use GET or POST for a Lab session.');
        }
        $count = $pdo->prepare('SELECT COUNT(*) FROM lab_overlays WHERE session_hash = ? AND generation = ?');
        $count->execute([$session['hash'], (int) $session['row']['generation']]);
        $uploadUsage = $pdo->prepare('SELECT COUNT(*) AS file_count, COALESCE(SUM(size_bytes), 0) AS total_bytes
            FROM lab_uploads WHERE session_hash = ? AND expires_at >= ?');
        $uploadUsage->execute([$session['hash'], time()]);
        $uploads = $uploadUsage->fetch();
        lab_api_send([
            'data' => [
                'sessionId' => $session['token'],
                'mode' => $session['mode'],
                'fixtureVersion' => LAB_API_FIXTURE_VERSION,
                'generation' => (int) $session['row']['generation'],
                'overlayRecords' => (int) $count->fetchColumn(),
                'uploadFiles' => (int) ($uploads['file_count'] ?? 0),
                'uploadBytes' => (int) ($uploads['total_bytes'] ?? 0),
                'idleTtlSeconds' => (int) $session['row']['idle_ttl'],
                'absoluteTtlSeconds' => (int) $session['row']['absolute_ttl'],
                'csrfToken' => $session['mode'] === 'cookie' ? lab_api_csrf_token((string) $session['token']) : null,
            ],
            'requestId' => $requestId,
        ], $status, $requestId);
    }
    if ($relative === 'v1/lab/reset') {
        if ($method !== 'POST') {
            header('Allow: POST');
            lab_api_error($requestId, 405, 'METHOD_NOT_ALLOWED', 'Use POST to reset a sandbox.');
        }
        $session = lab_api_resolve_session($pdo, $requestId, false);
        lab_api_require_mutation_guard($session, $requestId);
        $pdo->exec('BEGIN IMMEDIATE');
        try {
            $next = (int) $session['row']['generation'] + 1;
            $update = $pdo->prepare('UPDATE lab_sessions SET generation = ?, sim_window = 0, sim_count = 0, last_seen = ? WHERE session_hash = ? AND generation = ?');
            $update->execute([$next, time(), $session['hash'], (int) $session['row']['generation']]);
            if ($update->rowCount() !== 1) {
                throw new RuntimeException('Session generation changed.');
            }
            $delete = $pdo->prepare('DELETE FROM lab_overlays WHERE session_hash = ?');
            $delete->execute([$session['hash']]);
            $deleteUploads = $pdo->prepare('DELETE FROM lab_uploads WHERE session_hash = ?');
            $deleteUploads->execute([$session['hash']]);
            lab_auth_reset_sandbox($pdo, (string) $session['hash']);
            lab_store_reset_sandbox($pdo, (string) $session['hash']);
            $pdo->exec('COMMIT');
        } catch (Throwable) {
            try {
                $pdo->exec('ROLLBACK');
            } catch (Throwable) {
            }
            lab_api_error($requestId, 409, 'RESET_CONFLICT', 'The sandbox could not be reset safely.');
        }
        lab_api_delete_upload_directory((string) $session['hash']);
        lab_api_send(['data' => ['reset' => true, 'generation' => $next, 'fixtureVersion' => LAB_API_FIXTURE_VERSION], 'requestId' => $requestId], 200, $requestId);
    }
    if (str_starts_with($relative, 'v1/auth/')) {
        $session = lab_api_resolve_session($pdo, $requestId, true);
        lab_auth_dispatch($pdo, $session, $relative, $method, $requestId);
    }
    if (str_starts_with($relative, 'v1/store/')) {
        $session = lab_api_resolve_session($pdo, $requestId, true);
        $seed = lab_api_seed($dataRoot);
        lab_store_dispatch($pdo, $session, $seed, $relative, $method, $requestId);
    }
    if ($relative === 'v1/files/upload') {
        $session = lab_api_resolve_session($pdo, $requestId, true);
        lab_api_upload_route($pdo, $session, $method, $requestId);
    }
    if (preg_match('#^v1/files/download/(static-pdf|static-csv|static-txt|dynamic-csv|dynamic-pdf)$#', $relative, $matches) === 1) {
        $session = lab_api_resolve_session($pdo, $requestId, true);
        $seed = lab_api_seed($dataRoot);
        lab_api_download_route($pdo, $session, $seed, $matches[1], $method, $requestId);
    }
    if (preg_match('#^v1/sim/status/([0-9]{3})$#', $relative, $matches) === 1) {
        $status = (int) $matches[1];
        if (!in_array($status, [400, 401, 403, 404, 409, 422, 429, 500, 503], true)) {
            lab_api_error($requestId, 400, 'INVALID_PARAMETER', 'The simulated status is not allowlisted.');
        }
        $headers = $status === 429 ? ['Retry-After' => '60'] : [];
        lab_api_error($requestId, $status, 'SIMULATED_' . $status, 'This is a deterministic simulated response.', [], $headers);
    }
    if ($relative === 'v1/sim/rate-limit') {
        if ($method !== 'GET') {
            header('Allow: GET');
            lab_api_error($requestId, 405, 'METHOD_NOT_ALLOWED', 'Use GET for simulated rate limiting.');
        }
        $session = lab_api_resolve_session($pdo, $requestId, true);
        $limit = lab_api_parse_int('limit', 3, 1, 20, $requestId);
        $window = intdiv(time(), 60);
        $pdo->exec('BEGIN IMMEDIATE');
        try {
            $update = $pdo->prepare('UPDATE lab_sessions SET sim_window = ?, sim_count = CASE WHEN sim_window = ? THEN sim_count + 1 ELSE 1 END WHERE session_hash = ?');
            $update->execute([$window, $window, $session['hash']]);
            $read = $pdo->prepare('SELECT sim_count FROM lab_sessions WHERE session_hash = ?');
            $read->execute([$session['hash']]);
            $count = (int) $read->fetchColumn();
            $pdo->exec('COMMIT');
        } catch (Throwable) {
            try {
                $pdo->exec('ROLLBACK');
            } catch (Throwable) {
            }
            lab_api_error($requestId, 503, 'STORAGE_BUSY', 'The simulated counter is temporarily unavailable.');
        }
        if ($count > $limit) {
            lab_api_error($requestId, 429, 'SIMULATED_RATE_LIMIT', 'The deterministic simulated limit was reached.', [['limit' => $limit, 'count' => $count]], ['Retry-After' => '60']);
        }
        lab_api_send(['data' => ['limit' => $limit, 'count' => $count, 'remaining' => max(0, $limit - $count)], 'requestId' => $requestId], 200, $requestId);
    }
    if (preg_match('#^v1/(users|products|orders|customers|employees|tasks|tickets|bookings)(?:/([a-z0-9][a-z0-9-]{2,63}))?$#', $relative, $matches) === 1) {
        $session = lab_api_resolve_session($pdo, $requestId, true);
        $seed = lab_api_seed($dataRoot);
        lab_api_resource_route($pdo, $session, $seed, $matches[1], $matches[2] ?? null, $method, $requestId);
    }
    lab_api_error($requestId, 404, 'NOT_FOUND', 'The API route was not found.');
}
