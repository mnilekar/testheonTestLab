<?php
declare(strict_types=1);

require __DIR__ . '/_runtime.php';

$release = lab_current_release();
if ($release === null) {
    http_response_code(503);
    exit('No verified Practice Lab release is active.');
}

$uriPath = rawurldecode((string) parse_url($_SERVER['REQUEST_URI'] ?? '/practice/', PHP_URL_PATH));
$prefix = '/practice/';
if (!str_starts_with($uriPath, $prefix) || str_contains($uriPath, "\0")) {
    http_response_code(404);
    exit('Practice page not found.');
}
$relative = substr($uriPath, strlen($prefix));
if ($relative === '' || str_ends_with($relative, '/')) {
    $relative .= 'index.html';
}
if (preg_match('#(^|/)\.\.(/|$)#', $relative) === 1
    || preg_match('#^(?:_api|api|releases|_api-maintenance)(?:/|$)#i', $relative) === 1) {
    http_response_code(400);
    exit('Invalid path.');
}

$releaseRoot = realpath(__DIR__ . '/releases/' . $release);
$candidate = $releaseRoot === false ? false : realpath($releaseRoot . '/' . $relative);
$notFound = $releaseRoot === false
    || $candidate === false
    || !str_starts_with($candidate, $releaseRoot . DIRECTORY_SEPARATOR)
    || !is_file($candidate);
if ($notFound) {
    $candidate = $releaseRoot === false ? false : realpath($releaseRoot . '/404.html');
    http_response_code(404);
}
if ($candidate === false || !is_file($candidate)) {
    http_response_code(404);
    exit('Practice page not found.');
}

$extension = strtolower(pathinfo($candidate, PATHINFO_EXTENSION));
$contentTypes = [
    'css' => 'text/css; charset=utf-8',
    'html' => 'text/html; charset=utf-8',
    'ico' => 'image/x-icon',
    'js' => 'text/javascript; charset=utf-8',
    'json' => 'application/json; charset=utf-8',
    'png' => 'image/png',
    'svg' => 'image/svg+xml',
    'txt' => 'text/plain; charset=utf-8',
    'webp' => 'image/webp',
    'woff2' => 'font/woff2',
    'xml' => 'application/xml; charset=utf-8',
];
header('Content-Type: ' . ($contentTypes[$extension] ?? 'application/octet-stream'));
header('Content-Length: ' . (string) filesize($candidate));
header('X-Content-Type-Options: nosniff');
if (str_starts_with($relative, '_astro/')) {
    header('Cache-Control: public, max-age=31536000, immutable');
} elseif (in_array($extension, ['html', 'xml', 'json'], true)) {
    header('Cache-Control: no-cache');
} else {
    header('Cache-Control: public, max-age=3600');
}
if ($extension === 'html') {
    $head = file_get_contents($candidate, false, null, 0, 16384);
    if (is_string($head) && preg_match('/name=["\']robots["\'][^>]+noindex/i', $head) === 1) {
        header('X-Robots-Tag: noindex, nofollow');
    }
}
if (($_SERVER['REQUEST_METHOD'] ?? 'GET') !== 'HEAD') {
    readfile($candidate);
}
