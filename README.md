# Churn Constellation

A creative churn dashboard that visualizes projected revenue and month-over-month change by marketing director.

## Setup
1. Copy `.env.example` to `.env.local` and set `APP_PASSWORD`, `ADMIN_PASSWORD`, and `SESSION_SECRET`.
2. Install dependencies: `npm install`
3. Run the app: `npm run dev`

## Data
The CSV lives at `data/churn.csv`. Replace that file with the latest export from Google Sheets, set `SHEET_CSV_URL` in `.env.local` to a published CSV URL, or use the in-app upload page at `/upload` (admin only). Admins can view and open historical snapshots at `/history`.

## Notes
- The dashboard computes month-over-month change for each director and the company-wide totals.
- Negative values show as churn (red), positive values show as growth (green).
