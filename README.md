# HC Birthdays

A birthday tracking app for Hack Club members. Sign in with Hack Club Auth, add your birthday, and see upcoming birthdays in the community.

## Features

- Sign in with Hack Club Auth (HCA)
- Add your birthday (month, day, and optionally year)
- Add your personal Slack channel so people can wish you happy birthday
- Calendar view of upcoming birthdays
- Special highlight for today's birthdays

## Tech Stack

- **Astro** — Server-side rendered with Node adapter
- **Tailwind CSS** — Styling
- **PostgreSQL** — Database

## Setup

### Prerequisites

- Node.js 20+ (or Bun)
- PostgreSQL database
- Hack Club Auth app credentials

### Environment Variables

Copy `.env.example` to `.env` and fill in the values:

```bash
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/hc_birthdays
HCA_CLIENT_ID=your_hca_client_id
HCA_CLIENT_SECRET=your_hca_client_secret
PUBLIC_BASE_URL=http://localhost:4321
SESSION_SECRET=your-random-session-secret-at-least-32-chars
```

### Hack Club Auth Setup

1. Enable developer mode and create an app at https://auth.hackclub.com
2. Add OAuth redirect URL: `{PUBLIC_BASE_URL}/api/auth/callback`
3. Required scope: `slack_id`
4. Copy Client ID and Client Secret to your `.env`

### Development

```bash
bun install
bun dev
```

### Production (Docker)

```bash
docker compose up -d
```

Or build and run manually:

```bash
docker build -t hc-birthdays .
docker run -p 4321:4321 --env-file .env hc-birthdays
```

## License

MIT
