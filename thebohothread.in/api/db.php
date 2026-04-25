<?php
// ============================================================
// TheBohoThread — Database Configuration
// Edit these values to match your MySQL setup
// ============================================================

// Buffer ALL output so stray PHP notices/warnings never corrupt JSON
ob_start();

define('DB_HOST', 'localhost');
define('DB_PORT', 3306);
define('DB_NAME', 'thebohothread');
define('DB_USER', 'root');
define('DB_PASS', '');

// Catch PHP fatal errors — discard buffered output, return clean JSON
register_shutdown_function(function () {
    $err = error_get_last();
    if ($err && in_array($err['type'], [E_ERROR, E_PARSE, E_CORE_ERROR, E_COMPILE_ERROR])) {
        ob_end_clean(); // discard any stray output
        if (!headers_sent()) {
            http_response_code(500);
            header('Content-Type: application/json; charset=utf-8');
        }
        echo json_encode(['success' => false, 'error' => 'Server error: ' . $err['message']]);
    }
});

// ── Connect ─────────────────────────────────────────────────
function getDB(): PDO {
    static $pdo = null;
    if ($pdo) return $pdo;
    try {
        $dsn = "mysql:host=" . DB_HOST . ";port=" . DB_PORT .
               ";dbname=" . DB_NAME . ";charset=utf8mb4";
        $pdo = new PDO($dsn, DB_USER, DB_PASS, [
            PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
            PDO::ATTR_EMULATE_PREPARES   => false,
        ]);
    } catch (PDOException $e) {
        http_response_code(500);
        echo json_encode(['success' => false, 'error' => 'Database connection failed: ' . $e->getMessage()]);
        exit;
    }
    return $pdo;
}

// ── CORS + JSON headers ──────────────────────────────────────
function sendHeaders(): void {
    header('Content-Type: application/json; charset=utf-8');
    header('Access-Control-Allow-Origin: *');
    header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
    header('Access-Control-Allow-Headers: Content-Type');
    if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') { http_response_code(204); exit; }
}

function ok($data = []): void {
    ob_end_clean(); // discard any stray output before sending clean JSON
    echo json_encode(['success' => true, 'data' => $data]);
    exit;
}

function fail(string $msg, int $code = 400): void {
    ob_end_clean(); // discard any stray output before sending clean JSON
    http_response_code($code);
    echo json_encode(['success' => false, 'error' => $msg]);
    exit;
}

// Safely parse JSON request body — returns [] on empty, fails on bad JSON
function body(): array {
    $raw = file_get_contents('php://input');
    if (!$raw || trim($raw) === '') return [];
    $decoded = json_decode($raw, true);
    if (json_last_error() !== JSON_ERROR_NONE) {
        fail('Invalid JSON in request body: ' . json_last_error_msg());
    }
    return $decoded ?? [];
}
