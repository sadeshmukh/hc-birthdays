# HC Birthdays

Birthday tracking for Hack Club members. Sign in with Hack Club Auth, set your birthday and optionally a Slack channel where people can find you, and see everyone's upcoming birthdays on a calendar.

Live at [bd.halceon.dev](https://bd.halceon.dev).

## Running locally

Copy `.env.example` to `.env` and fill in the values, then:

```bash
docker compose up -d
```

The app will be at `http://localhost:4321`.

## Environment variables

| Variable | Description |
|---|---|
| `DATABASE_URL` | Postgres connection string — use `@db:5432` when running via Docker Compose |
| `HCA_CLIENT_ID` | Hack Club Auth OAuth client ID |
| `HCA_CLIENT_SECRET` | Hack Club Auth OAuth client secret |
| `PUBLIC_BASE_URL` | Public base URL (e.g. `https://bd.halceon.dev`) |
| `SESSION_SECRET` | Random string, at least 32 chars |

To get HCA credentials: enable developer mode at [auth.hackclub.com](https://auth.hackclub.com), create an app, and set the redirect URL to `{PUBLIC_BASE_URL}/api/auth/callback` with scope `slack_id`.

## Stack

Astro (SSR) · Tailwind · PostgreSQL
