import express, { Request, Response } from "express";
import cors from "cors";
import { AuthRoutes } from "./app/modules/auth/auth.route.js";
import { globalErrorHandler } from "./app/middleware/globalErrorHandler.js";
import { notFound } from "./app/middleware/notFound.js";
import cookieParser from "cookie-parser";

const app = express();

app.use(cors());
app.use(express.json());
app.use(cookieParser());


// modules route
app.use("/api/auth", AuthRoutes);

app.get("/", (_req: Request, res: Response) => {
    res.status(200).json({
        success: true,
        message: "Load Shedding Management System API is running",
    });
});

app.use(globalErrorHandler);
app.use(notFound);

export default app;