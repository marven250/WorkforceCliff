"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const node_path_1 = __importDefault(require("node:path"));
const dotenv_1 = require("dotenv");
(0, dotenv_1.config)({ path: node_path_1.default.resolve(process.cwd(), ".env") });
(0, dotenv_1.config)({ path: node_path_1.default.resolve(process.cwd(), "..", ".env") });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const db_setup_1 = require("./db-setup");
const cors_2 = require("./middleware/cors");
const rateLimiter_1 = require("./middleware/rateLimiter");
const authRoutes_1 = __importDefault(require("./routes/authRoutes"));
const inquiryRoutes_1 = __importDefault(require("./routes/inquiryRoutes"));
const adminRoutes_1 = __importDefault(require("./routes/adminRoutes"));
const portalRoutes_1 = __importDefault(require("./routes/portalRoutes"));
const app = (0, express_1.default)();
const port = Number(process.env.PORT) || 3001;
const clientDist = node_path_1.default.resolve(process.cwd(), "..", "client", "dist");
if (process.env.TRUST_PROXY === "1") {
    app.set("trust proxy", 1);
}
app.disable("x-powered-by");
app.use((0, helmet_1.default)({
    crossOriginResourcePolicy: { policy: "cross-origin" },
}));
app.use(express_1.default.json({ limit: "200kb" }));
let corsOptions;
try {
    corsOptions = (0, cors_2.buildCorsOptions)();
}
catch (err) {
    console.error("CORS configuration failed:", err);
    process.exit(1);
}
app.use((0, cors_1.default)(corsOptions));
app.use(rateLimiter_1.apiLimiter);
app.use("/api/auth", authRoutes_1.default);
app.use("/api/inquiries", inquiryRoutes_1.default);
app.use("/api/admin", adminRoutes_1.default);
app.use("/api/portal", portalRoutes_1.default);
// Serve the built SPA (Vite output) and support deep-link refreshes.
app.use(express_1.default.static(clientDist));
app.get("*", (req, res, next) => {
    if (req.method !== "GET")
        return next();
    if (req.path.startsWith("/api/"))
        return next();
    // If this looks like a static asset request, let static middleware handle (or 404).
    if (req.path.includes("."))
        return next();
    res.sendFile(node_path_1.default.join(clientDist, "index.html"));
});
process.on("exit", () => __awaiter(void 0, void 0, void 0, function* () {
    yield db_setup_1.db.close();
}));
db_setup_1.databaseReady
    .then(() => {
    app.listen(port, () => {
        console.info(`server running at http://localhost:${port}`);
    });
})
    .catch((err) => {
    console.error("Database initialization failed:", err);
    process.exit(1);
});
