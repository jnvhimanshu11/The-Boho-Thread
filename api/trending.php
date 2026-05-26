<?php
// ============================================================
// TheBohoThread — Trending Products API  (api/trending.php)
// GET    /api/trending.php              → list trending product IDs (ordered)
// POST   /api/trending.php              → set trending list (body: {product_ids:[1,2,3]})
// DELETE /api/trending.php?id=N         → remove one product from trending
// ============================================================
require_once __DIR__ . '/db.php';
sendHeaders();

$method = $_SERVER['REQUEST_METHOD'];
$db     = getDB();

// ── GET ──────────────────────────────────────────────────────
if ($method === 'GET') {
    $rows = $db->query(
        "SELECT t.product_id, t.sort_order, p.name, p.price, p.original_price, p.image, p.images, p.badge
         FROM trending_products t
         JOIN products p ON p.id = t.product_id
         ORDER BY t.sort_order ASC"
    )->fetchAll();
    $result = array_map(function($r) {
        return [
            'id'             => (int)$r['product_id'],
            'sort_order'     => (int)$r['sort_order'],
            'name'           => $r['name'],
            'price'          => (float)$r['price'],
            'original_price' => $r['original_price'] ? (float)$r['original_price'] : null,
            'image'          => $r['image'],
            'images'         => $r['images'],
            'badge'          => $r['badge'],
        ];
    }, $rows);
    ok($result);
}

// ── POST — set full trending list ────────────────────────────
if ($method === 'POST') {
    $b   = body();
    $ids = $b['product_ids'] ?? [];
    if (!is_array($ids)) fail('product_ids must be an array.');
    $ids = array_values(array_unique(array_map('intval', $ids)));
    if (count($ids) > 20) fail('Maximum 20 trending products allowed.');

    $db->exec("DELETE FROM trending_products");
    if ($ids) {
        $stmt = $db->prepare("INSERT INTO trending_products (product_id, sort_order) VALUES (?, ?)");
        foreach ($ids as $i => $pid) {
            $stmt->execute([$pid, $i]);
        }
    }
    ok(['saved' => count($ids)]);
}

// ── DELETE — remove one ──────────────────────────────────────
if ($method === 'DELETE') {
    $id = isset($_GET['id']) ? (int)$_GET['id'] : null;
    if (!$id) fail('Product ID required.');
    $db->prepare("DELETE FROM trending_products WHERE product_id = ?")->execute([$id]);
    ok(['removed' => $id]);
}

fail('Method not allowed.', 405);
