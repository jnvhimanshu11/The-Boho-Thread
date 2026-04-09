<?php
// ============================================================
// TheBohoThread — Badges API  (api/badges.php)
// GET    /api/badges.php         → list all
// POST   /api/badges.php         → create
// DELETE /api/badges.php?id=N    → delete
// ============================================================
require_once __DIR__ . '/db.php';
sendHeaders();

$method = $_SERVER['REQUEST_METHOD'];
$id     = isset($_GET['id']) ? (int)$_GET['id'] : null;
$db     = getDB();

if ($method === 'GET') {
    $rows = $db->query("SELECT * FROM badges ORDER BY name ASC")->fetchAll();
    foreach ($rows as &$r) $r['id'] = (int)$r['id'];
    ok($rows);
}

if ($method === 'POST') {
    $b    = body();
    $name = trim($b['name']       ?? '');
    $col  = trim($b['color']      ?? '#c9a84c');
    $txt  = trim($b['text_color'] ?? '#ffffff');
    if (!$name) fail('Badge name is required.');

    $chk = $db->prepare("SELECT id FROM badges WHERE LOWER(name) = LOWER(?)");
    $chk->execute([$name]);
    if ($chk->fetch()) fail('Badge already exists.');

    $db->prepare("INSERT INTO badges (name, color, text_color) VALUES (?, ?, ?)")->execute([$name, $col, $txt]);
    $newId = (int)$db->lastInsertId();

    $stmt = $db->prepare("SELECT * FROM badges WHERE id = ?");
    $stmt->execute([$newId]);
    $row = $stmt->fetch();
    if (!$row) fail('Badge saved but could not be retrieved.', 500);
    $row['id'] = (int)$row['id'];
    ok($row);
}

if ($method === 'DELETE') {
    if (!$id) fail('Badge ID required.');
    $db->prepare("DELETE FROM badges WHERE id = ?")->execute([$id]);
    ok(['deleted' => $id]);
}

fail('Method not allowed.', 405);
