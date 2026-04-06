import express from "express";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import routes from "./routes/index.js";

const app = express();

// ─── Security Headers (Helmet) ──────────────────────────────────
// Adds X-Content-Type-Options, X-Frame-Options, Strict-Transport-Security, etc.
app.use(helmet());

// ─── CORS ────────────────────────────────────────────────────────
app.use(
  cors({
    origin: (origin, callback) => {
      const allowedOrigins = [
        process.env.CORS_ORIGIN || "http://localhost:5173",
        "http://localhost:5173",
        "http://localhost:5174",
      ];
      // Allow requests with no origin (mobile apps, curl, etc.)
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true, // Required for cookie-based auth
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

// ─── Rate Limiting ───────────────────────────────────────────────
// General API limiter: 100 requests per 15 minutes per IP
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,  // Return rate limit info in headers
  legacyHeaders: false,
  message: { error: "Too many requests, please try again later." },
});

// Strict limiter for auth routes: 20 requests per 15 minutes per IP
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Too many login attempts, please try again later." },
});

// ─── Body Parsers ────────────────────────────────────────────────
app.use(express.json({ limit: "1mb" }));  // Limit payload size
app.use(express.urlencoded({ extended: true, limit: "1mb" }));

// ─── Health Check ────────────────────────────────────────────────
app.get("/api/health", (_req, res) => {
  res.json({
    status: "ok",
    service: "noc-api",
    timestamp: new Date().toISOString(),
  });
});

// ─── Apply Rate Limiters ─────────────────────────────────────────
app.use("/api/auth", authLimiter);   // Stricter for login/register
app.use("/api", apiLimiter);         // General for all API routes

// ─── Mount API Routes ────────────────────────────────────────────
app.use("/api", routes);

export default app;
