import express, { Request, Response } from "express";
import cors from "cors";
import { AuthRoutes } from "./app/modules/auth/auth.route.js";
import { globalErrorHandler } from "./app/middleware/globalErrorHandler.js";
import { notFound } from "./app/middleware/notFound.js";
import cookieParser from "cookie-parser";
import { ZoneRoutes } from "./app/modules/zone/zone.route.js";
import { SubstationRoutes } from "./app/modules/substation/substation.route.js";
import { FeederRoutes } from "./app/modules/feeder/feeder.route.js";
import { AreaRoutes } from "./app/modules/area/area.route.js";
import { CustomerRoutes } from "./app/modules/customer/customer.route.js";
import { powerOperatorRoutes } from "./app/modules/powerOperator/powerOperator.route.js";
import { LoadSheddingRoutes } from "./app/modules/loadShedding/loadShedding.route.js";

const app = express();

app.use(cors());
app.use(express.json());
app.use(cookieParser());


// modules route
app.use("/api/auth", AuthRoutes);
app.use("/api/zones", ZoneRoutes);
app.use("/api/substations", SubstationRoutes);
app.use("/api/feeders", FeederRoutes);
app.use("/api/areas", AreaRoutes);
app.use("/api/customers", CustomerRoutes);
app.use("/api/power-operators", powerOperatorRoutes);
app.use("/api/load-shedding", LoadSheddingRoutes);

app.get("/", (_req: Request, res: Response) => {
    res.status(200).json({
        success: true,
        message: "Load Shedding Management System API is running",
    });
});

app.use(globalErrorHandler);
app.use(notFound);

export default app;