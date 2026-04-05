import "dotenv/config";
import app from "./app.js";

const PORT = process.env.PORT || 3001;

app.listen(PORT, () => {
  console.log(`
  ╔══════════════════════════════════════════╗
  ║   🛰️  NOC Sentinel API Server            ║
  ║   Running on http://localhost:${PORT}       ║
  ║   Health: http://localhost:${PORT}/api/health ║
  ╚══════════════════════════════════════════╝
  `);
});
