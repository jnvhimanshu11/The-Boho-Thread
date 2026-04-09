<?php
// ============================================================
// TheBohoThread — Products API  (api/products.php)
// GET    /api/products.php         → list all products
// POST   /api/products.php         → create product
// PUT    /api/products.php?id=N    → update product
// DELETE /api/products.php?id=N    → delete product
// ============================================================
require_once __DIR__ . '/db.php';
sendHeaders();

$method = $_SERVER['REQUEST_METHOD'];
$id     = isset($_GET['id']) ? (int)$_GET['id'] : null;
$db     = getDB();

function castProduct(array $r): array {
    $r['id']             = (int)$r['id'];
    $r['price']          = (float)$r['price'];
    $r['original_price'] = ($r['original_price'] !== null && $r['original_price'] !== '') ? (float)$r['original_price'] : null;
    $r['rating']         = ($r['rating'] !== null && $r['rating'] !== '') ? (float)$r['rating'] : null;
    return $r;
}

// ── GET ──────────────────────────────────────────────────────
if ($method === 'GET') {
    $rows = $db->query("SELECT * FROM products ORDER BY created_at DESC")->fetchAll();
    ok(array_map('castProduct', $rows));
}

// ── POST — create ────────────────────────────────────────────
if ($method === 'POST') {
    $b     = body();
    $name  = trim($b['name']         ?? '');
    $cat   = trim($b['category']     ?? '');
    $desc  = trim($b['description']  ?? '');
    $price = (float)($b['price']     ?? 0);
    $orig  = (isset($b['original_price']) && $b['original_price'] !== '') ? (float)$b['original_price'] : null;
    $rating= (isset($b['rating'])    && $b['rating'] !== '')              ? (float)$b['rating']         : null;
    $badge = trim($b['badge']        ?? '');
    $image = trim($b['image']        ?? '');

    if (!$name)      fail('Product name is required.');
    if (!$cat)       fail('Category is required.');
    if ($price <= 0) fail('Valid price is required.');

    $db->prepare(
        "INSERT INTO products (name, category, description, price, original_price, rating, badge, image)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)"
    )->execute([$name, $cat, $desc, $price, $orig, $rating, $badge, $image]);

    $newId = (int)$db->lastInsertId();
    $stmt  = $db->prepare("SELECT * FROM products WHERE id = ?");
    $stmt->execute([$newId]);
    $row = $stmt->fetch();
    if (!$row) fail('Product saved but could not be retrieved.', 500);
    ok(castProduct($row));
}

// ── PUT — update ─────────────────────────────────────────────
if ($method === 'PUT') {
    if (!$id) fail('Product ID required.');
    $b = body();

    $fields = [];
    $params = [];

    foreach (['name','category','description','badge','image'] as $f) {
        if (array_key_exists($f, $b)) {
            $fields[] = "$f = ?";
            $params[]  = trim((string)$b[$f]);
        }
    }
    if (array_key_exists('price', $b)) {
        $fields[] = "price = ?";
        $params[]  = (float)$b['price'];
    }
    if (array_key_exists('original_price', $b)) {
        $fields[] = "original_price = ?";
        $params[]  = ($b['original_price'] !== '' && $b['original_price'] !== null) ? (float)$b['original_price'] : null;
    }
    if (array_key_exists('rating', $b)) {
        $fields[] = "rating = ?";
        $params[]  = ($b['rating'] !== '' && $b['rating'] !== null) ? (float)$b['rating'] : null;
    }

    if (!$fields) fail('No fields to update.');

    $params[] = $id;
    $db->prepare("UPDATE products SET " . implode(', ', $fields) . " WHERE id = ?")->execute($params);

    $stmt = $db->prepare("SELECT * FROM products WHERE id = ?");
    $stmt->execute([$id]);
    $row = $stmt->fetch();
    if (!$row) fail('Product not found.', 404);
    ok(castProduct($row));
}

// ── DELETE ───────────────────────────────────────────────────
if ($method === 'DELETE') {
    if (!$id) fail('Product ID required.');
    $db->prepare("DELETE FROM products WHERE id = ?")->execute([$id]);
    ok(['deleted' => $id]);
}

fail('Method not allowed.', 405);
