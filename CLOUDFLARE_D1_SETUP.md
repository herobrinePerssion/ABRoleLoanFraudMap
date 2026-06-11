# Cloudflare D1 persistence setup

This project now submits reports to `/api/reports` first, backed by Cloudflare D1.
Uploaded evidence files are stored in a private Cloudflare R2 bucket.
If the API is unavailable during local Vite development, the app falls back to `localStorage`.

## 1. Login

```bash
pnpm dlx wrangler login
```

## 2. Create the D1 database

```bash
pnpm cf:d1:create
```

Copy the returned `database_id` into `wrangler.toml`:

```toml
[[d1_databases]]
binding = "DB"
database_name = "ab-loan-fraud-map"
database_id = "your-database-id"
migrations_dir = "migrations"
```

## 3. Apply the schema

```bash
pnpm cf:d1:migrate
```

## 4. Create the R2 bucket

```bash
pnpm cf:r2:create
```

`wrangler.toml` already contains the required binding:

```toml
[[r2_buckets]]
binding = "REPORT_FILES"
bucket_name = "ab-loan-fraud-report-files"
```

## 5. Deploy

```bash
pnpm cf:deploy
```

## 6. Configure the admin token

Set a Cloudflare Pages environment variable or secret named `ADMIN_TOKEN`.
Use a long random value, then open this page after deployment:

```text
/admin/reports
```

The admin page stores the token only in the browser `localStorage` and sends it as a Bearer token to the API.

The deployed app will use these endpoints:

- `POST /api/reports` creates a report in D1
- `GET /api/reports` returns reviewed public reports for the home table and map
- `GET /api/reports/:id` returns one report for progress lookup
- `POST /api/reports/:id/files` uploads evidence files to R2 and saves metadata in D1
- `GET /api/reports/:id/files/:fileId` streams one private R2 file through the API
- `GET /api/reports/admin` lists reports for admin review and requires `ADMIN_TOKEN`
- `PATCH /api/reports/admin/:id` updates report review status and requires `ADMIN_TOKEN`

Review statuses:

- `待初审`: default status after user submission, not public on the home map/table
- `处理中`: approved for public map/table display and still in progress
- `已反馈`: approved for public map/table display and completed
- `已驳回`: hidden from the public map/table

File upload limits in the function:

- Max 6 files per report
- Max 10 MB per file
- Allowed types: JPG, PNG, WebP, GIF, PDF
