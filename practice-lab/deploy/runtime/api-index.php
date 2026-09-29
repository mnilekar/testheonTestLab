<?php
declare(strict_types=1);

require dirname(__DIR__) . '/_runtime.php';
lab_authenticate();

$release = lab_current_release();
if ($release === null) {
    lab_json([
        'error' => ['code' => 'RELEASE_UNAVAILABLE', 'message' => 'No verified staging release is active.', 'details' => []],
        'requestId' => bin2hex(random_bytes(8)),
    ], 503);
}
$releaseRoot = realpath(dirname(__DIR__) . '/releases/' . $release . '/_api');
$runtime = $releaseRoot === false ? false : realpath($releaseRoot . '/api-runtime.php');
if ($releaseRoot === false || $runtime === false || !str_starts_with($runtime, $releaseRoot . DIRECTORY_SEPARATOR)) {
    lab_json([
        'error' => ['code' => 'RELEASE_INCOMPLETE', 'message' => 'The active API release is incomplete.', 'details' => []],
        'requestId' => bin2hex(random_bytes(8)),
    ], 503);
}

require $runtime;
lab_api_dispatch($releaseRoot);
