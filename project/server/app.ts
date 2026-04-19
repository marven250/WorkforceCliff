import express, { Express, Request, Response } from "express";
import cors from "cors";
import { getAllProviders } from "./providers";
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

app.get("/providers/:userId", async (req: Request, res: Response) => {
  const { userId } = req.params;
  const providers = await getAllProviders(userId);
  res.json(providers);
});

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
