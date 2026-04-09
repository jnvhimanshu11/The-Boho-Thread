<?php
// ============================================================
// TheBohoThread — Categories API  (api/categories.php)
// GET    /api/categories.php         → list all
// POST   /api/categories.php         → create
// DELETE /api/categories.php?id=N    → delete
// ============================================================
require_once __DIR__ . '/db.php';
sendHeaders();

$method = $_SERVER['REQUEST_METHOD'];
$id     = isset($_GET['id']) ? (int)$_GET['id'] : null;
$db     = getDB();

if ($method === 'GET') {
    $rows = $db->query("SELECT * FROM categories ORDER BY name ASC")->fetchAll();
    foreach ($rows as &$r) $r['id'] = (int)$r['id'];
    ok($rows);
}

if ($method === 'POST') {
    $b    = body();
    $name = trim($b['name'] ?? '');
    $icon = trim($b['icon'] ?? '🏷️');
    if (!$name) fail('Category name is required.');

    // Check duplicate
    $chk = $db->prepare("SELECT id FROM categories WHERE LOWER(name) = LOWER(?)");
    $chk->execute([$name]);
    if ($chk->fetch()) fail('Category already exists.');

    $db->prepare("INSERT INTO categories (name, icon) VALUES (?, ?)")->execute([$name, $icon]);
    $newId = (int)$db->lastInsertId();
    $row = $db->query("SELECT * FROM categories WHERE id = $newId")->fetch();
    $row['id'] = (int)$row['id'];
    ok($row);
}

if ($method === 'DELETE') {
    if (!$id) fail('Category ID required.');
    $db->prepare("DELETE FROM categories WHERE id = ?")->execute([$id]);
    ok(['deleted' => $id]);
}

fail('Method not allowed.', 405);
