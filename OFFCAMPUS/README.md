# OffCampus — Smart Expense & Split Manager

A student expense and roommate-splitting web application. The frontend and REST API run as separate local servers and communicate with `fetch()` and JSON.

## Requirements

- Node.js 22.13 or newer (the project uses `node:sqlite`)
- npm

## Run the app on Windows

If your PowerShell prompt currently ends with `\SEMINAR>`, first change into the backend folder:

```powershell
Set-Location .\OFFCAMPUS\backend
npm install
npm run db:init
npm start
```

Keep that terminal open. The API listens at **http://127.0.0.1:3000**. Check it at **http://127.0.0.1:3000/api/health**.

Keep the API terminal running. Open a second PowerShell terminal, go to the same backend folder, and start the frontend:

```powershell
Set-Location .\OFFCAMPUS\backend
npm run dev:frontend
```

Open **http://127.0.0.1:5173** in your browser. The frontend server uses port 5173 and the API uses port 3000; they are separate origins. The API allows the frontend origin through CORS.

Stop either server with `Ctrl+C` in its terminal. If you change a demo password or sample data and want to restore the demo credentials, run `npm run db:init` again. The initializer keeps existing non-demo users and expenses.

### Demo accounts

| Username | Password |
|---|---|
| `hannah` | `GarrettG44!` |
| `wellsey` | `GarrettG44!` |
| `jlo` | `Maverick22!` |

These are local demonstration accounts. The database is at `backend\data\offcampus.sqlite`.

## Features

- Register and sign in with a username or email; passwords are hashed with bcrypt.
- Add, edit, and delete personal expenses.
- Propose roommate shares and accept or decline incoming requests.
- Review balances and mark accepted shares settled.
- View spending summaries by category.
- Create savings goals and spending budgets, and record contributions.
- Maintain a private profile picture and attach private receipts to expenses.
- Switch the interface between English and Slovenian, and display EUR or USD (display only; no currency conversion).

## Project layout

```text
OFFCAMPUS/
  backend/       Express REST API, SQLite database, and database initializer
  frontend/      HTML, CSS, JavaScript, and separate static web server
  docs/          Database relationship diagram and presentation notes
```

## Database presentation material

See [docs/database-and-presentation.md](docs/database-and-presentation.md) for the Mermaid ER diagram, relationship explanations, screen overview, architecture diagram, and suggested presentation sequence.

## API overview

All routes except registration, login, and the health check require `Authorization: Bearer <token>`.

| Method | Route | Purpose |
|---|---|---|
| `POST` | `/api/auth/register` | Create an account |
| `POST` | `/api/auth/login` | Sign in |
| `GET` | `/api/health` | Check API status |
| `GET` | `/api/categories` | List expense categories |
| `GET` | `/api/users` | List possible roommates |
| `GET`, `POST` | `/api/expenses` | List or add expenses |
| `PUT`, `DELETE` | `/api/expenses/:id` | Update or delete an expense |
| `GET` | `/api/expenses/summary` | Category totals for a month |
| `GET` | `/api/expenses/balance` | Pending shares and current balances |
| `PATCH` | `/api/expenses/:id/splits/:splitId/decision` | Accept or decline a proposed split |
| `PATCH` | `/api/expenses/:id/splits/:splitId` | Mark an accepted share settled or reopen it |
| `GET`, `PATCH` | `/api/profile` | View or update your profile |
| `GET`, `PUT`, `DELETE` | `/api/profile/avatar` | View, upload, or remove a profile picture |
| `GET`, `POST` | `/api/goals` | List or create goals |
| `POST` | `/api/goals/:id/contributions` | Record a contribution |
| `GET`, `POST` | `/api/expenses/:id/receipts` | List or upload expense receipts |
| `GET`, `DELETE` | `/api/expenses/:id/receipts/:receiptId` | Download or remove a receipt |

## Tests

From `OFFCAMPUS\backend`, run `npm test`. The tests use a temporary database.

## Configuration

The API defaults to `127.0.0.1:3000`; the frontend defaults to `127.0.0.1:5173`. `PORT`, `HOST`, and `FRONTEND_PORT` can be set in `backend/.env`. Set `FRONTEND_ORIGINS` to a comma-separated list if serving the frontend from another origin. Set a persistent, private `JWT_SECRET` before any production deployment.
