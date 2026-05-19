import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import dotenv from "dotenv";

dotenv.config();

async function startServer() {
  const app = express();
  const PORT = 3000;

  // API routes
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok" });
  });

  // Proxy for exchange rates to avoid CORS and potentially use an API key
  app.get("/api/exchange-rates/:base", async (req, res) => {
    try {
      const { base } = req.params;
      // Using open.er-api.com as it's free and public
      const response = await fetch(`https://open.er-api.com/v6/latest/${base.toUpperCase()}`);
      const data = await response.json();
      res.json(data);
    } catch (error) {
      console.error("Exchange rate error:", error);
      res.status(500).json({ error: "Failed to fetch exchange rates" });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
