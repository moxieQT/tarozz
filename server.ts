import express from "express";
import path from "path";
import cors from "cors";
import compression from "compression";

const app = express();
const PORT = 3000;

// Gzip/deflate every response — biggest real-world transfer win for the
// large JS/CSS assets (e.g. three.js, html2pdf) served in production.
app.use(compression());
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

    // Hashed asset filenames are content-addressed → cache them aggressively.
    // index.html stays uncached so new deploys are picked up immediately.
    const staticOptions: Parameters<typeof express.static>[1] = {
      maxAge: "1y",
      immutable: true,
      index: false,
      setHeaders: (res, filePath) => {
        if (filePath.endsWith("index.html")) {
          res.setHeader("Cache-Control", "no-cache");
        }
      },
    };

    // Serve static files from dist
    app.use(express.static(distPath, staticOptions));
    app.use(express.static(distClientPath, staticOptions)); // Fallback if Vite outputs to dist/client

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
