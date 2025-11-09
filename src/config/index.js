import { Sequelize } from "sequelize";
import config from "./database.js";

const env = process.env.NODE_ENV || "development";
const dbConfig = config[env];

// Create database if it doesn't exist
const createDatabaseIfNotExists = async () => {
  const tempSequelize = new Sequelize({
    host: dbConfig.host,
    port: dbConfig.port,
    dialect: dbConfig.dialect,
    username: dbConfig.username,
    password: dbConfig.password,
    logging: false,
  });

  try {
    await tempSequelize.query(`CREATE DATABASE IF NOT EXISTS \`${dbConfig.database}\`;`);
    console.log(`✓ Database '${dbConfig.database}' is ready.`);
    await tempSequelize.close();
  } catch (error) {
    console.error("✗ Error creating database:", error.message);
    await tempSequelize.close();
  }
};

const sequelize = new Sequelize(dbConfig.database, dbConfig.username, dbConfig.password, {
  host: dbConfig.host,
  port: dbConfig.port,
  dialect: dbConfig.dialect,
  logging: dbConfig.logging,
  pool: dbConfig.pool,
});

// Test database connection
const testConnection = async () => {
  try {
    await createDatabaseIfNotExists();
    await sequelize.authenticate();
    console.log("✓ Database connection has been established successfully.");

    // Sync models to create tables if they don't exist
    await sequelize.sync();
    console.log("✓ Database tables have been synchronized.");

    return true;
  } catch (error) {
    console.error("✗ Unable to connect to the database:", error.message);
    return false;
  }
};

export { sequelize, testConnection, createDatabaseIfNotExists };
