import express, { Request, Response } from "express";
import cors from "cors";

const app = express();

app.use(cors());
app.use(express.json());

app.get("/", (_req: Request, res: Response) => {
    res.status(200).json({
        success: true,
        message: "Load Shedding Management System API is running",
    });
});

export default app;