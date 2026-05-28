-- ============================================================
-- SchoolWala - Full Schema Migration
-- Runs on every startup. All statements are idempotent (safe
-- to run multiple times). No manual DB changes needed ever.
-- ============================================================

DO $$
BEGIN

  -- ══════════════════════════════════════════════════════════
  -- TABLE: schools
  -- ══════════════════════════════════════════════════════════

  -- Core
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='schools' AND column_name='school_code') THEN
    ALTER TABLE schools ADD COLUMN school_code VARCHAR(255) UNIQUE NOT NULL DEFAULT '';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='schools' AND column_name='school_name') THEN
    ALTER TABLE schools ADD COLUMN school_name VARCHAR(255) NOT NULL DEFAULT '';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='schools' AND column_name='affiliation_no') THEN
    ALTER TABLE schools ADD COLUMN affiliation_no VARCHAR(255);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='schools' AND column_name='board_type') THEN
    ALTER TABLE schools ADD COLUMN board_type VARCHAR(255);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='schools' AND column_name='school_type') THEN
    ALTER TABLE schools ADD COLUMN school_type VARCHAR(255);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='schools' AND column_name='established_year') THEN
    ALTER TABLE schools ADD COLUMN established_year INTEGER;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='schools' AND column_name='website_url') THEN
    ALTER TABLE schools ADD COLUMN website_url VARCHAR(255);
  END IF;

  -- Address
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='schools' AND column_name='state') THEN
    ALTER TABLE schools ADD COLUMN state VARCHAR(255);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='schools' AND column_name='city') THEN
    ALTER TABLE schools ADD COLUMN city VARCHAR(255);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='schools' AND column_name='locality') THEN
    ALTER TABLE schools ADD COLUMN locality VARCHAR(255);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='schools' AND column_name='address') THEN
    ALTER TABLE schools ADD COLUMN address VARCHAR(255);
  END IF;

  -- Contact
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='schools' AND column_name='phone') THEN
    ALTER TABLE schools ADD COLUMN phone VARCHAR(255);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='schools' AND column_name='email') THEN
    ALTER TABLE schools ADD COLUMN email VARCHAR(255);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='schools' AND column_name='principal_name') THEN
    ALTER TABLE schools ADD COLUMN principal_name VARCHAR(255);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='schools' AND column_name='principal_contact') THEN
    ALTER TABLE schools ADD COLUMN principal_contact VARCHAR(255);
  END IF;

  -- Theme
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='schools' AND column_name='primary_color') THEN
    ALTER TABLE schools ADD COLUMN primary_color VARCHAR(255);
  END IF;

  -- Media
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='schools' AND column_name='logo_url') THEN
    ALTER TABLE schools ADD COLUMN logo_url VARCHAR(255);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='schools' AND column_name='logo_base64') THEN
    ALTER TABLE schools ADD COLUMN logo_base64 TEXT;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='schools' AND column_name='banner_base64') THEN
    ALTER TABLE schools ADD COLUMN banner_base64 TEXT;
  END IF;

  -- Admin
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='schools' AND column_name='admin_username') THEN
    ALTER TABLE schools ADD COLUMN admin_username VARCHAR(255) NOT NULL DEFAULT '';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='schools' AND column_name='admin_password') THEN
    ALTER TABLE schools ADD COLUMN admin_password VARCHAR(255) NOT NULL DEFAULT '';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='schools' AND column_name='must_change_password') THEN
    ALTER TABLE schools ADD COLUMN must_change_password BOOLEAN NOT NULL DEFAULT TRUE;
  END IF;

  -- Timestamps
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='schools' AND column_name='created_at') THEN
    ALTER TABLE schools ADD COLUMN created_at TIMESTAMP NOT NULL DEFAULT NOW();
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='schools' AND column_name='updated_at') THEN
    ALTER TABLE schools ADD COLUMN updated_at TIMESTAMP;
  END IF;


  -- ══════════════════════════════════════════════════════════
  -- TABLE: users
  -- ══════════════════════════════════════════════════════════

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='users' AND column_name='unique_id') THEN
    ALTER TABLE users ADD COLUMN unique_id VARCHAR(255) UNIQUE NOT NULL DEFAULT '';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='users' AND column_name='username') THEN
    ALTER TABLE users ADD COLUMN username VARCHAR(255) NOT NULL DEFAULT '';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='users' AND column_name='password') THEN
    ALTER TABLE users ADD COLUMN password VARCHAR(255) NOT NULL DEFAULT '';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='users' AND column_name='full_name') THEN
    ALTER TABLE users ADD COLUMN full_name VARCHAR(255) NOT NULL DEFAULT '';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='users' AND column_name='email') THEN
    ALTER TABLE users ADD COLUMN email VARCHAR(255);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='users' AND column_name='phone') THEN
    ALTER TABLE users ADD COLUMN phone VARCHAR(255);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='users' AND column_name='date_of_birth') THEN
    ALTER TABLE users ADD COLUMN date_of_birth DATE;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='users' AND column_name='address') THEN
    ALTER TABLE users ADD COLUMN address VARCHAR(255);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='users' AND column_name='role') THEN
    ALTER TABLE users ADD COLUMN role VARCHAR(50) NOT NULL DEFAULT 'STUDENT';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='users' AND column_name='school_code') THEN
    ALTER TABLE users ADD COLUMN school_code VARCHAR(255) NOT NULL DEFAULT '';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='users' AND column_name='employee_id') THEN
    ALTER TABLE users ADD COLUMN employee_id VARCHAR(255);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='users' AND column_name='subject') THEN
    ALTER TABLE users ADD COLUMN subject VARCHAR(255);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='users' AND column_name='class_assigned') THEN
    ALTER TABLE users ADD COLUMN class_assigned VARCHAR(255);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='users' AND column_name='grade') THEN
    ALTER TABLE users ADD COLUMN grade VARCHAR(255);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='users' AND column_name='section') THEN
    ALTER TABLE users ADD COLUMN section VARCHAR(255);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='users' AND column_name='parent_name') THEN
    ALTER TABLE users ADD COLUMN parent_name VARCHAR(255);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='users' AND column_name='parent_phone') THEN
    ALTER TABLE users ADD COLUMN parent_phone VARCHAR(255);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='users' AND column_name='active') THEN
    ALTER TABLE users ADD COLUMN active BOOLEAN NOT NULL DEFAULT TRUE;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='users' AND column_name='must_change_password') THEN
    ALTER TABLE users ADD COLUMN must_change_password BOOLEAN NOT NULL DEFAULT TRUE;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='users' AND column_name='created_at') THEN
    ALTER TABLE users ADD COLUMN created_at TIMESTAMP NOT NULL DEFAULT NOW();
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='users' AND column_name='updated_at') THEN
    ALTER TABLE users ADD COLUMN updated_at TIMESTAMP;
  END IF;


  -- ══════════════════════════════════════════════════════════
  -- TABLE: attendance
  -- ══════════════════════════════════════════════════════════

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='attendance' AND column_name='student_unique_id') THEN
    ALTER TABLE attendance ADD COLUMN student_unique_id VARCHAR(255) NOT NULL DEFAULT '';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='attendance' AND column_name='student_name') THEN
    ALTER TABLE attendance ADD COLUMN student_name VARCHAR(255) NOT NULL DEFAULT '';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='attendance' AND column_name='school_code') THEN
    ALTER TABLE attendance ADD COLUMN school_code VARCHAR(255) NOT NULL DEFAULT '';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='attendance' AND column_name='grade') THEN
    ALTER TABLE attendance ADD COLUMN grade VARCHAR(255);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='attendance' AND column_name='section') THEN
    ALTER TABLE attendance ADD COLUMN section VARCHAR(255);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='attendance' AND column_name='date') THEN
    ALTER TABLE attendance ADD COLUMN date DATE NOT NULL DEFAULT CURRENT_DATE;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='attendance' AND column_name='status') THEN
    ALTER TABLE attendance ADD COLUMN status VARCHAR(50) NOT NULL DEFAULT 'PRESENT';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='attendance' AND column_name='marked_by') THEN
    ALTER TABLE attendance ADD COLUMN marked_by VARCHAR(255);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='attendance' AND column_name='remarks') THEN
    ALTER TABLE attendance ADD COLUMN remarks VARCHAR(255);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='attendance' AND column_name='created_at') THEN
    ALTER TABLE attendance ADD COLUMN created_at TIMESTAMP DEFAULT NOW();
  END IF;


  -- ══════════════════════════════════════════════════════════
  -- TABLE: fees
  -- ══════════════════════════════════════════════════════════

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='fees' AND column_name='student_unique_id') THEN
    ALTER TABLE fees ADD COLUMN student_unique_id VARCHAR(255) NOT NULL DEFAULT '';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='fees' AND column_name='student_name') THEN
    ALTER TABLE fees ADD COLUMN student_name VARCHAR(255) NOT NULL DEFAULT '';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='fees' AND column_name='school_code') THEN
    ALTER TABLE fees ADD COLUMN school_code VARCHAR(255) NOT NULL DEFAULT '';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='fees' AND column_name='grade') THEN
    ALTER TABLE fees ADD COLUMN grade VARCHAR(255);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='fees' AND column_name='section') THEN
    ALTER TABLE fees ADD COLUMN section VARCHAR(255);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='fees' AND column_name='fee_type') THEN
    ALTER TABLE fees ADD COLUMN fee_type VARCHAR(255) NOT NULL DEFAULT '';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='fees' AND column_name='total_amount') THEN
    ALTER TABLE fees ADD COLUMN total_amount DOUBLE PRECISION NOT NULL DEFAULT 0;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='fees' AND column_name='paid_amount') THEN
    ALTER TABLE fees ADD COLUMN paid_amount DOUBLE PRECISION DEFAULT 0;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='fees' AND column_name='pending_amount') THEN
    ALTER TABLE fees ADD COLUMN pending_amount DOUBLE PRECISION;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='fees' AND column_name='status') THEN
    ALTER TABLE fees ADD COLUMN status VARCHAR(50);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='fees' AND column_name='due_date') THEN
    ALTER TABLE fees ADD COLUMN due_date DATE;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='fees' AND column_name='paid_date') THEN
    ALTER TABLE fees ADD COLUMN paid_date DATE;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='fees' AND column_name='payment_mode') THEN
    ALTER TABLE fees ADD COLUMN payment_mode VARCHAR(255);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='fees' AND column_name='transaction_id') THEN
    ALTER TABLE fees ADD COLUMN transaction_id VARCHAR(255);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='fees' AND column_name='remarks') THEN
    ALTER TABLE fees ADD COLUMN remarks VARCHAR(255);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='fees' AND column_name='collected_by') THEN
    ALTER TABLE fees ADD COLUMN collected_by VARCHAR(255);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='fees' AND column_name='created_at') THEN
    ALTER TABLE fees ADD COLUMN created_at TIMESTAMP DEFAULT NOW();
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='fees' AND column_name='updated_at') THEN
    ALTER TABLE fees ADD COLUMN updated_at TIMESTAMP;
  END IF;

END $$;