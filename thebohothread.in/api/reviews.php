<?php
// ============================================================
// TheBohoThread — Reviews API  (api/reviews.php)
// GET    /api/reviews.php                         → all reviews (admin)
// GET    /api/reviews.php?product_id=N&status=approved → user reviews
// POST   /api/reviews.php                         → submit review
// PUT    /api/reviews.php?id=N                    → update status
// DELETE /api/reviews.php?id=N                    → delete
// ============================================================
require_once __DIR__ . '/db.php';
sendHeaders();

$method = $_SERVER['REQUEST_METHOD'];
$id     = isset($_GET['id'])         ? (int)$_GET['id']         : null;
$pid    = isset($_GET['product_id']) ? (int)$_GET['product_id'] : null;
$status = $_GET['status'] ?? null;
$db     = getDB();

// ── GET ──────────────────────────────────────────────────────
if ($method === 'GET') {
    if ($pid) {
        // User-facing: approved reviews for a product
        $stmt = $db->prepare(
            "SELECT * FROM reviews WHERE product_id = ? AND status = 'approved' ORDER BY created_at DESC"
        );
        $stmt->execute([$pid]);
    } elseif ($status) {
        $stmt = $db->prepare("SELECT * FROM reviews WHERE status = ? ORDER BY created_at DESC");
        $stmt->execute([$status]);
    } else {
        $stmt = $db->query("SELECT * FROM reviews ORDER BY created_at DESC");
    }
    $rows = $stmt->fetchAll();
    foreach ($rows as &$r) {
        $r['id']         = (int)$r['id'];
        $r['product_id'] = (int)$r['product_id'];
        $r['rating']     = (int)$r['rating'];
    }
    ok($rows);
}

// ── POST — submit review ─────────────────────────────────────
if ($method === 'POST') {
    $b    = body();
    $pid2 = (int)($b['product_id'] ?? 0);
    $pnm  = trim($b['product_name'] ?? '');
    $auth = trim($b['author']       ?? 'Anonymous');
    $rtg  = (int)($b['rating']      ?? 0);
    $txt  = trim($b['review_text']  ?? '');

    if (!$pid2)            fail('Product ID is required.');
    if ($rtg < 1 || $rtg > 5) fail('Rating must be 1–5.');
    if (!$auth)            $auth = 'Anonymous';

    $db->prepare(
        "INSERT INTO reviews (product_id, product_name, author, rating, review_text, status) VALUES (?, ?, ?, ?, ?, 'pending')"
    )->execute([$pid2, $pnm, $auth, $rtg, $txt]);

    ok(['message' => 'Review submitted, pending approval.']);
}

// ── PUT — update status ──────────────────────────────────────
if ($method === 'PUT') {
    if (!$id) fail('Review ID required.');
    $b      = body();
    $status = $b['status'] ?? null;
    if (!in_array($status, ['pending','approved','rejected'])) fail('Invalid status.');

    $approved = $status === 'approved' ? date('Y-m-d H:i:s') : null;
    $db->prepare("UPDATE reviews SET status = ?, approved_at = ? WHERE id = ?")
       ->execute([$status, $approved, $id]);

    // Recalculate product rating if approved/rejected
    $rev = $db->query("SELECT product_id FROM reviews WHERE id = $id")->fetch();
    if ($rev) {
        $avg = $db->query(
            "SELECT AVG(rating) as avg FROM reviews WHERE product_id = {$rev['product_id']} AND status = 'approved'"
        )->fetch();
        $newRating = $avg['avg'] ? round((float)$avg['avg'], 1) : null;
        $db->prepare("UPDATE products SET rating = ? WHERE id = ?")
           ->execute([$newRating, $rev['product_id']]);
    }

    ok(['updated' => $id, 'status' => $status]);
}

// ── DELETE ───────────────────────────────────────────────────
if ($method === 'DELETE') {
    if (!$id) fail('Review ID required.');
    $db->prepare("DELETE FROM reviews WHERE id = ?")->execute([$id]);
    ok(['deleted' => $id]);
}

fail('Method not allowed.', 405);
