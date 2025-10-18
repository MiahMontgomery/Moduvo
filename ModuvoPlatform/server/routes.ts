import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { requireAuth, requireAdmin, optionalAuth, type AuthenticatedRequest } from "./auth";
import { setupAuthRoutes } from "./authRoutes";
import { sendQuoteEmail } from "./email";
import { insertQuoteSchema, insertDesignSchema } from "@shared/schema";
import { z } from "zod";
import { ObjectStorageService, ObjectNotFoundError } from "./objectStorage";
import { calculateQuote } from "./pricing";

export async function registerRoutes(app: Express): Promise<Server> {
  // Setup authentication routes
  setupAuthRoutes(app);

  // Product routes (public)
  app.get('/api/products', async (req, res) => {
    try {
      const products = await storage.getProducts();
      res.json(products);
    } catch (error) {
      console.error("Error fetching products:", error);
      res.status(500).json({ message: "Failed to fetch products" });
    }
  });

  app.get('/api/components', async (req, res) => {
    try {
      const components = await storage.getComponents();
      res.json(components);
    } catch (error) {
      console.error("Error fetching components:", error);
      res.status(500).json({ message: "Failed to fetch components" });
    }
  });

  app.get('/api/finishes', async (req, res) => {
    try {
      const finishes = await storage.getFinishes();
      res.json(finishes);
    } catch (error) {
      console.error("Error fetching finishes:", error);
      res.status(500).json({ message: "Failed to fetch finishes" });
    }
  });

  // Quote calculation (public)
  app.post('/api/quote/calculate', async (req, res) => {
    try {
      const { configuration, location } = req.body;
      const quote = calculateQuote(configuration, location);
      res.json(quote);
    } catch (error) {
      console.error("Error calculating quote:", error);
      res.status(500).json({ message: "Failed to calculate quote" });
    }
  });

  // Create and send quote (public - collects customer info)
  app.post('/api/quotes', async (req, res) => {
    try {
      const validatedData = insertQuoteSchema.parse(req.body);
      const { configuration, location } = req.body;
      
      const pricing = calculateQuote(configuration, validatedData.installationAddress || undefined);
      
      const quote = await storage.createQuote({
        ...validatedData,
        materialsPrice: pricing.materialsPrice,
        laborPrice: pricing.laborPrice,
        deliveryPrice: pricing.deliveryPrice,
        installationFee: pricing.installationFee,
        totalPrice: pricing.totalPrice,
        status: 'pending',
      });

      // Send quote email
      const emailHtml = `
        <h2>Your Moduvo Quote #${quote.id}</h2>
        <p>Dear ${validatedData.customerName},</p>
        <p>Thank you for your interest in our modular storage solutions. Here's your custom quote:</p>
        
        <div style="background: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3>Quote Details</h3>
          <p><strong>Materials:</strong> $${pricing.materialsPrice}</p>
          <p><strong>Labor (${pricing.laborHours}h):</strong> $${pricing.laborPrice}</p>
          <p><strong>Delivery:</strong> $${pricing.deliveryPrice}</p>
          ${parseFloat(pricing.installationFee) > 0 ? `<p><strong>Installation:</strong> $${pricing.installationFee}</p>` : ''}
          <hr>
          <p><strong>Total:</strong> $${pricing.totalPrice}</p>
        </div>
        
        <p>This quote is valid for 30 days. Our team will contact you within 24 hours to discuss next steps.</p>
        
        <p>Best regards,<br>The Moduvo Team</p>
      `;

      await sendQuoteEmail(
        validatedData.customerEmail,
        `Your Moduvo Quote #${quote.id}`,
        emailHtml
      );

      res.status(201).json({ 
        success: true, 
        quoteId: quote.id,
        message: "Quote created and sent successfully" 
      });
    } catch (error) {
      console.error("Error creating quote:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ 
          message: "Validation error", 
          errors: error.errors 
        });
      }
      res.status(500).json({ message: "Failed to create quote" });
    }
  });

  // Design routes (require authentication)
  app.get('/api/designs', requireAuth, async (req, res) => {
    try {
      const authReq = req as AuthenticatedRequest;
      const designs = await storage.getUserDesigns(authReq.user.userId);
      res.json(designs);
    } catch (error) {
      console.error("Error fetching designs:", error);
      res.status(500).json({ message: "Failed to fetch designs" });
    }
  });

  app.post('/api/designs', requireAuth, async (req, res) => {
    try {
      const authReq = req as AuthenticatedRequest;
      const validatedData = insertDesignSchema.parse({
        ...req.body,
        userId: authReq.user.userId,
      });
      
      const design = await storage.createDesign(validatedData);
      res.status(201).json(design);
    } catch (error) {
      console.error("Error creating design:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ 
          message: "Validation error", 
          errors: error.errors 
        });
      }
      res.status(500).json({ message: "Failed to create design" });
    }
  });

  app.put('/api/designs/:id', requireAuth, async (req, res) => {
    try {
      const authReq = req as AuthenticatedRequest;
      const design = await storage.getDesign(req.params.id);
      
      if (!design) {
        return res.status(404).json({ message: "Design not found" });
      }
      
      if (design.userId !== authReq.user.userId) {
        return res.status(403).json({ message: "Access denied" });
      }
      
      const updated = await storage.updateDesign(req.params.id, req.body);
      res.json(updated);
    } catch (error) {
      console.error("Error updating design:", error);
      res.status(500).json({ message: "Failed to update design" });
    }
  });

  app.delete('/api/designs/:id', requireAuth, async (req, res) => {
    try {
      const authReq = req as AuthenticatedRequest;
      const design = await storage.getDesign(req.params.id);
      
      if (!design) {
        return res.status(404).json({ message: "Design not found" });
      }
      
      if (design.userId !== authReq.user.userId) {
        return res.status(403).json({ message: "Access denied" });
      }
      
      const deleted = await storage.deleteDesign(req.params.id);
      res.json({ success: deleted });
    } catch (error) {
      console.error("Error deleting design:", error);
      res.status(500).json({ message: "Failed to delete design" });
    }
  });

  // User quotes (require authentication)
  app.get('/api/quotes', requireAuth, async (req, res) => {
    try {
      const authReq = req as AuthenticatedRequest;
      const quotes = await storage.getUserQuotes(authReq.user.userId);
      res.json(quotes);
    } catch (error) {
      console.error("Error fetching quotes:", error);
      res.status(500).json({ message: "Failed to fetch quotes" });
    }
  });

  // Admin routes (require admin role)
  app.get('/api/admin/quotes', requireAuth, requireAdmin, async (req, res) => {
    try {
      const quotes = await storage.getAllQuotes();
      res.json(quotes);
    } catch (error) {
      console.error("Error fetching admin quotes:", error);
      res.status(500).json({ message: "Failed to fetch quotes" });
    }
  });

  app.put('/api/admin/quotes/:id', requireAuth, requireAdmin, async (req, res) => {
    try {
      const updated = await storage.updateQuote(req.params.id, req.body);
      res.json(updated);
    } catch (error) {
      console.error("Error updating quote:", error);
      res.status(500).json({ message: "Failed to update quote" });
    }
  });

  app.get('/api/admin/designs', requireAuth, requireAdmin, async (req, res) => {
    try {
      const designs = await storage.getAllDesigns();
      res.json(designs);
    } catch (error) {
      console.error("Error fetching admin designs:", error);
      res.status(500).json({ message: "Failed to fetch designs" });
    }
  });

  // Object storage routes
  app.get("/objects/:objectPath(*)", optionalAuth, async (req, res) => {
    const objectStorageService = new ObjectStorageService();
    try {
      const objectFile = await objectStorageService.searchPublicObject(
        req.path.replace('/objects/', '')
      );
      if (!objectFile) {
        return res.sendStatus(404);
      }
      const authReq = req as AuthenticatedRequest;
      
      // For now, allow access to all objects - ACL can be added later
      const canAccess = true;
      
      objectStorageService.downloadObject(objectFile, res);
    } catch (error) {
      console.error("Error accessing object:", error);
      if (error instanceof ObjectNotFoundError) {
        return res.sendStatus(404);
      }
      return res.sendStatus(500);
    }
  });

  app.post("/api/objects/upload", requireAuth, async (req, res) => {
    const objectStorageService = new ObjectStorageService();
    // For now, return a placeholder - implement proper upload when GCS is configured
    const uploadURL = "https://example.com/upload-placeholder";
    res.json({ uploadURL });
  });

  // Public assets serving
  app.get("/public-objects/:filePath(*)", async (req, res) => {
    const filePath = req.params.filePath;
    const objectStorageService = new ObjectStorageService();
    try {
      const file = await objectStorageService.searchPublicObject(filePath);
      if (!file) {
        return res.status(404).json({ error: "File not found" });
      }
      objectStorageService.downloadObject(file, res);
    } catch (error) {
      console.error("Error searching for public object:", error);
      return res.status(500).json({ error: "Internal server error" });
    }
  });

  // Initialize default data if needed
  app.post('/api/init-data', async (req, res) => {
    try {
      const products = await storage.getProducts();
      if (products.length === 0) {
        await storage.createProduct({
          name: "Modular Wardrobe System",
          description: "Premium modular wardrobe with customizable components",
          category: "wardrobe",
          basePrice: "2499.00",
          modelUrl: "/public-objects/models/wardrobe.glb",
          imageUrl: "/public-objects/images/wardrobe-hero.jpg",
          isActive: true,
        });
        
        await storage.createComponent({
          name: "Hanging Rail",
          description: "Premium hanging rail for clothes",
          price: "89.00",
          category: "hanging_rail",
          isActive: true,
        });
        
        await storage.createComponent({
          name: "Drawer Set (3)",
          description: "Set of 3 premium drawers",
          price: "245.00",
          category: "drawer",
          isActive: true,
        });
        
        await storage.createFinish({
          name: "Pure White",
          color: "#FFFFFF",
          priceMultiplier: "1.00",
          isActive: true,
        });
        
        await storage.createFinish({
          name: "Oak Wood",
          color: "#D2B48C",
          priceMultiplier: "1.12",
          isActive: true,
        });
      }
      
      res.json({ success: true, message: "Default data initialized" });
    } catch (error) {
      console.error("Error initializing data:", error);
      res.status(500).json({ message: "Failed to initialize data" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}