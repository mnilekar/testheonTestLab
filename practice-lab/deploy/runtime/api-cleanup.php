<?php
declare(strict_types=1);

if (PHP_SAPI !== 'cli') {
    http_response_code(404);
    exit;
}

require dirname(__DIR__) . '/_runtime.php';
$release = lab_current_release();
if ($release === null) {
    fwrite(STDERR, "No active release.\n");
    exit(1);
}
$runtime = realpath(dirname(__DIR__) . '/releases/' . $release . '/_api/api-runtime.php');
if ($runtime === false || !is_file($runtime)) {
    fwrite(STDERR, "Active API runtime unavailable.\n");
    exit(1);
}
require $runtime;
echo json_encode(lab_api_cli_cleanup(), JSON_UNESCAPED_SLASHES | JSON_THROW_ON_ERROR) . PHP_EOL;
