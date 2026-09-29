<?php
declare(strict_types=1);

require __DIR__ . '/_runtime.php';
lab_authenticate();
lab_require_control_token();

if (($_SERVER['REQUEST_METHOD'] ?? 'GET') !== 'POST') {
    lab_json(['error' => 'POST required.'], 405);
}

function remove_release_tree(string $path): bool
{
    if (!is_dir($path) || is_link($path)) {
        return false;
    }
    foreach (scandir($path) ?: [] as $entry) {
        if ($entry === '.' || $entry === '..') {
            continue;
        }
        $child = $path . '/' . $entry;
        if (is_dir($child) && !is_link($child)) {
            if (!remove_release_tree($child)) {
                return false;
            }
        } elseif (!unlink($child)) {
            return false;
        }
    }
    return rmdir($path);
}

function activate_release(string $release): void
{
    if (preg_match(lab_release_pattern(), $release) !== 1) {
        lab_json(['error' => 'Invalid release identifier.'], 400);
    }
    $releasePath = __DIR__ . '/releases/' . $release;
    if (!is_file($releasePath . '/index.html')
        || !is_file($releasePath . '/_api/api-runtime.php')
        || !is_file($releasePath . '/_api/fixtures-v1.json')
        || !is_file($releasePath . '/_api/openapi.json')) {
        lab_json(['error' => 'Release is incomplete.'], 404);
    }
    $temporary = __DIR__ . '/.current.' . bin2hex(random_bytes(6));
    if (file_put_contents($temporary, $release . "\n", LOCK_EX) === false) {
        lab_json(['error' => 'Unable to write release pointer.'], 500);
    }
    if (!rename($temporary, __DIR__ . '/.current')) {
        @unlink($temporary);
        lab_json(['error' => 'Unable to activate release atomically.'], 500);
    }
}

$action = (string) ($_POST['action'] ?? '');
$releases = lab_list_releases();
$current = lab_current_release();
if ($action === 'activate') {
    $target = (string) ($_POST['release'] ?? '');
    activate_release($target);
    $current = $target;
} elseif ($action === 'rollback') {
    if ($current === null) {
        lab_json(['error' => 'No current release exists.'], 409);
    }
    $previous = array_values(array_filter(
        $releases,
        static fn (string $release): bool => strcmp($release, $current) < 0
    ));
    $target = end($previous);
    if (!is_string($target)) {
        lab_json(['error' => 'No previous retained release exists.'], 409);
    }
    activate_release($target);
    $current = $target;
} elseif ($action !== 'status') {
    lab_json(['error' => 'Unsupported action.'], 400);
}

$releases = lab_list_releases();
$keep = array_slice(array_reverse($releases), 0, 3);
if ($current !== null && !in_array($current, $keep, true)) {
    $keep[] = $current;
}
foreach ($releases as $release) {
    if (!in_array($release, $keep, true)) {
        if (!remove_release_tree(__DIR__ . '/releases/' . $release)) {
            lab_json(['error' => 'Unable to prune old release.', 'release' => $release], 500);
        }
    }
}

lab_json([
    'ok' => true,
    'action' => $action,
    'current' => lab_current_release(),
    'releases' => lab_list_releases(),
]);
