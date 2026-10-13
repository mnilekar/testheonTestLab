<?php
declare(strict_types=1);

function lab_config(): array
{
    static $config;
    if (!is_array($config)) {
        $loaded = require __DIR__ . '/.gate.php';
        if (!is_array($loaded)
            || !isset($loaded['api_secret'], $loaded['control_salt'], $loaded['control_hash'])) {
            http_response_code(503);
            exit('Practice runtime configuration is unavailable.');
        }
        $config = $loaded;
    }
    return $config;
}

function lab_require_control_token(): void
{
    $config = lab_config();
    $token = (string) ($_SERVER['HTTP_X_PRACTICE_RELEASE_CONTROL'] ?? '');
    $candidate = hash('sha256', (string) $config['control_salt'] . $token);
    if (!hash_equals((string) $config['control_hash'], $candidate)) {
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

function lab_release_is_complete(string $release): bool
{
    $releasePath = __DIR__ . '/releases/' . $release;
    return is_file($releasePath . '/index.html')
        && is_file($releasePath . '/_api/api-runtime.php')
        && is_file($releasePath . '/_api/fixtures-v1.json')
        && is_file($releasePath . '/_api/openapi.json');
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
            && lab_release_is_complete($name)
    ));
    sort($releases, SORT_STRING);
    return $releases;
}

function lab_json(array $payload, int $status = 200): never
{
    header('Content-Type: application/json; charset=utf-8');
    header('X-Robots-Tag: noindex, nofollow');
    header('Cache-Control: no-store, private');
    header('X-Content-Type-Options: nosniff');
    http_response_code($status);
    echo json_encode($payload, JSON_UNESCAPED_SLASHES | JSON_THROW_ON_ERROR);
    exit;
}
