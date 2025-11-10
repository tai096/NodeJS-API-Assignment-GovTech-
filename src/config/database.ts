import config from "./env.js";
import { Dialect } from "sequelize";

/**
 * Database configuration interface
 */
export interface DatabaseConfig {
    host: string;
    port: number;
    database: string;
    username: string;
    password: string;
    dialect: Dialect;
    logging: boolean | ((sql: string, timing?: number) => void);
    pool: {
        max: number;
        min: number;
        acquire: number;
        idle: number;
    };
}

/**
 * Database configurations for different environments
 */
export interface DatabaseConfigs {
    development: DatabaseConfig;
    test: DatabaseConfig;
    production: DatabaseConfig;
    [key: string]: DatabaseConfig;
}

/**
 * Database configuration for different environments
 */
const databaseConfig: DatabaseConfigs = {
    development: {
        host: config.database.host,
        port: config.database.port,
        database: config.database.name,
        username: config.database.username,
        password: config.database.password,
        dialect: "mysql" as Dialect,
        logging: false,
        pool: {
            max: 5,
            min: 0,
            acquire: 30000,
            idle: 10000,
        },
    },
    test: {
        host: config.database.host,
        port: config.database.port,
        database: config.database.name,
        username: config.database.username,
        password: config.database.password,
        dialect: "mysql" as Dialect,
        logging: false,
        pool: {
            max: 5,
            min: 0,
            acquire: 30000,
            idle: 10000,
        },
    },
    production: {
        host: config.database.host,
        port: config.database.port,
        database: config.database.name,
        username: config.database.username,
        password: config.database.password,
        dialect: "mysql" as Dialect,
        logging: false,
        pool: {
            max: 10,
            min: 2,
            acquire: 30000,
            idle: 10000,
        },
    },
};

export default databaseConfig;