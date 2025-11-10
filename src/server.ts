import "./config/env.js"; // Load environment variables first
import config from "./config/env.js";
import app from "./app.js";
import { testConnection } from "./config/index.js";

const PORT = config.port;

/**
 * Start server
 */
const startServer = async (): Promise<void> => {
    try {
        // Test database connection
        const isConnected = await testConnection();

        if (!isConnected) {
            console.error("Failed to connect to database. Please check your configuration.");
            process.exit(1);
        }

        // Start listening
        app.listen(PORT, () => {
            console.log(`✓ Server is running on port ${PORT}`);
            console.log(`✓ Environment: ${config.env}`);
            console.log(`✓ API endpoints available at http://localhost:${PORT}/api`);
        });
    } catch (error) {
        console.error("Failed to start server:", error);
        process.exit(1);
    }
};

startServer();
