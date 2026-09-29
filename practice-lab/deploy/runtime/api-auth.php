<?php
declare(strict_types=1);

const LAB_AUTH_SHARED_PASSWORD = 'Practice@123';
const LAB_AUTH_DEMO_API_KEY = 'testheon-demo-key-4803';
const LAB_AUTH_LOCK_ATTEMPTS = 3;
const LAB_AUTH_LOCK_SECONDS = 300;
const LAB_AUTH_ACCESS_TTL = 120;
const LAB_AUTH_REFRESH_TTL = 900;

function lab_auth_roles(): array
{
    return [
        'Customer' => ['profile.read', 'orders.create'],
        'Employee' => ['profile.read', 'tickets.update'],
        'Manager' => ['profile.read', 'tickets.update', 'reports.read'],
        'Admin' => ['profile.read', 'orders.create', 'tickets.update', 'reports.read', 'users.manage'],
        'Read-only' => ['profile.read', 'reports.read'],
    ];
}

function lab_auth_demo_accounts(): array
{
    return [
        ['standard_user', 'Standard User', 'Customer', 0, 0],
        ['admin_user', 'Admin User', 'Admin', 0, 0],
        ['manager_user', 'Manager User', 'Manager', 0, 0],
        ['employee_user', 'Employee User', 'Employee', 0, 0],
        ['readonly_user', 'Read-only User', 'Read-only', 0, 0],
        ['locked_user', 'Locked User', 'Customer', 1, 0],
        ['expired_user', 'Expired Password User', 'Customer', 0, 1],
        ['slow_user', 'Slow User', 'Customer', 0, 0],
    ];
}

function lab_auth_ensure_schema(PDO $pdo): void
{
    static $ready = false;
    if ($ready) {
        return;
    }
    $pdo->exec('CREATE TABLE IF NOT EXISTS lab_auth_users (
        session_hash TEXT NOT NULL,
        username TEXT NOT NULL,
        display_name TEXT NOT NULL,
        email TEXT NOT NULL,
        password_hash TEXT NOT NULL,
        role TEXT NOT NULL,
        locked_permanent INTEGER NOT NULL DEFAULT 0,
        failed_attempts INTEGER NOT NULL DEFAULT 0,
        locked_until INTEGER NOT NULL DEFAULT 0,
        password_expired INTEGER NOT NULL DEFAULT 0,
        is_demo INTEGER NOT NULL DEFAULT 0,
        created_at INTEGER NOT NULL,
        PRIMARY KEY (session_hash, username),
        FOREIGN KEY (session_hash) REFERENCES lab_sessions(session_hash) ON DELETE CASCADE
    )');
    $pdo->exec('CREATE TABLE IF NOT EXISTS lab_auth_sessions (
        auth_hash TEXT PRIMARY KEY,
        session_hash TEXT NOT NULL,
        username TEXT NOT NULL,
        created_at INTEGER NOT NULL,
        last_seen INTEGER NOT NULL,
        idle_ttl INTEGER NOT NULL,
        expires_at INTEGER NOT NULL,
        remembered INTEGER NOT NULL DEFAULT 0,
        revoked INTEGER NOT NULL DEFAULT 0,
        FOREIGN KEY (session_hash, username) REFERENCES lab_auth_users(session_hash, username) ON DELETE CASCADE
    )');
    $pdo->exec('CREATE TABLE IF NOT EXISTS lab_auth_tokens (
        token_hash TEXT PRIMARY KEY,
        session_hash TEXT NOT NULL,
        username TEXT NOT NULL,
        token_type TEXT NOT NULL,
        created_at INTEGER NOT NULL,
        expires_at INTEGER NOT NULL,
        revoked INTEGER NOT NULL DEFAULT 0,
        FOREIGN KEY (session_hash, username) REFERENCES lab_auth_users(session_hash, username) ON DELETE CASCADE
    )');
    $pdo->exec('CREATE TABLE IF NOT EXISTS lab_auth_resets (
        token_hash TEXT PRIMARY KEY,
        token_value TEXT NOT NULL,
        session_hash TEXT NOT NULL,
        username TEXT NOT NULL,
        purpose TEXT NOT NULL,
        created_at INTEGER NOT NULL,
        expires_at INTEGER NOT NULL,
        used INTEGER NOT NULL DEFAULT 0,
        FOREIGN KEY (session_hash, username) REFERENCES lab_auth_users(session_hash, username) ON DELETE CASCADE
    )');
    $ready = true;
}

function lab_auth_ensure_demo_users(PDO $pdo, string $sessionHash): void
{
    $count = $pdo->prepare('SELECT COUNT(*) FROM lab_auth_users WHERE session_hash = ? AND is_demo = 1');
    $count->execute([$sessionHash]);
    if ((int) $count->fetchColumn() === count(lab_auth_demo_accounts())) {
        return;
    }
    $passwordHash = password_hash(LAB_AUTH_SHARED_PASSWORD, PASSWORD_DEFAULT);
    if (!is_string($passwordHash)) {
        throw new RuntimeException('Demo password hashing is unavailable.');
    }
    $insert = $pdo->prepare('INSERT OR IGNORE INTO lab_auth_users
        (session_hash, username, display_name, email, password_hash, role, locked_permanent,
         failed_attempts, locked_until, password_expired, is_demo, created_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, 0, 0, ?, 1, ?)');
    $now = time();
    foreach (lab_auth_demo_accounts() as [$username, $displayName, $role, $locked, $expired]) {
        $insert->execute([
            $sessionHash,
            $username,
            $displayName,
            $username . '@practice.test',
            $passwordHash,
            $role,
            $locked,
            $expired,
            $now,
        ]);
    }
}

function lab_auth_cleanup(PDO $pdo, int $now): void
{
    lab_auth_ensure_schema($pdo);
    foreach ([
        'DELETE FROM lab_auth_sessions WHERE revoked = 1 OR expires_at < ? OR (? - last_seen) > idle_ttl',
        'DELETE FROM lab_auth_tokens WHERE revoked = 1 OR expires_at < ?',
        'DELETE FROM lab_auth_resets WHERE used = 1 OR expires_at < ?',
    ] as $index => $sql) {
        $statement = $pdo->prepare($sql);
        $statement->execute($index === 0 ? [$now, $now] : [$now]);
    }
}

function lab_auth_reset_sandbox(PDO $pdo, string $sessionHash): void
{
    lab_auth_ensure_schema($pdo);
    $delete = $pdo->prepare('DELETE FROM lab_auth_users WHERE session_hash = ?');
    $delete->execute([$sessionHash]);
}

function lab_auth_read_string(array $body, string $field, string $requestId, int $max = 120): string
{
    $value = trim((string) ($body[$field] ?? ''));
    if ($value === '' || strlen($value) > $max) {
        lab_api_error($requestId, 422, 'VALIDATION_FAILED', 'The request contains invalid fields.', [
            ['field' => $field, 'issue' => "must contain 1-{$max} characters"],
        ]);
    }
    return $value;
}

function lab_auth_public_user(array $user): array
{
    return [
        'username' => (string) $user['username'],
        'displayName' => (string) $user['display_name'],
        'role' => (string) $user['role'],
        'permissions' => lab_auth_roles()[(string) $user['role']] ?? [],
        'demo' => (bool) $user['is_demo'],
    ];
}

function lab_auth_find_user(PDO $pdo, string $sessionHash, string $username): ?array
{
    $read = $pdo->prepare('SELECT * FROM lab_auth_users WHERE session_hash = ? AND username = ?');
    $read->execute([$sessionHash, strtolower($username)]);
    $user = $read->fetch();
    return is_array($user) ? $user : null;
}

function lab_auth_login_rate_limit(PDO $pdo, string $sessionHash, string $username, string $requestId): void
{
    $address = (string) ($_SERVER['REMOTE_ADDR'] ?? 'unknown');
    $key = hash_hmac('sha256', $sessionHash . '|' . strtolower($username) . '|' . $address, (string) lab_config()['api_secret']);
    $window = intdiv(time(), 60);
    $pdo->exec('BEGIN IMMEDIATE');
    try {
        $upsert = $pdo->prepare('INSERT INTO lab_rate_limits(scope, key_hash, window, count)
            VALUES (\'auth-login\', ?, ?, 1)
            ON CONFLICT(scope, key_hash, window) DO UPDATE SET count = count + 1');
        $upsert->execute([$key, $window]);
        $read = $pdo->prepare('SELECT count FROM lab_rate_limits WHERE scope = \'auth-login\' AND key_hash = ? AND window = ?');
        $read->execute([$key, $window]);
        $count = (int) $read->fetchColumn();
        $pdo->exec('COMMIT');
    } catch (Throwable $error) {
        $pdo->exec('ROLLBACK');
        throw $error;
    }
    if ($count > 8) {
        lab_api_error($requestId, 429, 'AUTH_RATE_LIMITED', 'Too many sign-in attempts. Try again after the practice window resets.', [], ['Retry-After' => '60']);
    }
}

function lab_auth_failed_login(PDO $pdo, array $user): void
{
    if ((bool) $user['locked_permanent']) {
        return;
    }
    $failures = (int) $user['failed_attempts'] + 1;
    $lockedUntil = $failures >= LAB_AUTH_LOCK_ATTEMPTS ? time() + LAB_AUTH_LOCK_SECONDS : 0;
    $update = $pdo->prepare('UPDATE lab_auth_users SET failed_attempts = ?, locked_until = ? WHERE session_hash = ? AND username = ?');
    $update->execute([$failures, $lockedUntil, $user['session_hash'], $user['username']]);
}

function lab_auth_issue_reset(PDO $pdo, array $user, string $purpose): string
{
    $value = 'rst_' . bin2hex(random_bytes(20));
    $hash = hash('sha256', $value);
    $insert = $pdo->prepare('INSERT INTO lab_auth_resets
        (token_hash, token_value, session_hash, username, purpose, created_at, expires_at, used)
        VALUES (?, ?, ?, ?, ?, ?, ?, 0)');
    $now = time();
    $insert->execute([$hash, $value, $user['session_hash'], $user['username'], $purpose, $now, $now + 600]);
    return $value;
}

function lab_auth_set_session_cookie(string $token, bool $remember, int $expiresAt): void
{
    $options = [
        'path' => '/practice/',
        'secure' => true,
        'httponly' => true,
        'samesite' => 'Lax',
    ];
    if ($remember) {
        $options['expires'] = $expiresAt;
    }
    setcookie('practice_auth', $token, $options);
    setcookie('practice_ui', 'comfortable', [
        'expires' => time() + 604800,
        'path' => '/practice/',
        'secure' => true,
        'httponly' => false,
        'samesite' => 'Lax',
    ]);
}

function lab_auth_clear_session_cookie(): void
{
    setcookie('practice_auth', '', [
        'expires' => time() - 3600,
        'path' => '/practice/',
        'secure' => true,
        'httponly' => true,
        'samesite' => 'Lax',
    ]);
}

function lab_auth_create_ui_session(PDO $pdo, array $user, bool $remember, int $idleTtl): array
{
    $token = bin2hex(random_bytes(24));
    $now = time();
    $expiresAt = $now + ($remember ? 604800 : 3600);
    $insert = $pdo->prepare('INSERT INTO lab_auth_sessions
        (auth_hash, session_hash, username, created_at, last_seen, idle_ttl, expires_at, remembered, revoked)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, 0)');
    $insert->execute([
        hash('sha256', $token),
        $user['session_hash'],
        $user['username'],
        $now,
        $now,
        $idleTtl,
        $expiresAt,
        $remember ? 1 : 0,
    ]);
    lab_auth_set_session_cookie($token, $remember, $expiresAt);
    return ['expiresAt' => $expiresAt, 'idleTtlSeconds' => $idleTtl, 'remembered' => $remember];
}

function lab_auth_bearer_token(): ?string
{
    $header = trim((string) ($_SERVER['HTTP_AUTHORIZATION'] ?? ''));
    if (stripos($header, 'Bearer ') === 0) {
        return trim(substr($header, 7));
    }
    return null;
}

function lab_auth_resolve_identity(PDO $pdo, string $sessionHash, string $requestId, bool $required = true): ?array
{
    $now = time();
    $bearer = lab_auth_bearer_token();
    if ($bearer !== null) {
        $read = $pdo->prepare('SELECT * FROM lab_auth_tokens WHERE token_hash = ? AND session_hash = ? AND token_type = \'access\'');
        $read->execute([hash('sha256', $bearer), $sessionHash]);
        $token = $read->fetch();
        if (!is_array($token) || (bool) $token['revoked']) {
            lab_api_error($requestId, 401, 'TOKEN_INVALID', 'The practice access token is invalid.');
        }
        if ((int) $token['expires_at'] < $now) {
            lab_api_error($requestId, 401, 'TOKEN_EXPIRED', 'The practice access token expired.');
        }
        $user = lab_auth_find_user($pdo, $sessionHash, (string) $token['username']);
        if (!is_array($user)) {
            lab_api_error($requestId, 401, 'TOKEN_INVALID', 'The practice access token is invalid.');
        }
        return ['user' => $user, 'source' => 'bearer', 'credentialHash' => (string) $token['token_hash']];
    }
    $cookie = trim((string) ($_COOKIE['practice_auth'] ?? ''));
    if ($cookie === '') {
        if ($required) {
            lab_api_error($requestId, 401, 'AUTH_REQUIRED', 'Sign in with a practice account.');
        }
        return null;
    }
    if (preg_match('/^[a-f0-9]{48}$/', $cookie) !== 1) {
        lab_api_error($requestId, 401, 'AUTH_SESSION_INVALID', 'The practice session is invalid.');
    }
    $read = $pdo->prepare('SELECT * FROM lab_auth_sessions WHERE auth_hash = ? AND session_hash = ?');
    $hash = hash('sha256', $cookie);
    $read->execute([$hash, $sessionHash]);
    $auth = $read->fetch();
    if (!is_array($auth) || (bool) $auth['revoked']) {
        lab_api_error($requestId, 401, 'AUTH_SESSION_INVALID', 'The practice session is invalid.');
    }
    if ((int) $auth['expires_at'] < $now || ($now - (int) $auth['last_seen']) > (int) $auth['idle_ttl']) {
        $revoke = $pdo->prepare('UPDATE lab_auth_sessions SET revoked = 1 WHERE auth_hash = ?');
        $revoke->execute([$hash]);
        lab_auth_clear_session_cookie();
        lab_api_error($requestId, 401, 'AUTH_SESSION_EXPIRED', 'The practice session expired.');
    }
    $touch = $pdo->prepare('UPDATE lab_auth_sessions SET last_seen = ? WHERE auth_hash = ?');
    $touch->execute([$now, $hash]);
    $user = lab_auth_find_user($pdo, $sessionHash, (string) $auth['username']);
    if (!is_array($user)) {
        lab_api_error($requestId, 401, 'AUTH_SESSION_INVALID', 'The practice session is invalid.');
    }
    return [
        'user' => $user,
        'source' => 'cookie',
        'credentialHash' => $hash,
        'session' => $auth,
    ];
}

function lab_auth_issue_api_tokens(PDO $pdo, array $user, bool $expired = false): array
{
    $now = time();
    $access = 'atk_' . bin2hex(random_bytes(24));
    $refresh = 'rtk_' . bin2hex(random_bytes(24));
    $accessExpiry = $expired ? $now - 1 : $now + LAB_AUTH_ACCESS_TTL;
    $refreshExpiry = $now + LAB_AUTH_REFRESH_TTL;
    $insert = $pdo->prepare('INSERT INTO lab_auth_tokens
        (token_hash, session_hash, username, token_type, created_at, expires_at, revoked)
        VALUES (?, ?, ?, ?, ?, ?, 0)');
    $insert->execute([hash('sha256', $access), $user['session_hash'], $user['username'], 'access', $now, $accessExpiry]);
    $insert->execute([hash('sha256', $refresh), $user['session_hash'], $user['username'], 'refresh', $now, $refreshExpiry]);
    return [
        'tokenType' => 'Bearer',
        'accessToken' => $access,
        'expiresIn' => max(0, $accessExpiry - $now),
        'refreshToken' => $refresh,
        'refreshExpiresIn' => LAB_AUTH_REFRESH_TTL,
        'user' => lab_auth_public_user($user),
    ];
}

function lab_auth_verify_credentials(PDO $pdo, array $session, array $body, string $requestId): array
{
    $username = strtolower(lab_auth_read_string($body, 'username', $requestId, 40));
    $password = lab_auth_read_string($body, 'password', $requestId, 200);
    lab_auth_login_rate_limit($pdo, (string) $session['hash'], $username, $requestId);
    if ($username === 'slow_user') {
        $delay = isset($_GET['delay']) ? lab_api_parse_int('delay', 3000, 0, 3000, $requestId) : 3000;
        if (!in_array($delay, [0, 3000], true)) {
            lab_api_error($requestId, 400, 'INVALID_PARAMETER', 'slow_user delay must be 0 or 3000 milliseconds.');
        }
        if ($delay > 0) {
            usleep($delay * 1000);
        }
    }
    $user = lab_auth_find_user($pdo, (string) $session['hash'], $username);
    $valid = is_array($user) && password_verify($password, (string) $user['password_hash']);
    $locked = is_array($user) && ((bool) $user['locked_permanent'] || (int) $user['locked_until'] > time());
    if (!$valid || $locked) {
        if (is_array($user) && !$locked) {
            lab_auth_failed_login($pdo, $user);
        }
        lab_api_error($requestId, 401, 'AUTHENTICATION_FAILED', 'The username or password is incorrect, or the practice account is unavailable.');
    }
    if ((bool) $user['password_expired']) {
        $changeToken = lab_auth_issue_reset($pdo, $user, 'forced-change');
        lab_api_send([
            'error' => [
                'code' => 'PASSWORD_CHANGE_REQUIRED',
                'message' => 'This public demo password must be changed before sign-in.',
                'details' => [],
            ],
            'data' => ['changeToken' => $changeToken],
            'requestId' => $requestId,
        ], 409, $requestId);
    }
    $clear = $pdo->prepare('UPDATE lab_auth_users SET failed_attempts = 0, locked_until = 0 WHERE session_hash = ? AND username = ?');
    $clear->execute([$session['hash'], $username]);
    return $user;
}

function lab_auth_require_permission(array $identity, string $permission, string $requestId): void
{
    $permissions = lab_auth_roles()[(string) $identity['user']['role']] ?? [];
    if (!in_array($permission, $permissions, true)) {
        lab_api_error($requestId, 403, 'PERMISSION_DENIED', 'The signed-in practice role does not allow this action.', [
            ['permission' => $permission],
        ]);
    }
}

function lab_auth_dispatch(PDO $pdo, array $session, string $relative, string $method, string $requestId): never
{
    lab_auth_ensure_schema($pdo);
    lab_auth_ensure_demo_users($pdo, (string) $session['hash']);
    $route = substr($relative, strlen('v1/auth/'));

    if ($route === 'roles' && $method === 'GET') {
        $matrix = [];
        foreach (lab_auth_roles() as $role => $permissions) {
            $matrix[] = ['role' => $role, 'permissions' => $permissions];
        }
        lab_api_send(['data' => $matrix, 'requestId' => $requestId], 200, $requestId);
    }

    if ($route === 'login' && $method === 'POST') {
        lab_api_require_mutation_guard($session, $requestId);
        $body = lab_api_read_json($requestId);
        $user = lab_auth_verify_credentials($pdo, $session, $body, $requestId);
        $remember = ($body['rememberMe'] ?? false) === true;
        $idle = (int) ($body['idleSeconds'] ?? 300);
        if ($idle < 5 || $idle > 1800) {
            lab_api_error($requestId, 422, 'VALIDATION_FAILED', 'Idle expiry must be between 5 and 1800 seconds.', [['field' => 'idleSeconds']]);
        }
        $authSession = lab_auth_create_ui_session($pdo, $user, $remember, $idle);
        lab_api_send(['data' => [
            'user' => lab_auth_public_user($user),
            'session' => $authSession,
            'uiPreferenceCookie' => 'practice_ui',
        ], 'requestId' => $requestId], 200, $requestId);
    }

    if ($route === 'register' && $method === 'POST') {
        lab_api_require_mutation_guard($session, $requestId);
        $body = lab_api_read_json($requestId);
        $username = strtolower(lab_auth_read_string($body, 'username', $requestId, 24));
        $displayName = lab_auth_read_string($body, 'displayName', $requestId, 80);
        $email = strtolower(lab_auth_read_string($body, 'email', $requestId, 120));
        $password = lab_auth_read_string($body, 'password', $requestId, 200);
        $details = [];
        if (preg_match('/^[a-z][a-z0-9_]{2,23}$/', $username) !== 1) {
            $details[] = ['field' => 'username', 'issue' => 'use 3-24 lowercase letters, numbers, or underscores'];
        }
        if (filter_var($email, FILTER_VALIDATE_EMAIL) === false) {
            $details[] = ['field' => 'email', 'issue' => 'must be a valid synthetic email'];
        }
        if (strlen($password) < 10) {
            $details[] = ['field' => 'password', 'issue' => 'must contain at least 10 characters'];
        }
        if ($details !== []) {
            lab_api_error($requestId, 422, 'VALIDATION_FAILED', 'The request contains invalid fields.', $details);
        }
        if (lab_auth_find_user($pdo, (string) $session['hash'], $username) !== null) {
            lab_api_error($requestId, 409, 'USERNAME_UNAVAILABLE', 'Choose a different practice username.');
        }
        $passwordHash = password_hash($password, PASSWORD_DEFAULT);
        if (!is_string($passwordHash)) {
            lab_api_error($requestId, 503, 'PASSWORD_HASH_UNAVAILABLE', 'The sandbox cannot create an account right now.');
        }
        $insert = $pdo->prepare('INSERT INTO lab_auth_users
            (session_hash, username, display_name, email, password_hash, role, locked_permanent,
             failed_attempts, locked_until, password_expired, is_demo, created_at)
            VALUES (?, ?, ?, ?, ?, \'Customer\', 0, 0, 0, 0, 0, ?)');
        $insert->execute([$session['hash'], $username, $displayName, $email, $passwordHash, time()]);
        $user = lab_auth_find_user($pdo, (string) $session['hash'], $username);
        lab_api_send(['data' => ['user' => lab_auth_public_user((array) $user)], 'requestId' => $requestId], 201, $requestId);
    }

    if ($route === 'forgot-password' && $method === 'POST') {
        lab_api_require_mutation_guard($session, $requestId);
        $body = lab_api_read_json($requestId);
        $username = strtolower(lab_auth_read_string($body, 'username', $requestId, 120));
        $user = lab_auth_find_user($pdo, (string) $session['hash'], $username);
        if (is_array($user)) {
            lab_auth_issue_reset($pdo, $user, 'forgot');
        }
        lab_api_send(['data' => [
            'message' => 'If the practice account is eligible, a reset link is now in Practice Inbox.',
            'emailSent' => false,
        ], 'requestId' => $requestId], 202, $requestId);
    }

    if ($route === 'inbox' && $method === 'GET') {
        $read = $pdo->prepare('SELECT username, token_value, purpose, expires_at FROM lab_auth_resets
            WHERE session_hash = ? AND used = 0 AND expires_at >= ? ORDER BY created_at DESC LIMIT 10');
        $read->execute([$session['hash'], time()]);
        $messages = array_map(static fn (array $row): array => [
            'to' => (string) $row['username'],
            'subject' => $row['purpose'] === 'forced-change' ? 'Change your practice password' : 'Reset your practice password',
            'resetUrl' => '/practice/apps/auth/?reset=' . rawurlencode((string) $row['token_value']),
            'expiresAt' => gmdate('c', (int) $row['expires_at']),
        ], $read->fetchAll());
        lab_api_send(['data' => $messages, 'requestId' => $requestId], 200, $requestId);
    }

    if ($route === 'reset-password' && $method === 'POST') {
        lab_api_require_mutation_guard($session, $requestId);
        $body = lab_api_read_json($requestId);
        $token = lab_auth_read_string($body, 'token', $requestId, 100);
        $password = lab_auth_read_string($body, 'newPassword', $requestId, 200);
        if (strlen($password) < 10) {
            lab_api_error($requestId, 422, 'VALIDATION_FAILED', 'The request contains invalid fields.', [['field' => 'newPassword', 'issue' => 'must contain at least 10 characters']]);
        }
        $read = $pdo->prepare('SELECT * FROM lab_auth_resets WHERE token_hash = ? AND session_hash = ? AND used = 0');
        $hash = hash('sha256', $token);
        $read->execute([$hash, $session['hash']]);
        $reset = $read->fetch();
        if (!is_array($reset) || (int) $reset['expires_at'] < time()) {
            lab_api_error($requestId, 400, 'RESET_INVALID', 'The practice reset link is invalid or expired.');
        }
        $passwordHash = password_hash($password, PASSWORD_DEFAULT);
        if (!is_string($passwordHash)) {
            lab_api_error($requestId, 503, 'PASSWORD_HASH_UNAVAILABLE', 'The sandbox cannot update the password right now.');
        }
        $pdo->exec('BEGIN IMMEDIATE');
        try {
            $userUpdate = $pdo->prepare('UPDATE lab_auth_users SET password_hash = ?, password_expired = 0, failed_attempts = 0, locked_until = 0 WHERE session_hash = ? AND username = ?');
            $userUpdate->execute([$passwordHash, $session['hash'], $reset['username']]);
            $mark = $pdo->prepare('UPDATE lab_auth_resets SET used = 1 WHERE token_hash = ?');
            $mark->execute([$hash]);
            $revoke = $pdo->prepare('UPDATE lab_auth_sessions SET revoked = 1 WHERE session_hash = ? AND username = ?');
            $revoke->execute([$session['hash'], $reset['username']]);
            $pdo->exec('COMMIT');
        } catch (Throwable $error) {
            $pdo->exec('ROLLBACK');
            throw $error;
        }
        lab_auth_clear_session_cookie();
        lab_api_send(['data' => ['passwordReset' => true], 'requestId' => $requestId], 200, $requestId);
    }

    if ($route === 'lockout/reset' && $method === 'POST') {
        lab_api_require_mutation_guard($session, $requestId);
        $body = lab_api_read_json($requestId);
        $username = strtolower(lab_auth_read_string($body, 'username', $requestId, 40));
        $reset = $pdo->prepare('UPDATE lab_auth_users SET failed_attempts = 0, locked_until = 0
            WHERE session_hash = ? AND username = ? AND locked_permanent = 0');
        $reset->execute([$session['hash'], $username]);
        lab_api_send(['data' => ['message' => 'If the account had a temporary lock, it is reset.'], 'requestId' => $requestId], 200, $requestId);
    }

    if ($route === 'logout' && $method === 'POST') {
        lab_api_require_mutation_guard($session, $requestId);
        $identity = lab_auth_resolve_identity($pdo, (string) $session['hash'], $requestId, true);
        if ($identity['source'] === 'cookie') {
            $revoke = $pdo->prepare('UPDATE lab_auth_sessions SET revoked = 1 WHERE auth_hash = ?');
        } else {
            $revoke = $pdo->prepare('UPDATE lab_auth_tokens SET revoked = 1 WHERE token_hash = ?');
        }
        $revoke->execute([$identity['credentialHash']]);
        lab_auth_clear_session_cookie();
        lab_api_send(['data' => ['loggedOut' => true], 'requestId' => $requestId], 200, $requestId);
    }

    if ($route === 'session/expire' && $method === 'POST') {
        lab_api_require_mutation_guard($session, $requestId);
        $identity = lab_auth_resolve_identity($pdo, (string) $session['hash'], $requestId, true);
        if ($identity['source'] !== 'cookie') {
            lab_api_error($requestId, 422, 'COOKIE_SESSION_REQUIRED', 'Use the UI session for this expiry exercise.');
        }
        $expire = $pdo->prepare('UPDATE lab_auth_sessions SET last_seen = 0 WHERE auth_hash = ?');
        $expire->execute([$identity['credentialHash']]);
        lab_api_send(['data' => ['expired' => true], 'requestId' => $requestId], 200, $requestId);
    }

    if ($route === 'me' && $method === 'GET') {
        $identity = lab_auth_resolve_identity($pdo, (string) $session['hash'], $requestId, true);
        lab_api_send(['data' => [
            'user' => lab_auth_public_user($identity['user']),
            'authentication' => $identity['source'],
        ], 'requestId' => $requestId], 200, $requestId);
    }

    if ($route === 'token' && $method === 'POST') {
        lab_api_require_mutation_guard($session, $requestId);
        $body = lab_api_read_json($requestId);
        $user = lab_auth_verify_credentials($pdo, $session, $body, $requestId);
        $expired = ($body['scenario'] ?? '') === 'expired';
        lab_api_send(['data' => lab_auth_issue_api_tokens($pdo, $user, $expired), 'requestId' => $requestId], 200, $requestId);
    }

    if ($route === 'refresh' && $method === 'POST') {
        lab_api_require_mutation_guard($session, $requestId);
        $body = lab_api_read_json($requestId);
        $refresh = lab_auth_read_string($body, 'refreshToken', $requestId, 100);
        $hash = hash('sha256', $refresh);
        $read = $pdo->prepare('SELECT * FROM lab_auth_tokens WHERE token_hash = ? AND session_hash = ? AND token_type = \'refresh\'');
        $read->execute([$hash, $session['hash']]);
        $token = $read->fetch();
        if (!is_array($token) || (bool) $token['revoked'] || (int) $token['expires_at'] < time()) {
            lab_api_error($requestId, 401, 'REFRESH_TOKEN_INVALID', 'The practice refresh token is invalid or expired.');
        }
        $revoke = $pdo->prepare('UPDATE lab_auth_tokens SET revoked = 1 WHERE token_hash = ?');
        $revoke->execute([$hash]);
        $user = lab_auth_find_user($pdo, (string) $session['hash'], (string) $token['username']);
        lab_api_send(['data' => lab_auth_issue_api_tokens($pdo, (array) $user), 'requestId' => $requestId], 200, $requestId);
    }

    if ($route === 'api-key/profile' && $method === 'GET') {
        $key = trim((string) ($_SERVER['HTTP_X_PRACTICE_API_KEY'] ?? ''));
        if (!hash_equals(LAB_AUTH_DEMO_API_KEY, $key)) {
            lab_api_error($requestId, 401, 'API_KEY_INVALID', 'The public practice API key is invalid.');
        }
        lab_api_send(['data' => [
            'authenticated' => true,
            'principal' => 'public_demo_api_key',
            'scope' => ['profile.read'],
        ], 'requestId' => $requestId], 200, $requestId);
    }

    if ($route === 'protected' && in_array($method, ['GET', 'POST'], true)) {
        if ($method === 'POST') {
            lab_api_require_mutation_guard($session, $requestId);
            $body = lab_api_read_json($requestId);
            $permission = lab_auth_read_string($body, 'permission', $requestId, 40);
        } else {
            $permission = trim((string) ($_GET['permission'] ?? 'reports.read'));
        }
        if (!in_array($permission, ['profile.read', 'orders.create', 'tickets.update', 'reports.read', 'users.manage'], true)) {
            lab_api_error($requestId, 422, 'PERMISSION_INVALID', 'Use a permission from the published role matrix.');
        }
        $identity = lab_auth_resolve_identity($pdo, (string) $session['hash'], $requestId, true);
        lab_auth_require_permission($identity, $permission, $requestId);
        lab_api_send(['data' => [
            'allowed' => true,
            'permission' => $permission,
            'role' => (string) $identity['user']['role'],
        ], 'requestId' => $requestId], 200, $requestId);
    }

    header('Allow: GET, POST');
    lab_api_error($requestId, 405, 'METHOD_NOT_ALLOWED', 'The authentication route or method is not available.');
}
