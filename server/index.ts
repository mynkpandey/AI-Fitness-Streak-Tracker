import 'dotenv/config'; // Load environment variables from .env file
import express, { type Request, Response, NextFunction } from "express";
import session from "express-session";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";
import { storage } from "./storage";

// Debug logging for environment variables
console.log("Environment Variables Check:");
console.log("GEMINI_API_KEY exists:", !!process.env.GEMINI_API_KEY);
console.log("MONGODB_URI exists:", !!process.env.MONGODB_URI);
console.log("NODE_ENV:", process.env.NODE_ENV || "not set");

// Create Express app
const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Set up session middleware
const isProduction = process.env.NODE_ENV === "production";
app.use(session({
  secret: process.env.SESSION_SECRET || "local-dev-secret",
  resave: false,
  saveUninitialized: false,
  store: storage.sessionStore,
  cookie: {
    secure: false, // Set to false in all environments for now to ensure cookies work
    maxAge: 1000 * 60 * 60 * 24 * 7, // 1 week
    httpOnly: true,
    sameSite: "lax", // Use lax to ensure cookies work across redirects
  },
  name: "fitstreak.sid" // Set a specific name for our session cookie
}));

app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }

      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "…";
      }

      log(logLine);
    }
  });

  next();
});

(async () => {
  try {
    console.log("Starting server initialization...");
    console.log("Environment:", process.env.NODE_ENV);
    console.log("MongoDB URI exists:", !!process.env.MONGODB_URI);
    
    // Wait for MongoDB connection before proceeding
    if (!process.env.MONGODB_URI) {
      throw new Error("MONGODB_URI environment variable is required");
    }

    // Initialize storage and wait for connection
    console.log("Initializing MongoDB connection...");
    try {
      await storage.waitForConnection();
      console.log("MongoDB connection verified");
    } catch (error) {
      console.error("Failed to verify MongoDB connection:", error);
      process.exit(1);
    }
    
    const server = await registerRoutes(app);
    console.log("Routes registered successfully");

    app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
      const status = err.status || err.statusCode || 500;
      const message = err.message || "Internal Server Error";
      console.error("Error:", err);
      res.status(status).json({ message });
    });

    console.log("Setting up Vite middleware...");
    if (app.get("env") === "development") {
      try {
        console.log("Starting Vite development server setup...");
        // Set NODE_ENV to development if not set
        process.env.NODE_ENV = 'development';
        await setupVite(app, server);
        console.log("Vite development server setup complete");
      } catch (error) {
        console.error("Failed to setup Vite development server:", error);
        process.exit(1);
      }
    } else {
      serveStatic(app);
      console.log("Static file serving setup complete");
    }

    const port = process.env.PORT ? parseInt(process.env.PORT) : 5000;
    console.log(`Starting server on port ${port}...`);
    
    // Function to find an available port
    const findAvailablePort = async (startPort: number): Promise<number> => {
      const net = await import('net');
      return new Promise((resolve) => {
        const server = net.createServer();
        server.unref();
        server.on('error', (err) => {
          console.log(`Port ${startPort} is in use, trying next port...`);
          // Try ports in a range of 5000-5100
          if (startPort < 5100) {
            resolve(findAvailablePort(startPort + 1));
          } else {
            console.error("No available ports found in range 5000-5100");
            process.exit(1);
          }
        });
        server.listen(startPort, () => {
          server.close(() => {
            resolve(startPort);
          });
        });
      });
    };

    try {
      console.log("Checking for available ports...");
      const availablePort = await findAvailablePort(port);
      console.log(`Found available port: ${availablePort}`);
      
      if (availablePort !== port) {
        console.log(`Port ${port} is in use, using port ${availablePort} instead`);
      }
      
      server.listen({
        port: availablePort,
        host: "0.0.0.0",
      }, () => {
        log(`Server is running on port ${availablePort}`);
        console.log(`You can access the application at: http://localhost:${availablePort}`);
        console.log(`Development server is running at: http://localhost:3000`);
      });
    } catch (error: any) {
      console.error("Failed to start server:", error);
      if (error.code === 'EADDRINUSE') {
        console.error(`Port ${port} is already in use. Please try one of these solutions:`);
        console.error('1. Wait a few minutes for the port to become available');
        console.error('2. Restart your computer');
        console.error('3. Use a different port by setting the PORT environment variable');
        console.error('4. Kill the process using the port with: taskkill /F /IM node.exe');
      }
      process.exit(1);
    }
  } catch (error) {
    console.error("Server startup error:", error);
    process.exit(1);
  }
})();
