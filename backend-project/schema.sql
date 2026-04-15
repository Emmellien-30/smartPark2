-- =============================================================
-- CRPMS — Car Repair Payment Management System
-- SmartPark, Rubavu District, Western Province, Rwanda
-- =============================================================
-- HOW TABLES ARE RELATED:
--
--  Services ──────────< ServiceRecord >────────── Car
--   (1)                     (M)                   (1)
--   PK: ServiceCode          FK: ServiceCode       PK: PlateNumber
--                            FK: PlateNumber
--
--  Car ────────────────────< Payment
--  (1)                          (M)
--  PK: PlateNumber              FK: PlateNumber
--
--  ServiceRecord ─────────< Payment  (optional link via RecordNumber)
--
--  Users: standalone auth table (no FK — admin only)
--
-- Relationships summary:
--   - One Car can have MANY ServiceRecords (a car can be repaired multiple times)
--   - One Service can appear in MANY ServiceRecords
--   - One Car can have MANY Payments
--   - A ServiceRecord links one Car to one Service on one date
-- =============================================================

CREATE DATABASE IF NOT EXISTS crpms;
USE crpms;

-- ── TABLE 1: Users (Authentication) ─────────────────────────
-- Standalone table: no foreign keys.
-- Stores the admin/mechanic login credentials.
CREATE TABLE IF NOT EXISTS Users (
    UserID       INT           NOT NULL AUTO_INCREMENT,
    Username     VARCHAR(50)   NOT NULL,
    Password     VARCHAR(255)  NOT NULL,           -- bcrypt hashed
    FullName     VARCHAR(100)  NOT NULL,
    CreatedAt    TIMESTAMP     DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (UserID),
    UNIQUE KEY uq_username (Username)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ── TABLE 2: Services ────────────────────────────────────────
-- Master list of repair services and their prices.
-- No foreign keys — it is referenced BY ServiceRecord.
-- ServiceCode: INT AUTO_INCREMENT (not a string like "SVC001")
CREATE TABLE IF NOT EXISTS Services (
    ServiceCode    INT           NOT NULL AUTO_INCREMENT,
    ServiceName    VARCHAR(100)  NOT NULL,
    ServicePrice   DECIMAL(12,2) NOT NULL,
    PRIMARY KEY (ServiceCode),
    UNIQUE KEY uq_servicename (ServiceName)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ── TABLE 3: Car ─────────────────────────────────────────────
-- Stores details of every car brought to the garage.
-- PlateNumber is the PK — Rwandan format e.g. RAG300S
-- (RA = code, G = district, 300 = digits, S = letter suffix)
-- No foreign keys — Car is referenced BY ServiceRecord and Payment.
CREATE TABLE IF NOT EXISTS Car (
    PlateNumber         VARCHAR(10)  NOT NULL,   -- e.g. RAG300S, RAB123A
    CarType             VARCHAR(50)  NOT NULL,   -- Sedan, SUV, Truck, etc.
    Model               VARCHAR(50)  NOT NULL,   -- Toyota Corolla, etc.
    ManufacturingYear   YEAR         NOT NULL,
    DriverPhone         VARCHAR(15)  NOT NULL,
    MechanicName        VARCHAR(100) NOT NULL,
    CreatedAt           TIMESTAMP    DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (PlateNumber)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ── TABLE 4: ServiceRecord ───────────────────────────────────
-- Junction/transaction table linking Car ↔ Service.
-- RecordNumber: INT AUTO_INCREMENT PK
-- FK: PlateNumber → Car (which car)
-- FK: ServiceCode → Services (which service was done)
-- One row = one repair service done on one car on one date.
CREATE TABLE IF NOT EXISTS ServiceRecord (
    RecordNumber   INT          NOT NULL AUTO_INCREMENT,
    ServiceDate    DATE         NOT NULL,
    PlateNumber    VARCHAR(10)  NOT NULL,   -- FK → Car
    ServiceCode    INT          NOT NULL,   -- FK → Services
    Notes          TEXT         DEFAULT NULL,
    CreatedAt      TIMESTAMP    DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (RecordNumber),
    CONSTRAINT fk_sr_car     FOREIGN KEY (PlateNumber) REFERENCES Car(PlateNumber)      ON UPDATE CASCADE ON DELETE RESTRICT,
    CONSTRAINT fk_sr_service FOREIGN KEY (ServiceCode) REFERENCES Services(ServiceCode) ON UPDATE CASCADE ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ── TABLE 5: Payment ─────────────────────────────────────────
-- Records payment made for a car's service.
-- PaymentNumber: INT AUTO_INCREMENT PK
-- FK: PlateNumber → Car (which car paid)
-- FK: RecordNumber → ServiceRecord (which service record this pays for)
-- AmountPaid can differ from ServicePrice (partial/full payment)
CREATE TABLE IF NOT EXISTS Payment (
    PaymentNumber    INT           NOT NULL AUTO_INCREMENT,
    AmountPaid       DECIMAL(12,2) NOT NULL,
    PaymentDate      DATE          NOT NULL,
    PlateNumber      VARCHAR(10)   NOT NULL,   -- FK → Car
    RecordNumber     INT           NOT NULL,   -- FK → ServiceRecord
    PaymentMethod    ENUM('Cash','Mobile Money','Bank Transfer') DEFAULT 'Cash',
    ReceivedBy       VARCHAR(100)  NOT NULL,   -- mechanic/cashier name
    CreatedAt        TIMESTAMP     DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (PaymentNumber),
    CONSTRAINT fk_pay_car    FOREIGN KEY (PlateNumber)   REFERENCES Car(PlateNumber)         ON UPDATE CASCADE ON DELETE RESTRICT,
    CONSTRAINT fk_pay_record FOREIGN KEY (RecordNumber)  REFERENCES ServiceRecord(RecordNumber) ON UPDATE CASCADE ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- =============================================================
-- SEED DATA
-- =============================================================

-- Admin user (password: Admin@2025 — bcrypt hash)
INSERT INTO Users (Username, Password, FullName) VALUES
('admin',    '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Chief Mechanic'),
('mechanic', '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Jean Habimana');
-- Default password for both: admin123

-- Repair services with their prices (from the exam specification)
INSERT INTO Services (ServiceName, ServicePrice) VALUES
('Engine Repair',        150000.00),
('Transmission Repair',   80000.00),
('Oil Change',            60000.00),
('Chain Replacement',     40000.00),
('Disc Replacement',     400000.00),
('Wheel Alignment',        5000.00);

-- Sample cars with Rwandan plate numbers
-- Format: RA + district letter + 3 digits + letter
INSERT INTO Car (PlateNumber, CarType, Model, ManufacturingYear, DriverPhone, MechanicName) VALUES
('RAG300S', 'Sedan',  'Toyota Corolla',   2018, '+250788001001', 'Jean Habimana'),
('RAB450K', 'SUV',    'Toyota RAV4',      2020, '+250788002002', 'Jean Habimana'),
('RAC712M', 'Truck',  'Isuzu Forward',    2015, '+250788003003', 'Eric Nkurunziza'),
('RAD120P', 'Sedan',  'Volkswagen Polo',  2019, '+250788004004', 'Jean Habimana'),
('RAF890T', 'Minivan','Toyota Hiace',     2017, '+250788005005', 'Eric Nkurunziza');

-- Service records — linking cars to services
INSERT INTO ServiceRecord (ServiceDate, PlateNumber, ServiceCode, Notes) VALUES
('2025-04-01', 'RAG300S', 1, 'Full engine overhaul — spark plugs replaced'),
('2025-04-01', 'RAB450K', 3, 'Regular oil change — 5W30 synthetic'),
('2025-04-02', 'RAC712M', 2, 'Gear transmission slipping — replaced clutch plate'),
('2025-04-03', 'RAD120P', 6, 'Front and rear wheel alignment'),
('2025-04-04', 'RAF890T', 4, 'Drive chain worn — replaced with new chain'),
('2025-04-05', 'RAG300S', 5, 'Front disc brake replacement — both sides');

-- Payments for service records
INSERT INTO Payment (AmountPaid, PaymentDate, PlateNumber, RecordNumber, PaymentMethod, ReceivedBy) VALUES
(150000.00, '2025-04-01', 'RAG300S', 1, 'Cash',          'Jean Habimana'),
( 60000.00, '2025-04-01', 'RAB450K', 2, 'Mobile Money',  'Jean Habimana'),
( 80000.00, '2025-04-02', 'RAC712M', 3, 'Cash',          'Eric Nkurunziza'),
(  5000.00, '2025-04-03', 'RAD120P', 4, 'Bank Transfer',  'Jean Habimana'),
( 40000.00, '2025-04-04', 'RAF890T', 5, 'Cash',          'Eric Nkurunziza'),
(400000.00, '2025-04-05', 'RAG300S', 6, 'Mobile Money',  'Jean Habimana');
