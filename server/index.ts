import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";
import { db } from "./db";
import { seedDatabase } from "./seed";
import { users } from "@shared/schema";
import { sql } from "drizzle-orm";

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

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
    // Initialize database
    log("Initializing database...");

    // Try to query users but handle table not found error
    try {
      const result = await db.select({
        count: sql<number>`count(*)`
      }).from(users);
      
      const count = result[0]?.count || 0;
      
      // Force a database seed for development purposes
      if (count === 0) {
        log("Database tables exist but are empty, seeding with initial data...");
        await seedDatabase();
      } else {
        log(`Database already contains ${count} users, skipping seed...`);
      }
    } catch (err) {
      // If table doesn't exist, we need to create the tables
      if (err.message && err.message.includes("relation") && err.message.includes("does not exist")) {
        log("Database tables do not exist, running schema push...");
        // Run drizzle push via shell command
        const { exec } = require('child_process');
        await new Promise((resolve, reject) => {
          exec('npm run db:push', (error, stdout, stderr) => {
            if (error) {
              reject(error);
              return;
            }
            log(stdout);
            resolve(stdout);
          });
        });
        
        log("Schema pushed successfully, now seeding database...");
        await seedDatabase();
      } else {
        // Re-throw if it's a different error
        throw err;
      }
    }
    
    log("Database initialization complete!");
  } catch (error) {
    console.error("Database initialization error:", error);
  }
  
  const server = await registerRoutes(app);

  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";

    res.status(status).json({ message });
    throw err;
  });

  // importantly only setup vite in development and after
  // setting up all the other routes so the catch-all route
  // doesn't interfere with the other routes
  if (app.get("env") === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }

  // ALWAYS serve the app on port 5000
  // this serves both the API and the client.
  // It is the only port that is not firewalled.
  const port = 5000;
  server.listen({
    port,
    host: "0.0.0.0",
    reusePort: true,
  }, () => {
    log(`serving on port ${port}`);
  });
})();
