<?php
declare(strict_types=1);

function lab_config(): array
{
    static $config;
    if (!is_array($config)) {
        $loaded = require __DIR__ . '/.gate.php';
        if (!is_array($loaded)) {
            http_response_code(503);
            exit('Staging gate unavailable.');
        }
        $config = $loaded;
    }
    return $config;
}

function lab_basic_credentials(): array
{
    $user = $_SERVER['PHP_AUTH_USER'] ?? '';
    $password = $_SERVER['PHP_AUTH_PW'] ?? '';
    if ($user === '' && isset($_SERVER['HTTP_AUTHORIZATION'])) {
        $header = (string) $_SERVER['HTTP_AUTHORIZATION'];
        if (stripos($header, 'Basic ') === 0) {
            $decoded = base64_decode(substr($header, 6), true);
            if (is_string($decoded) && str_contains($decoded, ':')) {
                [$user, $password] = explode(':', $decoded, 2);
            }
        }
    }
    return [$user, $password];
}

function lab_authenticate(): void
{
    $config = lab_config();
    $gate = (string) ($_COOKIE['practice_staging_gate'] ?? '');
    if (preg_match('/^([0-9]{10})\.([a-f0-9]{64})$/', $gate, $matches) === 1) {
        $expires = (int) $matches[1];
        $expected = hash_hmac('sha256', 'staging-gate|' . $matches[1], (string) $config['api_secret']);
        if ($expires >= time() && hash_equals($expected, $matches[2])) {
            return;
        }
    }
    [$user, $password] = lab_basic_credentials();
    $candidate = hash('sha256', $config['password_salt'] . $password);
    $valid = hash_equals($config['username'], $user)
        && hash_equals($config['password_hash'], $candidate);
    if (!$valid) {
        header('WWW-Authenticate: Basic realm="Testheon Practice Lab staging"');
        header('X-Robots-Tag: noindex, nofollow');
        header('Cache-Control: no-store, private');
        http_response_code(401);
        exit('Authentication required.');
    }
    $expires = time() + 7200;
    $signature = hash_hmac('sha256', 'staging-gate|' . $expires, (string) $config['api_secret']);
    setcookie('practice_staging_gate', $expires . '.' . $signature, [
        'expires' => $expires,
        'path' => '/practice/',
        'secure' => true,
        'httponly' => true,
        'samesite' => 'Lax',
    ]);
}

function lab_require_control_token(): void
{
    $config = lab_config();
    $token = (string) ($_SERVER['HTTP_X_PRACTICE_RELEASE_CONTROL'] ?? '');
    $candidate = hash('sha256', $config['control_salt'] . $token);
    if (!hash_equals($config['control_hash'], $candidate)) {
        http_response_code(403);
        exit('Release control token rejected.');
    }
}

function lab_release_pattern(): string
{
    return '/^[0-9]{8}T[0-9]{6}Z(?:-[a-z0-9]{4,12})?$/';
}

function lab_current_release(): ?string
{
    $path = __DIR__ . '/.current';
    if (!is_file($path)) {
        return null;
    }
    $release = trim((string) file_get_contents($path));
    return preg_match(lab_release_pattern(), $release) === 1 ? $release : null;
}

function lab_list_releases(): array
{
    $root = __DIR__ . '/releases';
    if (!is_dir($root)) {
        return [];
    }
    $releases = array_values(array_filter(
        scandir($root) ?: [],
        static fn (string $name): bool => preg_match(lab_release_pattern(), $name) === 1
            && is_file($root . '/' . $name . '/index.html')
    ));
    sort($releases, SORT_STRING);
    return $releases;
}

function lab_json(array $payload, int $status = 200): never
{
    header('Content-Type: application/json; charset=utf-8');
    header('X-Robots-Tag: noindex, nofollow');
    header('Cache-Control: no-store, private');
    http_response_code($status);
    echo json_encode($payload, JSON_UNESCAPED_SLASHES | JSON_THROW_ON_ERROR);
    exit;
}
