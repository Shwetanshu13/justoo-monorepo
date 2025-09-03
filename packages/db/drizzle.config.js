import 'dotenv/config'

/** @type {import('drizzle-kit').Config} */
export default {
    schema: ['./schemas/*.js'],
    out: './drizzle',
    dialect: 'postgresql',
    dbCredentials: {
        url: process.env.DATABASE_URL || process.env.DB_SQL_URL || ''
    },
    verbose: true,
    strict: true
}
