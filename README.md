# HC Birthdays

A birthday tracking app for Hack Club members. Log in with Slack, add your birthday, and see upcoming birthdays in the community!

## Features

- Sign in with Hack Club Slack (only HC members can use the app)
- Add your birthday (month, day, and optionally year)
- Add your personal Slack channel so people can wish you happy birthday
- See upcoming birthdays from the community
- Special highlight for today's birthdays

## Tech Stack

- **Astro** - Server-side rendered with Node adapter
- **Tailwind CSS** - Styling
- **PostgreSQL** - Database

## Setup

### Prerequisites

- Node.js 20+
- PostgreSQL database
- Slack app credentials (for Hack Club workspace)

### Environment Variables

Copy `.env.example` to `.env` and fill in the values:

```bash
DATABASE_URL=postgresql://user:password@localhost:5432/hc_birthdays
SLACK_CLIENT_ID=your_slack_client_id
SLACK_CLIENT_SECRET=your_slack_client_secret
BASE_URL=http://localhost:4321
SESSION_SECRET=your-random-session-secret-at-least-32-chars
```

### Slack App Setup

1. Create a Slack app at https://api.slack.com/apps
2. Add OAuth redirect URL: `{BASE_URL}/api/auth/callback`
3. Add scopes: `identity.basic`, `identity.avatar`
4. Install to the Hack Club workspace
5. Copy Client ID and Client Secret to your `.env`

### Development

```bash
npm install
npm run dev
```

### Production (Docker)

```bash
docker-compose up -d
```

Or build and run manually:

```bash
docker build -t hc-birthdays .
docker run -p 4321:4321 --env-file .env hc-birthdays
```

## License

MIT
