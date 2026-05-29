-- ============================================================
-- SchoolWala - Full Schema
-- CREATE TABLE IF NOT EXISTS — safe to run on fresh or
-- existing DB. Tables are only created if they don't exist.
-- ============================================================


-- ============================================================
-- TABLE: schools
-- ============================================================
CREATE TABLE IF NOT EXISTS schools (
    id                   BIGSERIAL    PRIMARY KEY,
    school_code          VARCHAR(255) NOT NULL DEFAULT '' UNIQUE,
    school_name          VARCHAR(255) NOT NULL DEFAULT '',
    affiliation_no       VARCHAR(255),
    board_type           VARCHAR(255),
    school_type          VARCHAR(255),
    established_year     INTEGER,
    website_url          VARCHAR(255),
    state                VARCHAR(255),
    city                 VARCHAR(255),
    locality             VARCHAR(255),
    address              VARCHAR(255),
    phone                VARCHAR(255),
    email                VARCHAR(255),
    principal_name       VARCHAR(255),
    principal_contact    VARCHAR(255),
    primary_color        VARCHAR(255),
    logo_url             VARCHAR(255),
    logo_base64          TEXT,
    banner_base64        TEXT,
    admin_username       VARCHAR(255) NOT NULL DEFAULT '',
    admin_password       VARCHAR(255) NOT NULL DEFAULT '',
    must_change_password BOOLEAN      NOT NULL DEFAULT TRUE,
    created_at           TIMESTAMP    NOT NULL DEFAULT NOW(),
    updated_at           TIMESTAMP
);


-- ============================================================
-- TABLE: users
-- ============================================================
CREATE TABLE IF NOT EXISTS users (
    id                   BIGSERIAL    PRIMARY KEY,
    unique_id            VARCHAR(255) NOT NULL DEFAULT '' UNIQUE,
    username             VARCHAR(255) NOT NULL DEFAULT '',
    password             VARCHAR(255) NOT NULL DEFAULT '',
    full_name            VARCHAR(255) NOT NULL DEFAULT '',
    email                VARCHAR(255),
    phone                VARCHAR(255),
    date_of_birth        DATE,
    address              VARCHAR(255),
    role                 VARCHAR(50)  NOT NULL DEFAULT 'STUDENT',
    school_code          VARCHAR(255) NOT NULL DEFAULT '',
    employee_id          VARCHAR(255),
    subject              VARCHAR(255),
    class_assigned       VARCHAR(255),
    grade                VARCHAR(255),
    section              VARCHAR(255),
    parent_name          VARCHAR(255),
    parent_phone         VARCHAR(255),
    active               BOOLEAN      NOT NULL DEFAULT TRUE,
    must_change_password BOOLEAN      NOT NULL DEFAULT TRUE,
    created_at           TIMESTAMP    NOT NULL DEFAULT NOW(),
    updated_at           TIMESTAMP
);


-- ============================================================
-- TABLE: attendance
-- ============================================================
CREATE TABLE IF NOT EXISTS attendance (
    id                BIGSERIAL    PRIMARY KEY,
    student_unique_id VARCHAR(255) NOT NULL DEFAULT '',
    student_name      VARCHAR(255) NOT NULL DEFAULT '',
    school_code       VARCHAR(255) NOT NULL DEFAULT '',
    grade             VARCHAR(255),
    section           VARCHAR(255),
    date              DATE         NOT NULL DEFAULT CURRENT_DATE,
    status            VARCHAR(50)  NOT NULL DEFAULT 'PRESENT',
    marked_by         VARCHAR(255),
    remarks           VARCHAR(255),
    created_at        TIMESTAMP    DEFAULT NOW()
);


-- ============================================================
-- TABLE: fees
-- ============================================================
CREATE TABLE IF NOT EXISTS fees (
    id                BIGSERIAL        PRIMARY KEY,
    student_unique_id VARCHAR(255)     NOT NULL DEFAULT '',
    student_name      VARCHAR(255)     NOT NULL DEFAULT '',
    school_code       VARCHAR(255)     NOT NULL DEFAULT '',
    grade             VARCHAR(255),
    section           VARCHAR(255),
    fee_type          VARCHAR(255)     NOT NULL DEFAULT '',
    total_amount      DOUBLE PRECISION NOT NULL DEFAULT 0,
    paid_amount       DOUBLE PRECISION          DEFAULT 0,
    pending_amount    DOUBLE PRECISION,
    status            VARCHAR(50),
    due_date          DATE,
    paid_date         DATE,
    payment_mode      VARCHAR(255),
    transaction_id    VARCHAR(255),
    remarks           VARCHAR(255),
    collected_by      VARCHAR(255),
    created_at        TIMESTAMP                 DEFAULT NOW(),
    updated_at        TIMESTAMP
);