# TheBohoThread — MySQL Setup Guide

Firebase has been completely removed. The site now uses a **PHP + MySQL** backend.

---

## Step 1 — Run the SQL setup

1. Open **phpMyAdmin** (or your MySQL VS Code extension)
2. Open the file `api/setup.sql`
3. Click **Run** — this creates the `thebohothread` database and all tables with default seed data

---

## Step 2 — Configure database credentials

Open `api/db.php` and edit these 5 lines to match your MySQL setup:

```php
define('DB_HOST', 'localhost');       // usually localhost
define('DB_PORT', 3306);              // default MySQL port
define('DB_NAME', 'thebohothread');   // created by setup.sql
define('DB_USER', 'root');            // your MySQL username
define('DB_PASS', '');                // your MySQL password (blank for XAMPP default)
```

---

## Step 3 — Run on a PHP server

The site requires PHP to work (for the API). Use one of:

- **XAMPP** (recommended) — copy the `thebohothread.in/` folder into `htdocs/`
  then open: `http://localhost/thebohothread.in/`
- **VS Code PHP Server extension** — right-click `index.html` → Open with PHP Server
- **WAMP / Laragon** — place in the www folder

> ⚠️ Opening `index.html` directly as a file (`file://`) will NOT work —
> the PHP API needs a web server.

---

## API Endpoints

| File | Purpose |
|------|---------|
| `api/products.php`   | GET / POST / PUT / DELETE products |
| `api/categories.php` | GET / POST / DELETE categories |
| `api/badges.php`     | GET / POST / DELETE badges |
| `api/reviews.php`    | GET / POST / PUT / DELETE reviews |
| `api/db.php`         | Shared DB config (edit credentials here) |
| `api/setup.sql`      | Run once to create the database |

---

## Admin Panel

Go to: `http://localhost/thebohothread.in/admin/`

- Username: `admin`
- Password: `bohothread@2025`

All products, categories, and badges you create/edit/delete in the admin panel
are instantly saved to MySQL and reflected on the store.

---

## Image Storage

Images are stored as **base64 data URLs** directly in the MySQL `products` table
(or you can paste an external image URL). No Firebase Storage is used.

For large product catalogs, consider storing images externally (Cloudinary, S3, etc.)
and pasting the URL instead of uploading a file.
