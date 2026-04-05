import express from "express";
import cors from "cors";
import routes from "./routes/index.js";

const app = express();

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

// ─── Body Parsers ────────────────────────────────────────────────
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ─── Health Check ────────────────────────────────────────────────
app.get("/api/health", (_req, res) => {
  res.json({
    status: "ok",
    service: "noc-api",
    timestamp: new Date().toISOString(),
  });
});

// ─── Mount API Routes ────────────────────────────────────────────
app.use("/api", routes);

export default app;
