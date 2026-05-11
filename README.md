# HC Birthdays

Track birthdays of HCers! Uses Astro & Tailwind + stores in Postgres.

What does this one provide over other options? It's got a fancy shmancy channel search with private channel support, and will (soon) ping you on Slack if you want for reminders for birthdays!

Try it now: [bd.halceon.dev](https://bd.halceon.dev)

## Running locally

Copy `.env.example` to `.env` and fill in the values, then start the DB:

```bash
docker-compose up -d db
```

Start the app:

```bash
bun i && bun dev
```

Before making any commits, make sure to `bun format`!

## Environment variables

For the DB, you can use the default `postgresql://postgres:postgres@localhost:5432/hc_birthdays` if running with Docker, or set up another Postgres instance and update the URL accordingly.

HCA creds can be obtained with an app at auth.hackclub.com with the slack_id scope.
