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

## Deploy to Vercel and Render

The frontend is configured for Vercel (`vercel.json`); the Express API is configured as a Render web service (`render.yaml`). MongoDB Atlas is required. Render's persistent upload disk is configured for profile photos and resumes.

1. Create a MongoDB Atlas database and a database user. Configure Atlas network access to allow connections from your Render service.
2. In Vercel, import this repository and deploy it using the settings in `vercel.json`. You can deploy the frontend before the API, but login and other API-backed features will not work until the backend is connected.
3. In Render, create a Blueprint from this repository and deploy `render.yaml`. Provide `MONGODB_URI`, `CLIENT_ORIGIN`, `ADMIN_EMAIL`, and `ADMIN_PASSWORD` when prompted. Set `CLIENT_ORIGIN` to your Vercel site origin (for example, `https://your-site.vercel.app`); Render generates `JWT_SECRET`.
4. In Vercel, add `VITE_API_URL` with the Render service origin only (for example, `https://opportunityhub-api.onrender.com`, without `/api`) and redeploy. Confirm the Render `CLIENT_ORIGIN` exactly matches the deployed Vercel origin.
5. Seed the production database if you want the initial admin account and sample listings. Run `npm run seed --workspace backend` with the production `MONGODB_URI`, `ADMIN_EMAIL`, and `ADMIN_PASSWORD` in your local `backend/.env`. Never commit that file. Replace the sample `example.com` listing URLs before publishing.

The Render blueprint uses a paid Starter service and a 1 GB persistent disk so uploaded files survive deploys and restarts. Password recovery email is optional; configure the SMTP variables in Render to enable it.

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
