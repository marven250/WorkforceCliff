import path from "node:path";
import { config as loadEnv } from "dotenv";

loadEnv({ path: path.resolve(process.cwd(), ".env") });
loadEnv({ path: path.resolve(process.cwd(), "..", ".env") });

import express, { Express } from "express";
import cors from "cors";
import { db, databaseReady } from "./db-setup";
import { limiter } from "./middleware/rateLimiter";
import authRoutes from "./routes/authRoutes";
import inquiryRoutes from "./routes/inquiryRoutes";
import adminRoutes from "./routes/adminRoutes";
import portalRoutes from "./routes/portalRoutes";

const app: Express = express();
const port = 3001;

app.use(express.json());
app.use(cors());
app.use(limiter);

app.use("/api/auth", authRoutes);
app.use("/api/inquiries", inquiryRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/portal", portalRoutes);

process.on("exit", async () => {
  await db.close();
});

databaseReady
  .then(() => {
    app.listen(port, () => {
      console.info(`server running at http://localhost:${port}`);
    });
  })
  .catch((err) => {
    console.error("Database initialization failed:", err);
    process.exit(1);
  });
