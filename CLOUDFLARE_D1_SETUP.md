# Cloudflare D1 persistence setup

This project submits report records to `/api/reports`, backed by Cloudflare D1.
The current deployment is D1-only: evidence file upload is hidden because R2 is not enabled.
If the API is unavailable during local Vite development, the app falls back to `localStorage`.

## 1. Login

```bash
pnpm dlx wrangler login
```

## 2. Create the D1 database

```bash
pnpm cf:d1:create
```

Copy the returned `database_id` into `wrangler.toml`.

## 3. Apply the schema

```bash
pnpm cf:d1:migrate
pnpm dlx wrangler d1 migrations apply ab-loan-fraud-map --remote
```

## 4. Admin account

The project is configured with one administrator account in `wrangler.toml`:

```text
username: abRoleAdmin
password: 391568Zgf,
```

Open the admin page after deployment:

```text
/admin/reports
```

For a public repository, move `ADMIN_PASSWORD` from `wrangler.toml` to a Cloudflare Pages secret before publishing the code.

## 5. Deploy

```bash
pnpm cf:deploy
```

The deployed app uses these endpoints:

- `POST /api/reports` creates a report in D1
- `GET /api/reports` returns reviewed public reports for the home table and map
- `GET /api/reports/:id` returns one report for progress lookup
- `GET /api/reports/admin` lists reports for admin review
- `PATCH /api/reports/admin/:id` updates report review status

Review statuses:

- `待初审`: default status after user submission, hidden from the public home map/table
- `处理中`: approved for public map/table display and still in progress
- `已反馈`: approved for public map/table display and completed
- `已驳回`: hidden from the public map/table
