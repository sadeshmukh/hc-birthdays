import pg from "pg";

const pool = new pg.Pool({
	connectionString: import.meta.env.DATABASE_URL,
});

export async function initDb() {
	await pool.query(`
    CREATE TABLE IF NOT EXISTS users (
      id SERIAL PRIMARY KEY,
      slack_id TEXT UNIQUE NOT NULL,
      slack_username TEXT NOT NULL,
      avatar_url TEXT,
      birthday_month INTEGER CHECK (birthday_month >= 1 AND birthday_month <= 12),
      birthday_day INTEGER CHECK (birthday_day >= 1 AND birthday_day <= 31),
      birth_year INTEGER,
      slack_channel TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);
	await pool.query(
		`ALTER TABLE users ADD COLUMN IF NOT EXISTS slack_channel_name TEXT`,
	);
	await pool.query(
		`ALTER TABLE users ADD COLUMN IF NOT EXISTS slack_channel_is_private BOOLEAN DEFAULT FALSE`,
	);
}

export interface User {
	id: number;
	slack_id: string;
	slack_username: string;
	avatar_url: string | null;
	birthday_month: number | null;
	birthday_day: number | null;
	birth_year: number | null;
	slack_channel: string | null;
	slack_channel_name: string | null;
	slack_channel_is_private: boolean | null;
	created_at: Date;
	updated_at: Date;
}

export async function upsertUser(
	slackId: string,
	slackUsername: string,
	avatarUrl: string | null,
): Promise<User> {
	const result = await pool.query(
		`INSERT INTO users (slack_id, slack_username, avatar_url)
     VALUES ($1, $2, $3)
     ON CONFLICT (slack_id) DO UPDATE SET
       slack_username = EXCLUDED.slack_username,
       avatar_url = EXCLUDED.avatar_url,
       updated_at = CURRENT_TIMESTAMP
     RETURNING *`,
		[slackId, slackUsername, avatarUrl],
	);
	return result.rows[0];
}

export async function getUserBySlackId(slackId: string): Promise<User | null> {
	const result = await pool.query("SELECT * FROM users WHERE slack_id = $1", [
		slackId,
	]);
	return result.rows[0] || null;
}

export async function updateBirthday(
	slackId: string,
	month: number,
	day: number,
	year: number | null,
	channel: string | null,
	channelName: string | null,
	channelIsPrivate: boolean,
): Promise<User> {
	const result = await pool.query(
		`UPDATE users SET
       birthday_month = $2,
       birthday_day = $3,
       birth_year = $4,
       slack_channel = $5,
       slack_channel_name = $6,
       slack_channel_is_private = $7,
       updated_at = CURRENT_TIMESTAMP
     WHERE slack_id = $1
     RETURNING *`,
		[slackId, month, day, year, channel, channelName, channelIsPrivate],
	);
	return result.rows[0];
}

export async function getTodaysBirthdays(date = new Date()): Promise<User[]> {
	const result = await pool.query(
		"SELECT * FROM users WHERE birthday_month = $1 AND birthday_day = $2",
		[date.getMonth() + 1, date.getDate()],
	);
	return result.rows;
}

export async function getAllBirthdays(): Promise<User[]> {
	const result = await pool.query(
		"SELECT * FROM users WHERE birthday_month IS NOT NULL AND birthday_day IS NOT NULL ORDER BY birthday_month, birthday_day",
	);
	return result.rows;
}

export async function getUpcomingBirthdays(
	limit = 20,
	date = new Date(),
): Promise<User[]> {
	const result = await pool.query(
		`SELECT * FROM users
     WHERE birthday_month IS NOT NULL AND birthday_day IS NOT NULL
     ORDER BY
       CASE
         WHEN (birthday_month, birthday_day) > ($2, $3)
         THEN 0
         ELSE 1
       END,
       birthday_month,
       birthday_day
     LIMIT $1`,
		[limit, date.getMonth() + 1, date.getDate()],
	);
	return result.rows;
}

export { pool };
