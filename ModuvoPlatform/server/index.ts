import express, { type Request, Response, NextFunction } from "express";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import cors from "cors";
import compression from "compression";
import cookieParser from "cookie-parser";
import path from "path";
import { fileURLToPath } from "url";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";
import { createEmailTransporter } from "./email";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

app.set('trust proxy', 1);
app.use(helmet({ contentSecurityPolicy:false, crossOriginResourcePolicy:{ policy:"cross-origin" } }));
app.use(cors({ origin:(process.env.CORS_ORIGIN??"").split(","), credentials:true }));
app.use(compression());
app.use(cookieParser());
app.use(rateLimit({ 
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000'), 
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '600') 
}));

const clientDir = path.resolve(__dirname, "../../client/dist");
app.use(express.static(clientDir));

app.get("/healthz", (_req,res) => res.status(200).send("ok"));
app.get("/api/health", (_req,res) => res.status(200).json({status:"ok"}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: false, limit: '10mb' }));

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

  // Initialize email transporter on startup
  if (process.env.NODE_ENV === 'production') {
    try {
      await createEmailTransporter();
      log("Email system initialized successfully");
    } catch (error) {
      log(`Email system initialization failed: ${error}`);
    }
  }

  // Setup admin user if configured
  if (process.env.ADMIN_EMAIL && process.env.ADMIN_PASSWORD) {
    const { setupAdminFromEnv } = await import('./adminSetup');
    await setupAdminFromEnv();
  }

  // Seed database with initial data in development
  if (process.env.NODE_ENV === 'development') {
    const { seedDatabase } = await import('./seedData');
    try {
      await seedDatabase();
    } catch (error) {
      log(`Database seeding failed (likely already seeded): ${error}`);
    }
  }

app.get("*", (_req,res) => res.sendFile(path.join(clientDir, "index.html")));

  // ALWAYS serve the app on the port specified in the environment variable PORT
  // Other ports are firewalled. Default to 8080 if not specified.
  // this serves both the API and the client.
  // It is the only port that is not firewalled.
  const port = parseInt(process.env.PORT || '8000', 10);
  server.listen({
    port,
    host: "0.0.0.0",
    reusePort: true,
  }, () => {
    log(`serving on port ${port}`);
  });
})();
