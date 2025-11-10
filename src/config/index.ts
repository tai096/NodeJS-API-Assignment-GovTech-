import { Sequelize } from "sequelize";
import config, { DatabaseConfig } from "./database.js";

const env = process.env.NODE_ENV || "development";
const dbConfig: DatabaseConfig = config[env];

/**
 * Create database if it doesn't exist
 */
const createDatabaseIfNotExists = async (): Promise<void> => {
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
        const errorMessage = error instanceof Error ? error.message : String(error);
        console.error("✗ Error creating database:", errorMessage);
        await tempSequelize.close();
    }
};

/**
 * Sequelize instance
 */
const sequelize = new Sequelize(dbConfig.database, dbConfig.username, dbConfig.password, {
    host: dbConfig.host,
    port: dbConfig.port,
    dialect: dbConfig.dialect,
    logging: dbConfig.logging,
    pool: dbConfig.pool,
});

/**
 * Test database connection and sync models
 */
const testConnection = async (): Promise<boolean> => {
    try {
        await createDatabaseIfNotExists();
        await sequelize.authenticate();
        console.log("✓ Database connection has been established successfully.");

        // Sync models to create tables if they don't exist
        await sequelize.sync();
        console.log("✓ Database tables have been synchronized.");

        return true;
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        console.error("✗ Unable to connect to the database:", errorMessage);
        return false;
    }
};

export { sequelize, testConnection, createDatabaseIfNotExists };
