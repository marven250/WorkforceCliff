import path from "node:path";
import { config as loadEnv } from "dotenv";

loadEnv({ path: path.resolve(process.cwd(), ".env") });
loadEnv({ path: path.resolve(process.cwd(), "..", ".env") });

import express, { Express } from "express";
import cors, { type CorsOptions } from "cors";
import helmet from "helmet";
import { db, databaseReady } from "./db-setup";
import { buildCorsOptions } from "./middleware/cors";
import { apiLimiter } from "./middleware/rateLimiter";
import authRoutes from "./routes/authRoutes";
import inquiryRoutes from "./routes/inquiryRoutes";
import adminRoutes from "./routes/adminRoutes";
import portalRoutes from "./routes/portalRoutes";

const app: Express = express();
const port = Number(process.env.PORT) || 3001;
const clientDist = path.resolve(__dirname, "..",  "client", "dist");

if (process.env.TRUST_PROXY === "1") {
  app.set("trust proxy", 1);
}

app.disable("x-powered-by");

app.use(
  helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" },
  }),
);

app.use(express.json({ limit: "200kb" }));

let corsOptions: CorsOptions;
try {
  corsOptions = buildCorsOptions();
} catch (err) {
  console.error("CORS configuration failed:", err);
  process.exit(1);
}
app.use(cors(corsOptions));
app.use(apiLimiter);

app.use("/api/auth", authRoutes);
app.use("/api/inquiries", inquiryRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/portal", portalRoutes);

// Serve the built SPA (Vite output) and support deep-link refreshes.
app.use(express.static(clientDist));
app.get("*", (req, res, next) => {
  if (req.method !== "GET") return next();
  if (req.path.startsWith("/api/")) return next();
  // If this looks like a static asset request, let static middleware handle (or 404).
  if (req.path.includes(".")) return next();
  res.sendFile(path.join(clientDist, "index.html"));
});

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
