# OffCampus — Smart Expense & Split Manager

OffCampus is a local-first student project for tracking personal expenses and sharing bills with roommates. The Express backend serves the vanilla HTML/CSS/JavaScript client and the JSON REST API from one origin, so you do **not** need a domain, hosting provider, or outside server to develop and demonstrate it.

## Requirements

- Node.js 22.13 or newer (Node.js 24 LTS is recommended; the project uses `node:sqlite`).
- npm.

## Start locally on Windows

Open PowerShell in `offcampus\backend` and run:

```powershell
npm install
npm run db:init
npm run dev
```

Then open **http://localhost:3000** in your browser. The app and API are both served by the Node process, which listens only on your own computer by default. To stop it, press `Ctrl+C`.

The database is created at `backend\data\offcampus.sqlite`. The initializer is safe to run again: it adds missing sample users and only inserts demonstration expenses when the database has no expenses.

### Demo accounts

| Username | Password |
|---|---|
| `hannah` | `GarrettG44!` |
| `wellsey` | `GarrettG44!` |
| `jlo` | `Maverick22!` |

These are local demonstration accounts, not production credentials. Create your own account for normal use.

### Optional configuration

Copy `.env.example` to `.env` in `backend` to set the port, a persistent JWT signing secret, or CORS origins:

```powershell
Copy-Item .env.example .env
```

The frontend is served by Express by default. If you choose to serve the frontend separately (for example with a development server on port 5173), set `FRONTEND_ORIGINS` in `.env` to that exact origin. The application does not require the separate server or external services. For production, set a strong private `JWT_SECRET`; the server refuses to start in production without one. A random in-memory secret is used only when developing locally without a `.env` file, so local sessions expire when the server restarts.

## Initialize / reset sample data

`npm run db:init` creates the tables and seeds the example accounts plus a few expenses. It does not erase existing data. To start over, stop the server and manually remove the specific local database file `backend\data\offcampus.sqlite`, then run the initializer again.

## API overview

Most API responses use JSON; profile pictures and receipt downloads return file content, while successful deletes return `204 No Content`.
All routes except registration, login, and the health check require authentication.

| Method | Route | Purpose |
|---|---|---|
| `POST` | `/api/auth/register` | Create an account and receive a JWT |
| `POST` | `/api/auth/login` | Sign in with username or email |
| `GET` | `/api/health` | Check that the local API is running |
| `GET` | `/api/categories` | List expense categories |
| `GET` | `/api/users` | List other usernames for shared expenses |
| `GET` | `/api/expenses` | List expenses you paid or participate in |
| `POST` | `/api/expenses` | Create an expense and optional roommate splits |
| `PUT` | `/api/expenses/:id` | Update an expense you created |
| `DELETE` | `/api/expenses/:id` | Delete an expense you created |
| `GET` | `/api/expenses/summary?month=YYYY-MM` | Category breakdown of expenses you paid |
| `GET` | `/api/expenses/balance` | Unsettled shared splits involving your account |
| `PATCH` | `/api/expenses/:id/splits/:splitId/decision` | Accept or decline a shared-expense request assigned to you |
| `PATCH` | `/api/expenses/:id/splits/:splitId` | Mark a split settled or reopen it |
| `GET`, `PATCH` | `/api/profile` | View or update your own display name |
| `GET`, `PUT`, `DELETE` | `/api/profile/avatar` | View, upload, or remove your own profile picture |
| `GET`, `POST` | `/api/goals` | List or create your own savings and spending goals |
| `POST` | `/api/goals/:id/contributions` | Record a savings contribution |
| `DELETE` | `/api/goals/:id/contributions/:contributionId` | Remove your savings contribution |
| `GET` | `/api/expenses/receipts` | List receipts attached to expenses you paid |
| `GET`, `POST` | `/api/expenses/:id/receipts` | List or upload receipts for an expense you paid |
| `GET`, `DELETE` | `/api/expenses/:id/receipts/:receiptId` | Download or remove your private receipt |

For a shared expense, split amounts are proposed amounts owed by each listed roommate to the person who paid. The payer is responsible for the remainder. Amounts must be positive, and roommate shares may not exceed the expense total. A roommate must accept a proposed share before it appears in either person's balance; they can decline it instead. An accepted share can be marked settled by the roommate or the payer. Roommates see only their own share; the person who created the expense can see all its splits. Usernames are unique regardless of letter case.

Savings progress is entered manually because the app does not connect to bank accounts. Weekly, monthly, and yearly budgets total the expenses you entered as paid by you during the current period. Each user can have one goal of each type per period. Profile details and receipt files are private to the signed-in owner; receipts must be attached to an expense you paid. Uploads accept JPEG, PNG, WebP, or PDF files, with a 10 MB per-file limit, a 5 MB avatar limit, and 100 MB total private storage per user.

The app does not process payments, ask for bank passwords, use a paid subscription, or load third-party web fonts. Uploaded files are stored outside the public frontend and served only after authentication and ownership checks. However, anyone with access to the computer or server files can access its local database and stored files; this local-first app cannot hide data from its machine operator. Keep backups private and do not upload sensitive receipts to a public GitHub repository.

The interface supports English and Slovenian, and users can choose EUR or USD for displaying amounts. Currency selection changes the symbol and formatting only; it does not convert or otherwise change the stored values. Language and currency preferences are saved in the current browser.

The implementation includes parameterized SQLite queries, foreign keys, transactional expense/split writes, bcrypt password hashing, expiring JWTs, request validation, CORS allowlisting, private owner-scoped uploads, and centralized JSON errors. JWTs are stored in browser `localStorage` for this coursework demo; for a public production deployment, use secure, HttpOnly cookies and add deployment-specific protections.

## Tests

From `offcampus\backend`:

```powershell
npm test
```

Tests use a temporary SQLite database and do not modify the demonstration database.
