# CampusLedger — Student Finance OS

A full-stack student expense and personal-finance tracker built to help college students track spending, manage budgets, plan savings, and understand where their money goes.

---

## Overview

College students juggle a lot of small, recurring money decisions: a monthly allowance, canteen food, transport, mobile/Wi-Fi recharges, subscriptions, college fees, and — for some — a gym or fitness routine on top of all that. CampusLedger brings all of it into one dashboard: log income and expenses, set an overall and per-category budget, track recurring bills, save toward specific goals, and see where the money is actually going.

---

## Features

**Authentication**
- Register / Login with email + password
- User-specific financial data, scoped to the logged-in account
- Session persists across a browser refresh

**Expense Tracking**
- Income and expense transactions with category, description, and date
- Add / Edit / Delete, search and filter
- Quick Add presets
- Voice-assisted entry with an editable preview and explicit confirmation before saving

**Budget Management**
- Monthly allowance and monthly spending budget
- Per-category budgets with progress tracking
- Optional monthly savings target
- Daily Safe Spend calculation

**Recurring Expenses**
- Weekly / Monthly / Yearly recurring bills
- "Mark Paid" creates the transaction and advances the next due date
- Upcoming-payments overview

**Savings Goals**
- Create goals with a target amount and optional target date
- Add funds toward a goal with progress tracking

**Analytics**
- Category spending breakdown
- Monthly and weekly spending trends, income vs. expense comparison

**Personalization**
- Student personas (College Student / College + Gym-Fitness) that tailor available categories
- Guided onboarding
- Light / dark theme
- Responsive layout (desktop, tablet, mobile)

---

## Tech Stack

**Frontend**
- React 18 (JavaScript)
- Vite
- Tailwind CSS
- React Router v6
- Context API + `useReducer`
- Recharts
- Lucide React (icons)
- Web Speech API for voice entry
- Native `fetch()` via a centralized API service layer

**Backend**
- Node.js + Express
- MongoDB + Mongoose
- JWT authentication
- bcryptjs password hashing

No external AI API is used anywhere in this project — voice input is transcribed by the browser's built-in Web Speech API and parsed with a small rule-based keyword matcher.

---

## Architecture

```
React UI
    ↓
Context / State
    ↓
Service Layer
    ↓
REST API
    ↓
Express Route
    ↓
Controller
    ↓
Mongoose Model
    ↓
MongoDB
```

React components read and update state through `FinanceContext`/`AuthContext`. Actions go through a thin service layer, which calls a centralized API client. Requests hit Express routes, which are protected by JWT-based auth middleware and handled by controllers that validate input and enforce that every record belongs to the authenticated user before touching MongoDB via Mongoose.

---

## Project Structure

```
student-finance/
├── src/
│   ├── components/    UI components grouped by feature
│   ├── context/        Auth and Finance state (Context API + useReducer)
│   ├── hooks/           Custom React hooks
│   ├── pages/            Route-level pages
│   ├── services/        API client and per-resource service modules
│   ├── utils/            Calculations, date handling, voice parsing, etc.
│   └── constants/       Categories, app configuration
├── server/
│   ├── config/           Database connection
│   ├── controllers/     Request handling and business logic
│   ├── middleware/      Auth and error handling
│   ├── models/           Mongoose schemas
│   ├── routes/           API route definitions
│   └── server.js         App entry point
└── package.json          Single package.json for frontend and backend
```

---

## API Overview

All endpoints are prefixed with `/api`. "Auth" means a valid `Authorization: Bearer <token>` header is required.

| Method | Endpoint | Purpose | Auth |
|---|---|---|---|
| GET | `/health` | API + database status | Public |
| POST | `/auth/register` | Create an account | Public |
| POST | `/auth/login` | Log in | Public |
| GET | `/auth/me` | Get the current user | Protected |
| GET | `/users/profile` | Get profile | Protected |
| PUT | `/users/profile` | Update profile | Protected |
| GET | `/transactions` | List transactions | Protected |
| POST | `/transactions` | Create a transaction | Protected |
| PUT | `/transactions/:id` | Update a transaction | Protected |
| DELETE | `/transactions/:id` | Delete a transaction | Protected |
| GET | `/budget` | Get overall budget | Protected |
| PUT | `/budget` | Update overall budget | Protected |
| GET | `/category-budgets` | List category budgets | Protected |
| POST | `/category-budgets` | Create a category budget | Protected |
| PUT | `/category-budgets/:id` | Update a category budget | Protected |
| DELETE | `/category-budgets/:id` | Delete a category budget | Protected |
| GET | `/recurring` | List recurring expenses | Protected |
| POST | `/recurring` | Create a recurring expense | Protected |
| PUT | `/recurring/:id` | Update a recurring expense | Protected |
| DELETE | `/recurring/:id` | Delete a recurring expense | Protected |
| POST | `/recurring/:id/pay` | Mark as paid (creates a transaction, advances due date) | Protected |
| GET | `/goals` | List savings goals | Protected |
| POST | `/goals` | Create a savings goal | Protected |
| PUT | `/goals/:id` | Update a savings goal | Protected |
| DELETE | `/goals/:id` | Delete a savings goal | Protected |
| POST | `/goals/:id/add-money` | Add funds to a goal | Protected |

---

## Authentication & Security

- Passwords are hashed with bcrypt before storage and are never returned in API responses.
- Authentication uses JWTs — issued at login/registration, verified on every protected route by middleware.
- Every financial record (transactions, budgets, goals, etc.) is scoped to the authenticated user's ID from the verified token, never from data sent by the client.
- Profile and resource updates use allow-listed fields to prevent unintended data from being modified.
- Secrets (database connection string, JWT secret) are kept in environment variables and are not committed to the repository.

The JWT is currently stored in `localStorage` for simplicity. A production-grade deployment would likely use HttpOnly Secure cookies instead for stronger protection against XSS-based token theft.

---

## Getting Started

**Prerequisites:** Node.js, npm, and a MongoDB connection string (a free MongoDB Atlas cluster works).

```bash
git clone <repository-url>
cd student-finance
npm install
```

This project uses a single `package.json` for both the frontend and backend.

Set up environment variables:

```bash
cp .env.example .env
cp server/.env.example server/.env
```

Fill in `server/.env` with your MongoDB URI and a JWT secret (see below), then start the backend:

```bash
npm run server:dev
```

In a separate terminal, start the frontend:

```bash
npm run dev
```

The frontend runs at `http://localhost:3000` and the backend API at `http://localhost:5000/api` by default.

---

## Environment Variables

| Variable | Location | Purpose |
|---|---|---|
| `VITE_API_URL` | root `.env` | Base URL the frontend uses for API calls |
| `PORT` | `server/.env` | Port the backend server listens on |
| `MONGO_URI` | `server/.env` | MongoDB connection string |
| `JWT_SECRET` | `server/.env` | Secret used to sign and verify JWTs |
| `NODE_ENV` | `server/.env` | `development` or `production` |
| `CLIENT_URL` | `server/.env` | Allowed frontend origin for CORS |

Use your own values — never commit real credentials.

---

## Screenshots

Screenshots will be added here.

---

## Known Limitations

- JWT is stored in `localStorage`; a production deployment would likely use HttpOnly cookies instead.
- No automated test suite is currently included.
- Voice entry depends on browser support for the Web Speech API (best supported in Chrome and Edge).
