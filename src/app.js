import express from "express";
import simRoutes from "./routes/simRoutes.js";

const app = express();

app.use(express.json());

app.use("/api", simRoutes);

export default app;