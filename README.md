# CRPMS — Car Repair Payment Management System
## SmartPark, Rubavu District, Western Province, Rwanda

---

## Overview

CRPMS is a full-stack web application that digitally manages SmartPark Garage's car repair services, tracks payments, and generates daily reports — replacing the manual paper-based system.

**Stack:** React 18 + Tailwind CSS (frontend) · Node.js + Express + MySQL (backend) · JWT Authentication

---

## Database Schema

### Tables and Relationships

```
Users          — standalone auth table (no FK)
Services       — master list of repairs (PK: ServiceCode AUTO_INCREMENT)
Car            — cars brought to garage (PK: PlateNumber, e.g. RAG300S)
ServiceRecord  — links Car ↔ Service per job (PK: RecordNumber AUTO_INCREMENT)
Payment        — payment per service record (PK: PaymentNumber AUTO_INCREMENT)

Car(PlateNumber) ──────────< ServiceRecord(PlateNumber FK) ─────── Services(ServiceCode FK)
Car(PlateNumber) ──────────< Payment(PlateNumber FK)
ServiceRecord(RecordNumber) < Payment(RecordNumber FK)
```

### CRUD Rules (per exam specification)
| Table         | INSERT | SELECT | UPDATE | DELETE |
|---------------|--------|--------|--------|--------|
| Car           | ✅     | ✅     | ❌     | ❌     |
| Services      | ✅     | ✅     | ❌     | ❌     |
| ServiceRecord | ✅     | ✅     | ✅     | ✅     |
| Payment       | ✅     | ✅     | ❌     | ❌     |

---

## Project Structure

```
CRPMS/
├── backend-project/
│   ├── src/
│   │   ├── config/db.js            ← MySQL connection pool
│   │   ├── middleware/auth.js      ← JWT verify middleware
│   │   └── routes/
│   │       ├── auth.js             ← POST /api/auth/login
│   │       ├── cars.js             ← GET, POST /api/cars
│   │       ├── services.js         ← GET, POST /api/services
│   │       ├── servicerecords.js   ← Full CRUD /api/servicerecords
│   │       ├── payments.js         ← GET, POST /api/payments + bill
│   │       └── reports.js          ← Daily report, dates, summary
│   ├── server.js
│   ├── schema.sql                  ← Full DB schema + seed data
│   ├── .env
│   └── package.json
│
└── frontend-project/
    ├── src/
    │   ├── api/                    ← Axios API files per entity
    │   ├── components/
    │   │   ├── common/             ← Modal, ConfirmDialog, LoadingSpinner, StatCard
    │   │   └── layout/             ← Sidebar, Layout
    │   ├── context/AuthContext.js  ← JWT auth state
    │   ├── pages/
    │   │   ├── LoginPage.js
    │   │   ├── DashboardPage.js
    │   │   ├── CarsPage.js
    │   │   ├── ServicesPage.js
    │   │   ├── ServiceRecordsPage.js  ← Full CRUD + edit + delete
    │   │   ├── PaymentsPage.js        ← Payment + bill generation + print
    │   │   └── ReportsPage.js         ← Daily report + print
    │   ├── utils/helpers.js
    │   └── App.js
    ├── tailwind.config.js
    └── package.json
```

---

## Setup & Installation

### Prerequisites
- Node.js v18+ installed
- MySQL / XAMPP / phpMyAdmin running
- Git (optional)

---

### Step 1 — Database Setup

1. Open **phpMyAdmin** (http://localhost/phpmyadmin) or MySQL Workbench
2. Click **Import** → Select file → choose `backend-project/schema.sql` → **Go**
3. Alternatively, open MySQL terminal and run:
   ```bash
   mysql -u root -p < backend-project/schema.sql
   ```
4. Verify the `crpms` database was created with these tables:
   - `Users`, `Services`, `Car`, `ServiceRecord`, `Payment`

---

### Step 2 — Backend Setup

```bash
cd backend-project

# Install dependencies
npm install

# Configure environment variables
# Edit .env and set your MySQL password:
# DB_PASSWORD=your_mysql_root_password
# (leave empty if no password: DB_PASSWORD=)

# Start the backend server
npm run dev
# OR: npm start

# ✅ Server runs at: http://localhost:5000
# ✅ Health check:   http://localhost:5000/
```

**Verify backend is running:**
```bash
curl http://localhost:5000/
# Response: {"message":"✅ CRPMS API is running","version":"1.0.0"}
```

---

### Step 3 — Frontend Setup

```bash
cd frontend-project

# Install dependencies
npm install

# Start the frontend
npm start

# ✅ App opens at: http://localhost:3000
```

---

### Step 4 — Login

| Username | Password  | Role           |
|----------|-----------|----------------|
| admin    | admin123  | Chief Mechanic |
| mechanic | admin123  | Mechanic       |

---

## API Endpoints

| Method | Endpoint                        | Description                    | Auth |
|--------|---------------------------------|--------------------------------|------|
| POST   | /api/auth/login                 | Login → returns JWT token      | No   |
| GET    | /api/auth/me                    | Get current user from token    | Yes  |
| GET    | /api/cars                       | List all cars                  | Yes  |
| POST   | /api/cars                       | Register new car               | Yes  |
| GET    | /api/services                   | List all services              | Yes  |
| POST   | /api/services                   | Add new service                | Yes  |
| GET    | /api/servicerecords             | List all service records       | Yes  |
| POST   | /api/servicerecords             | Create service record          | Yes  |
| PUT    | /api/servicerecords/:id         | Update service record          | Yes  |
| DELETE | /api/servicerecords/:id         | Delete service record          | Yes  |
| GET    | /api/payments                   | List all payments              | Yes  |
| POST   | /api/payments                   | Record a payment               | Yes  |
| GET    | /api/payments/bill/:id          | Get bill data for payment      | Yes  |
| GET    | /api/reports/daily?date=...     | Daily report for a date        | Yes  |
| GET    | /api/reports/dates              | List all payment dates         | Yes  |
| GET    | /api/reports/summary            | Overall stats for dashboard    | Yes  |

---

## Features

### ✅ Authentication
- JWT-based login (token stored in localStorage)
- Password hashing with bcrypt
- Protected routes — redirect to login if not authenticated

### ✅ Car Management
- Register cars with Rwandan plate number (e.g. RAG300S)
- Plate number validation (format: 2 letters + letter + 3 digits + letter)
- Duplicate plate detection

### ✅ Services Management
- View all repair services and prices
- Add new services with price validation

### ✅ Service Records (Full CRUD)
- Add, view, edit, delete service records
- Links a car to a service on a specific date
- Auto-shows service price on form

### ✅ Payments
- Record payments per service record
- Auto-fills amount from service price (editable)
- Supports Cash, Mobile Money, Bank Transfer
- **Bill generation** — opens printable receipt after payment

### ✅ Daily Reports
- Select any day to view all services performed and amounts collected
- Summary: cars serviced, total collected, service types
- **Print report** with signature areas

---

## Rwandan Plate Number Format

```
RAG300S
│││└──┘└─ Suffix letter
│││  └─── 3-digit number
││└────── District letter (A=Kigali, B=Eastern, C=Northern, D=Southern, F=Western, G=Kigali City...)
│└─────── Country code second letter
└──────── Country code (R=Rwanda, A=first letter)
```

Valid examples: `RAG300S`, `RAB450K`, `RAC712M`, `RAD120P`, `RAF890T`

---

## Troubleshooting

| Problem | Solution |
|---------|---------|
| `MySQL connection failed` | Check DB_HOST, DB_USER, DB_PASSWORD in .env. Make sure MySQL is running. |
| `CORS error` in browser | Make sure backend is running on port 5000 and frontend on 3000 |
| `401 Unauthorized` | Token expired — log out and log in again |
| Port 5000 in use | Change `PORT=5001` in .env and update axios baseURL in `src/api/axios.js` |
| `node_modules not found` | Run `npm install` inside both `backend-project/` and `frontend-project/` |
| Plate validation fails | Use format RAG300S — all uppercase, 7 characters total |

---

## Sample Data Loaded by schema.sql

### Services (6 records)
| Code | Service              | Price (RWF) |
|------|----------------------|-------------|
| 1    | Engine Repair        | 150,000     |
| 2    | Transmission Repair  | 80,000      |
| 3    | Oil Change           | 60,000      |
| 4    | Chain Replacement    | 40,000      |
| 5    | Disc Replacement     | 400,000     |
| 6    | Wheel Alignment      | 5,000       |

### Cars (5 records)
RAG300S · RAB450K · RAC712M · RAD120P · RAF890T

### Service Records (6 records) + Payments (6 records) for April 2025

---

© 2025 SmartPark CRPMS — Rubavu District, Rwanda
# smartPark2
