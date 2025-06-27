const { DataSource } = require('typeorm');
const dotenv = require('dotenv');

dotenv.config();

const AppDataSource = new DataSource({
  type: 'postgres',
  host: process.env.PG_HOST || 'localhost',
  port: process.env.PG_PORT || 5432,
  username: process.env.PG_USER || 'elearning_user',
  password: process.env.PG_PASSWORD || 'elearning_password',
  database: process.env.PG_DATABASE || 'elearning_db',
  synchronize: true, // Automatically sync database schema (for development only)
  logging: true, // Enable logging for debugging
  entities: ['src/models/**/*.js'], // Path to your entity files
  migrations: ['src/migrations/**/*.js'],
  subscribers: ['src/subscribers/**/*.js'],
});

module.exports = AppDataSource;