import dotenv from 'dotenv';

dotenv.config();

export const conf = {
    dbUrl: process.env.DB_SQL_URL
}