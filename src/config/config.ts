import dotenv from 'dotenv';
dotenv.config({ path: __dirname + '/../../.env' });

export const config = {
    HOST: process.env['DB_HOST'],
    USER: process.env['DB_USER'],
    PASSWORD: process.env['DB_PASSWORD'],
    DB: process.env['DB_NAME'],
    PORT: parseInt(process.env['DB_PORT'] ?? '5432'),
    pool: {
        max: 5,
        min: 0,
        acquire: 30000,
        idle: 10000
    },
};

export const dialect = "postgres";
