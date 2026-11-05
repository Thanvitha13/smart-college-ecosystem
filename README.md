# OpportunityHub

OpportunityHub is a React/Vite client and Express/Mongoose API for discovering student opportunities. MongoDB is the source of truth for users, listings, bookmarks, applications, and notifications. The client does not use a mock-data fallback.

## Requirements

- Node.js 20 or newer and npm
- MongoDB 6 or newer, locally or through MongoDB Atlas
- SMTP credentials only if password recovery email is required

## Setup

From the project root in PowerShell:

```powershell
Copy-Item backend/.env.example backend/.env
npm install
```

Edit `backend/.env` and set `MONGODB_URI`, a long random `JWT_SECRET`, `ADMIN_EMAIL`, and `ADMIN_PASSWORD`. For local MongoDB, the example URI is `mongodb://127.0.0.1:27017/opportunityhub`. For Atlas, use the connection URI from your cluster and allow the development machine in its network access settings.

Seed the first administrator and initial opportunity listings:

```powershell
npm run seed
```

The seed command creates the admin account from the environment values if needed, then adds any missing sample listings without duplicating existing ones. Sample application links use `example.com` and are placeholders; replace them with verified links before publishing listings to users.

If an administrator already exists and its login needs to match `backend/.env`, run `npm run set-admin`. This updates the existing admin password using the model's password hashing.

Start the client and API together:

```powershell
npm run dev
```

Open <http://localhost:5173>. The API listens at <http://localhost:5000>; Vite proxies `/api` and `/uploads` to it. Build the client with `npm run build`. Run workspace syntax/build checks with `npm run check`.

## Optional password recovery email

Set `SMTP_HOST`, `SMTP_PORT` (usually `587`), `SMTP_USER`, `SMTP_PASS`, `SMTP_SECURE` (`true` for implicit TLS, otherwise `false`), and `MAIL_FROM` in `backend/.env`. Reset tokens are random, stored as SHA-256 hashes, expire after 30 minutes, and are single-use. Without SMTP settings the recovery endpoint returns a configuration error; it does not expose a reset token in the browser.

## Included workflows

- Student registration/login, protected routes, profile edits/photo, password change, and resume upload.
- Opportunity search, category/location/skill filters, sorting, details, bookmarks, and application tracking.
- Rule-based recommendations from profile skills/interests and required opportunity skills/category.
- In-app new-listing, deadline, and application-status notifications.
- Admin overview, student list, opportunity publishing/editing/deletion, application review/status updates, and report triage.
- Seed-only sample listings; production data comes from MongoDB.

## Scope notes

- Recommendations use profile keywords and required skills; uploaded resumes are stored securely but are not parsed for skills.
- Deadline and listing alerts are in-app. SMTP is currently used for password recovery, not deadline or listing email campaigns.
- Opportunity categories are the eight supported values in the API and admin form; custom category creation is not exposed.
- Analytics are database-backed counts and category/status summaries, not a historical activity audit log.

## Environment variables

See `backend/.env.example`. `CLIENT_ORIGIN` should match the frontend origin. Keep `backend/.env` private and never commit real secrets. The default sample admin password is intentionally a placeholder and must be replaced.
