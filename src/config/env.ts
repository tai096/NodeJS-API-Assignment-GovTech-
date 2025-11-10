import dotenv from "dotenv";
import { fileURLToPath } from "url";
import { dirname, resolve } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

/**
 * Environment configuration interface
 */
export interface Config {
    env: string;
    port: number;
    database: {
        host: string;
        port: number;
        name: string;
        username: string;
        password: string;
    };
}

/**
 * Load environment variables based on NODE_ENV
 * This should be imported first before any other modules
 */
const loadEnv = (): void => {
    const env = process.env.NODE_ENV || "development";

    let envFile: string;
    switch (env) {
        case "test":
            envFile = ".env.test";
            break;
        case "production":
            envFile = ".env.production";
            break;
        case "development":
        default:
            envFile = ".env";
            break;
    }

    const envPath = resolve(__dirname, "../../", envFile);
    dotenv.config({ path: envPath });

    console.log(`✓ Loaded environment: ${env} from ${envFile}`);
};

// Load env immediately when this module is imported
loadEnv();

/**
 * Centralized configuration
 */
const config: Config = {
    env: process.env.NODE_ENV || "development",
    port: parseInt(process.env.PORT || "5001", 10),
    database: {
        host: process.env.DB_HOST || "localhost",
        port: parseInt(process.env.DB_PORT || "3306", 10),
        name: process.env.DB_NAME || "teacher_student_db",
        username: process.env.DB_USER || "root",
        password: process.env.DB_PASSWORD || "",
    },
};

export default config;
