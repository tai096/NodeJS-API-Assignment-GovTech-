import express, { Router, Request, Response } from "express";
import apiRoutes from "./api.js";

const router: Router = express.Router();

// Mount API routes
router.use("/api", apiRoutes);

// Health check endpoint
router.get("/health", (_req: Request, res: Response) => {
    res.status(200).json({
        status: "OK",
        message: "Teacher-Student Management API is running",
        timestamp: new Date().toISOString(),
    });
});

export default router;
