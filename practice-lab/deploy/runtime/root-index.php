<?php
declare(strict_types=1);

require __DIR__ . '/practice/_runtime.php';
lab_authenticate();
header('Location: /practice/', true, 302);
exit;