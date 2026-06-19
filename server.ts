import express from "express";
import path from "path";
import cors from "cors";

const app = express();
const PORT = 3000;

app.use(express.json());
app.use(cors());

// Health check
app.get("/api/health", (req, res) => {
  res.json({ status: "ok" });
});

async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    // Development mode
    const { createServer: createViteServer } = await import("vite");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    // Production mode
    const distPath = path.join(process.cwd(), "dist");
    const distClientPath = path.join(distPath, "client"); // Just in case, try standard dist first
    
    // Serve static files from dist
    app.use(express.static(distPath));
    app.use(express.static(distClientPath)); // Fallback if Vite outputs to dist/client
    
    app.get("*all", (req, res) => {
      // Return index.html for SPA routing
      res.sendFile(path.join(process.cwd(), "dist", "index.html"), (err) => {
        if (err) {
          res.sendFile(path.join(process.cwd(), "dist", "client", "index.html"));
        }
      });
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
