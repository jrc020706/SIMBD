import express from "express";
import { runMigration } from "../services/migrationService.js";

const router = express.Router();

router.get("/migrate", async (req, res) => {
  try {
    const data = await runMigration();
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;