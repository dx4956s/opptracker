# OppTracker

A personal all-in-one tracker for jobs, contracts, and freelance projects. Built for self-hosting — you own your data, no third-party services, no subscriptions.

## What it does

OppTracker helps you stay on top of every opportunity across three modules:

**Jobs** — Track the full lifecycle of job applications
- Applied → Working → Left
- Applied → Rejected
- Per-stage statuses (e.g. No Callback, Interview Scheduled, Offer Received)
- Fields: company, role, description, expected package, salary in discussion toggle, working hours, rating, positive/negative reviews, applied date, start date, end date, rejected date, links, notes

**Contracts** — Track client contracts from proposal to completion
- Pending → Active → Completed
- Pending → Cancelled
- Per-stage statuses (e.g. No Response, Negotiating, Signed)
- Fields: client, title, description, contract value, duration, value/duration in discussion toggles, working hours, rating, reviews, timeline dates, completion status (on time / delayed / early), links, notes

**Freelance** — Track freelance bids and projects
- Bidding → In Progress → Completed
- Bidding → Lost
- Per-stage statuses (e.g. Proposal Sent, Revision Requested, On Track)
- Fields: client, title, description, hourly rate, hours per day, total earnings (auto-calculated), rating, reviews, timeline dates, links, notes

**Dashboard** — Overview of all active opportunities and recent activity

**Admin panel** — User management (create, update, delete users). Only admins can manage accounts.

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 16 (App Router) |
| Database | MongoDB via Mongoose 9 |
| Auth | JWT (jose) + HttpOnly cookies |
| Client state | Zustand 5 |
| Data fetching | SWR 2 |
| Styling | Tailwind CSS v4 |
| Language | TypeScript |

## Prerequisites

- Node.js 18+
- A MongoDB instance (local or [MongoDB Atlas](https://www.mongodb.com/atlas) free tier)

## Getting Started

### 1. Clone the repo

```bash
git clone https://github.com/dx4956s/opptracker.git
cd opptracker
```

### 2. Install dependencies

```bash
npm install
```

### 3. Set up environment variables

```bash
cp .env.example .env
```

Open `.env` and fill in all values. See the table below for what each variable does.

| Variable | Required | Description |
|---|---|---|
| `ADMIN_USER` | Yes | Username for the admin account |
| `ADMIN_PASS` | Yes | Password for the admin account |
| `TEST_USER` | No | Username for an optional read/write demo account |
| `TEST_PASS` | No | Password for the demo account |
| `MONGODB_URI` | Yes | MongoDB connection string (see notes below) |
| `JWT_SECRET` | Yes | Long random string used to sign session tokens |

**Generating a secure JWT_SECRET:**
```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

**MongoDB URI notes:**

If you are using MongoDB Atlas and get a `querySrv ECONNREFUSED` error, your local DNS resolver does not support SRV record queries from Node.js. Use the standard `mongodb://` URI with explicit hostnames instead of `mongodb+srv://`. You can find the individual shard hostnames in your Atlas cluster's connection options under "Advanced connection string".

```
# SRV format (may fail on some networks/routers)
mongodb+srv://user:pass@cluster.mongodb.net/opptracker

# Standard format (always works)
mongodb://user:pass@shard-00-00.example.mongodb.net:27017,shard-00-01.example.mongodb.net:27017,shard-00-02.example.mongodb.net:27017/opptracker?authSource=admin&replicaSet=atlas-xxxxx&tls=true
```

### 4. Run the development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

On first request, the server connects to MongoDB and automatically seeds the admin and test accounts using the credentials in your `.env`. You can log in immediately.

## Project Structure

```
opptracker/
├── app/
│   ├── (auth)/          # Login page
│   ├── (dashboard)/     # All dashboard pages (jobs, contracts, freelance, profile)
│   ├── (admin)/         # Admin user management
│   └── api/             # Route handlers (auth, jobs, contracts, freelance, profile, dashboard)
├── components/
│   ├── auth/            # Login form
│   ├── dashboard/       # Page-level components (tables, detail views, popups)
│   └── ui/              # Reusable UI primitives (DatePicker, CustomSelect, ConfirmModal, etc.)
├── lib/
│   ├── db.ts            # MongoDB connection + admin/test user seeding
│   ├── auth.ts          # Password hashing (PBKDF2) and JWT sign/verify
│   ├── withAuth.ts      # Route handler auth middleware
│   ├── fetcher.ts       # SWR fetcher and apiFetch utility
│   └── models/          # Mongoose models (User, Job, Contract, Freelance, UserProfile)
└── store/               # Zustand stores and type definitions
```

## Authentication

- Sessions are stored as HttpOnly cookies (key: `session`) containing a signed JWT
- Tokens expire after 7 days
- Passwords are hashed with PBKDF2-SHA512 (100,000 iterations)
- All API routes are protected via `withAuth` middleware
- Admin-only routes additionally check for `role: "admin"`

## User Management

Only admins can create or delete user accounts. There is no public sign-up. To request access to a hosted instance, contact the admin.

The admin and test accounts are automatically created on startup from `ADMIN_USER`/`ADMIN_PASS` and `TEST_USER`/`TEST_PASS` in `.env`. If the credentials in `.env` change, they are updated on the next cold start.

## Building for Production

```bash
npm run build
npm start
```

Set all environment variables in your host's dashboard rather than committing a `.env` file. The `.env` file is gitignored by default.

## Self-Hosting

OppTracker is a standard Next.js app and can be deployed to any Node.js-capable host:

- **VPS** (Ubuntu, etc.) — run `npm run build && npm start` behind nginx or Caddy
- **Railway / Render / Fly.io** — connect your repo, set env vars, deploy
- **Docker** — build a standard Next.js Docker image (see [Next.js Docker docs](https://nextjs.org/docs/app/getting-started/deploying#docker))

## Access

This is a personal project. Account creation is not open to the public. To request access to a hosted instance, email [work@divyanksingh.com](mailto:work@divyanksingh.com). To run your own instance, fork the repo and self-host it.
