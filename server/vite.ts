import express, { type Express } from "express";
import fs from "fs";
import path from "path";
import { createServer as createViteServer, createLogger } from "vite";
import { type Server } from "http";
import viteConfig from "../vite.config";
import { nanoid } from "nanoid";

const viteLogger = createLogger();

export function log(message: string, source = "express") {
  const formattedTime = new Date().toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
  });

  console.log(`${formattedTime} [${source}] ${message}`);
}

export async function setupVite(app: Express, server: Server) {
  console.log("Setting up Vite development server...");
  
  const serverOptions = {
    middlewareMode: true,
    hmr: { 
      server,
      port: 3000,
      protocol: 'ws',
      host: 'localhost',
      clientPort: 3000
    },
    allowedHosts: ['localhost', '127.0.0.1'],
  };

  try {
    console.log("Creating Vite server with options:", JSON.stringify(serverOptions, null, 2));
    
    const vite = await createViteServer({
      ...viteConfig,
      configFile: false,
      customLogger: {
        ...viteLogger,
        error: (msg, options) => {
          viteLogger.error(msg, options);
          process.exit(1);
        },
      },
      server: serverOptions,
      appType: "custom",
    });

    console.log("Vite server created successfully");
    
    // Add Vite middleware
    app.use(vite.middlewares);
    console.log("Vite middleware added to Express");

    // Handle all routes
    app.use("*", async (req, res, next) => {
      const url = req.originalUrl;
      console.log(`Handling request for: ${url}`);

      try {
        const clientTemplate = path.resolve(
          import.meta.dirname,
          "..",
          "client",
          "index.html",
        );

        console.log("Reading template from:", clientTemplate);
        let template = await fs.promises.readFile(clientTemplate, "utf-8");
        template = template.replace(
          `src="/src/main.tsx"`,
          `src="/src/main.tsx?v=${nanoid()}"`,
        );
        
        console.log("Transforming index.html");
        const page = await vite.transformIndexHtml(url, template);
        res.status(200).set({ "Content-Type": "text/html" }).end(page);
      } catch (e) {
        console.error("Error handling request:", e);
        vite.ssrFixStacktrace(e as Error);
        next(e);
      }
    });
    
    console.log("Vite setup complete");
  } catch (error) {
    console.error("Failed to setup Vite:", error);
    throw error;
  }
}

export function serveStatic(app: Express) {
  const distPath = path.resolve(import.meta.dirname, "public");

  if (!fs.existsSync(distPath)) {
    throw new Error(
      `Could not find the build directory: ${distPath}, make sure to build the client first`,
    );
  }

  app.use(express.static(distPath));

  // fall through to index.html if the file doesn't exist
  app.use("*", (_req, res) => {
    res.sendFile(path.resolve(distPath, "index.html"));
  });
}
