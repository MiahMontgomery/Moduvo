var __defProp = Object.defineProperty;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __esm = (fn, res) => function __init() {
  return fn && (res = (0, fn[__getOwnPropNames(fn)[0]])(fn = 0)), res;
};
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};

// shared/schema.ts
var schema_exports = {};
__export(schema_exports, {
  components: () => components,
  designs: () => designs,
  designsRelations: () => designsRelations,
  finishes: () => finishes,
  insertComponentSchema: () => insertComponentSchema,
  insertDesignSchema: () => insertDesignSchema,
  insertFinishSchema: () => insertFinishSchema,
  insertProductSchema: () => insertProductSchema,
  insertQuoteSchema: () => insertQuoteSchema,
  insertUserSchema: () => insertUserSchema,
  products: () => products,
  productsRelations: () => productsRelations,
  quotes: () => quotes,
  quotesRelations: () => quotesRelations,
  sessions: () => sessions,
  settings: () => settings,
  users: () => users,
  usersRelations: () => usersRelations
});
import { sql } from "drizzle-orm";
import {
  index,
  jsonb,
  pgTable,
  timestamp,
  varchar,
  text,
  decimal,
  boolean,
  uuid
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { relations } from "drizzle-orm";
var sessions, users, products, components, finishes, designs, quotes, settings, usersRelations, productsRelations, designsRelations, quotesRelations, insertProductSchema, insertComponentSchema, insertFinishSchema, insertDesignSchema, insertUserSchema, insertQuoteSchema;
var init_schema = __esm({
  "shared/schema.ts"() {
    "use strict";
    sessions = pgTable(
      "sessions",
      {
        sid: varchar("sid").primaryKey(),
        sess: jsonb("sess").notNull(),
        expire: timestamp("expire").notNull()
      },
      (table) => [index("IDX_session_expire").on(table.expire)]
    );
    users = pgTable("users", {
      id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
      email: varchar("email").unique().notNull(),
      passwordHash: varchar("password_hash"),
      firstName: varchar("first_name"),
      lastName: varchar("last_name"),
      profileImageUrl: varchar("profile_image_url"),
      role: varchar("role", { length: 20 }).default("customer"),
      // customer, admin, staff
      isActive: boolean("is_active").default(true),
      lastLogin: timestamp("last_login"),
      createdAt: timestamp("created_at").defaultNow(),
      updatedAt: timestamp("updated_at").defaultNow()
    });
    products = pgTable("products", {
      id: uuid("id").primaryKey().defaultRandom(),
      name: varchar("name", { length: 255 }).notNull(),
      description: text("description"),
      category: varchar("category", { length: 100 }).notNull(),
      // wardrobe, bookshelf, storage_unit, custom
      basePrice: decimal("base_price", { precision: 10, scale: 2 }).notNull(),
      modelUrl: text("model_url"),
      // CDN URL for 3D model
      imageUrl: text("image_url"),
      isActive: boolean("is_active").default(true),
      createdAt: timestamp("created_at").defaultNow(),
      updatedAt: timestamp("updated_at").defaultNow()
    });
    components = pgTable("components", {
      id: uuid("id").primaryKey().defaultRandom(),
      name: varchar("name", { length: 255 }).notNull(),
      description: text("description"),
      price: decimal("price", { precision: 10, scale: 2 }).notNull(),
      category: varchar("category", { length: 100 }).notNull(),
      // hanging_rail, drawer, shelf, lighting, etc.
      modelUrl: text("model_url"),
      isActive: boolean("is_active").default(true),
      createdAt: timestamp("created_at").defaultNow()
    });
    finishes = pgTable("finishes", {
      id: uuid("id").primaryKey().defaultRandom(),
      name: varchar("name", { length: 100 }).notNull(),
      color: varchar("color", { length: 50 }).notNull(),
      priceMultiplier: decimal("price_multiplier", { precision: 4, scale: 2 }).default("1.00"),
      isActive: boolean("is_active").default(true)
    });
    designs = pgTable("designs", {
      id: uuid("id").primaryKey().defaultRandom(),
      userId: varchar("user_id").notNull().references(() => users.id),
      name: varchar("name", { length: 255 }).notNull(),
      productId: uuid("product_id").notNull().references(() => products.id),
      finishId: uuid("finish_id").notNull().references(() => finishes.id),
      dimensions: jsonb("dimensions"),
      // {width, height, depth}
      selectedComponents: jsonb("selected_components"),
      // array of component IDs
      configuration: jsonb("configuration"),
      // full config object
      previewImage: text("preview_image"),
      createdAt: timestamp("created_at").defaultNow(),
      updatedAt: timestamp("updated_at").defaultNow()
    });
    quotes = pgTable("quotes", {
      id: uuid("id").primaryKey().defaultRandom(),
      userId: varchar("user_id").references(() => users.id),
      designId: uuid("design_id").references(() => designs.id),
      customerEmail: varchar("customer_email", { length: 255 }).notNull(),
      customerName: varchar("customer_name", { length: 255 }),
      customerPhone: varchar("customer_phone", { length: 50 }),
      installationAddress: text("installation_address"),
      additionalNotes: text("additional_notes"),
      preferredContact: varchar("preferred_contact", { length: 20 }).default("email"),
      materialsPrice: decimal("materials_price", { precision: 10, scale: 2 }).notNull(),
      laborPrice: decimal("labor_price", { precision: 10, scale: 2 }).notNull(),
      deliveryPrice: decimal("delivery_price", { precision: 10, scale: 2 }).notNull(),
      installationFee: decimal("installation_fee", { precision: 10, scale: 2 }).default("0.00"),
      totalPrice: decimal("total_price", { precision: 10, scale: 2 }).notNull(),
      status: varchar("status", { length: 50 }).default("pending"),
      // pending, sent, approved, rejected
      sentAt: timestamp("sent_at"),
      // AR/Visualization tracking
      arSessionCompleted: boolean("ar_session_completed").default(false),
      placementTimestamp: timestamp("placement_timestamp"),
      modelType: varchar("model_type", { length: 100 }),
      // geometric, gltf, custom
      emailCapturedAfterAR: boolean("email_captured_after_ar").default(false),
      leadSource: varchar("lead_source", { length: 50 }).default("ar_visualization"),
      // ar_visualization, direct_quote, etc.
      createdAt: timestamp("created_at").defaultNow(),
      updatedAt: timestamp("updated_at").defaultNow()
    });
    settings = pgTable("settings", {
      key: varchar("key", { length: 100 }).primaryKey(),
      value: jsonb("value").notNull(),
      description: text("description"),
      updatedAt: timestamp("updated_at").defaultNow()
    });
    usersRelations = relations(users, ({ many }) => ({
      designs: many(designs),
      quotes: many(quotes)
    }));
    productsRelations = relations(products, ({ many }) => ({
      designs: many(designs)
    }));
    designsRelations = relations(designs, ({ one, many }) => ({
      user: one(users, {
        fields: [designs.userId],
        references: [users.id]
      }),
      product: one(products, {
        fields: [designs.productId],
        references: [products.id]
      }),
      finish: one(finishes, {
        fields: [designs.finishId],
        references: [finishes.id]
      }),
      quotes: many(quotes)
    }));
    quotesRelations = relations(quotes, ({ one }) => ({
      user: one(users, {
        fields: [quotes.userId],
        references: [users.id]
      }),
      design: one(designs, {
        fields: [quotes.designId],
        references: [designs.id]
      })
    }));
    insertProductSchema = createInsertSchema(products).omit({
      id: true,
      createdAt: true,
      updatedAt: true
    });
    insertComponentSchema = createInsertSchema(components).omit({
      id: true,
      createdAt: true
    });
    insertFinishSchema = createInsertSchema(finishes).omit({
      id: true
    });
    insertDesignSchema = createInsertSchema(designs).omit({
      id: true,
      createdAt: true,
      updatedAt: true
    });
    insertUserSchema = createInsertSchema(users).omit({
      id: true,
      createdAt: true,
      updatedAt: true,
      lastLogin: true
    });
    insertQuoteSchema = createInsertSchema(quotes).omit({
      id: true,
      createdAt: true,
      updatedAt: true
    }).extend({
      customerEmail: z.string().email("Please enter a valid email address"),
      customerName: z.string().min(2, "Name must be at least 2 characters"),
      customerPhone: z.string().regex(/^[\+]?[1-9][\d]{0,15}$/, "Please enter a valid phone number").optional(),
      installationAddress: z.string().min(10, "Please provide a complete address")
    });
  }
});

// server/db.ts
import { Pool, neonConfig } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-serverless";
import ws from "ws";
var pool, db;
var init_db = __esm({
  "server/db.ts"() {
    "use strict";
    init_schema();
    neonConfig.webSocketConstructor = ws;
    if (!process.env.DATABASE_URL) {
      throw new Error(
        "DATABASE_URL must be set. Did you forget to provision a database?"
      );
    }
    pool = new Pool({ connectionString: process.env.DATABASE_URL });
    db = drizzle({ client: pool, schema: schema_exports });
  }
});

// server/storage.ts
import { eq, desc } from "drizzle-orm";
var DatabaseStorage, storage;
var init_storage = __esm({
  "server/storage.ts"() {
    "use strict";
    init_schema();
    init_db();
    DatabaseStorage = class {
      // User operations
      async getUser(id) {
        const [user] = await db.select().from(users).where(eq(users.id, id));
        return user;
      }
      async getUserByEmail(email) {
        const [user] = await db.select().from(users).where(eq(users.email, email));
        return user;
      }
      async createUser(userData) {
        const [user] = await db.insert(users).values({
          ...userData,
          createdAt: /* @__PURE__ */ new Date(),
          updatedAt: /* @__PURE__ */ new Date()
        }).returning();
        return user;
      }
      async updateUser(id, updates) {
        const [user] = await db.update(users).set({
          ...updates,
          updatedAt: /* @__PURE__ */ new Date()
        }).where(eq(users.id, id)).returning();
        return user;
      }
      // Product operations
      async getProducts() {
        return await db.select().from(products).where(eq(products.isActive, true));
      }
      async getProduct(id) {
        const [product] = await db.select().from(products).where(eq(products.id, id));
        return product;
      }
      async createProduct(product) {
        const [created] = await db.insert(products).values(product).returning();
        return created;
      }
      async updateProduct(id, product) {
        const [updated] = await db.update(products).set({ ...product, updatedAt: /* @__PURE__ */ new Date() }).where(eq(products.id, id)).returning();
        return updated;
      }
      // Component operations
      async getComponents() {
        return await db.select().from(components).where(eq(components.isActive, true));
      }
      async getComponent(id) {
        const [component] = await db.select().from(components).where(eq(components.id, id));
        return component;
      }
      async createComponent(component) {
        const [created] = await db.insert(components).values(component).returning();
        return created;
      }
      // Finish operations
      async getFinishes() {
        return await db.select().from(finishes).where(eq(finishes.isActive, true));
      }
      async getFinish(id) {
        const [finish] = await db.select().from(finishes).where(eq(finishes.id, id));
        return finish;
      }
      async createFinish(finish) {
        const [created] = await db.insert(finishes).values(finish).returning();
        return created;
      }
      // Design operations
      async getUserDesigns(userId) {
        return await db.select().from(designs).where(eq(designs.userId, userId)).orderBy(desc(designs.updatedAt));
      }
      async getDesign(id) {
        const [design] = await db.select().from(designs).where(eq(designs.id, id));
        return design;
      }
      async createDesign(design) {
        const [created] = await db.insert(designs).values(design).returning();
        return created;
      }
      async updateDesign(id, design) {
        const [updated] = await db.update(designs).set({ ...design, updatedAt: /* @__PURE__ */ new Date() }).where(eq(designs.id, id)).returning();
        return updated;
      }
      async deleteDesign(id) {
        const result = await db.delete(designs).where(eq(designs.id, id));
        return true;
      }
      async getAllDesigns() {
        return await db.select().from(designs).orderBy(desc(designs.updatedAt));
      }
      // Quote operations
      async getUserQuotes(userId) {
        return await db.select().from(quotes).where(eq(quotes.userId, userId)).orderBy(desc(quotes.createdAt));
      }
      async getAllQuotes() {
        return await db.select().from(quotes).orderBy(desc(quotes.createdAt));
      }
      async getQuote(id) {
        const [quote] = await db.select().from(quotes).where(eq(quotes.id, id));
        return quote;
      }
      async createQuote(quote) {
        const [created] = await db.insert(quotes).values(quote).returning();
        return created;
      }
      async updateQuote(id, quote) {
        const [updated] = await db.update(quotes).set({ ...quote, updatedAt: /* @__PURE__ */ new Date() }).where(eq(quotes.id, id)).returning();
        return updated;
      }
      // Settings operations
      async getSetting(key) {
        const [setting] = await db.select().from(settings).where(eq(settings.key, key));
        return setting?.value;
      }
      async setSetting(key, value, description) {
        await db.insert(settings).values({ key, value, description }).onConflictDoUpdate({
          target: settings.key,
          set: { value, description, updatedAt: /* @__PURE__ */ new Date() }
        });
      }
    };
    storage = new DatabaseStorage();
  }
});

// server/auth.ts
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
function generateToken(payload) {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error("JWT_SECRET is required");
  }
  return jwt.sign(payload, secret, {
    expiresIn: "7d",
    issuer: "moduvo-platform"
  });
}
function verifyToken(token) {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error("JWT_SECRET is required");
  }
  return jwt.verify(token, secret);
}
async function hashPassword(password) {
  return bcrypt.hash(password, 12);
}
async function comparePassword(password, hash) {
  return bcrypt.compare(password, hash);
}
function extractToken(req) {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith("Bearer ")) {
    return authHeader.substring(7);
  }
  if (req.cookies && req.cookies.auth_token) {
    return req.cookies.auth_token;
  }
  return null;
}
async function requireAuth(req, res, next) {
  try {
    const token = extractToken(req);
    if (!token) {
      return res.status(401).json({ error: "unauthenticated" });
    }
    const payload = verifyToken(token);
    const user = await storage.getUser(payload.userId);
    if (!user) {
      return res.status(401).json({ error: "user not found" });
    }
    req.user = payload;
    next();
  } catch (error) {
    console.error("Auth error:", error);
    return res.status(401).json({ error: "invalid token" });
  }
}
async function requireAdmin(req, res, next) {
  const authReq = req;
  if (!authReq.user) {
    return res.status(401).json({ error: "unauthenticated" });
  }
  if (authReq.user.role !== "admin") {
    return res.status(403).json({ error: "insufficient privileges" });
  }
  next();
}
async function optionalAuth(req, res, next) {
  try {
    const token = extractToken(req);
    if (token) {
      const payload = verifyToken(token);
      const user = await storage.getUser(payload.userId);
      if (user) {
        req.user = payload;
      }
    }
  } catch (error) {
  }
  next();
}
var init_auth = __esm({
  "server/auth.ts"() {
    "use strict";
    init_storage();
  }
});

// server/adminSetup.ts
var adminSetup_exports = {};
__export(adminSetup_exports, {
  createAdminUser: () => createAdminUser,
  setupAdminFromEnv: () => setupAdminFromEnv
});
async function createAdminUser(email, password) {
  try {
    const existingAdmin = await storage.getUserByEmail(email);
    if (existingAdmin) {
      console.log("Admin user already exists");
      return existingAdmin;
    }
    const passwordHash = await hashPassword(password);
    const adminUser = await storage.createUser({
      email,
      passwordHash,
      firstName: "Admin",
      lastName: "User",
      role: "admin",
      isActive: true
    });
    console.log(`Admin user created successfully: ${email}`);
    return adminUser;
  } catch (error) {
    console.error("Error creating admin user:", error);
    throw error;
  }
}
async function setupAdminFromEnv() {
  const adminEmail = process.env.ADMIN_EMAIL;
  const adminPassword = process.env.ADMIN_PASSWORD;
  if (!adminEmail || !adminPassword) {
    console.log("ADMIN_EMAIL and ADMIN_PASSWORD not set, skipping admin setup");
    return;
  }
  try {
    await createAdminUser(adminEmail, adminPassword);
  } catch (error) {
    console.error("Failed to setup admin user:", error);
  }
}
var init_adminSetup = __esm({
  "server/adminSetup.ts"() {
    "use strict";
    init_storage();
    init_auth();
  }
});

// server/seedData.ts
var seedData_exports = {};
__export(seedData_exports, {
  seedDatabase: () => seedDatabase
});
async function seedDatabase() {
  console.log("Seeding database with modular storage products...");
  const products2 = [
    {
      name: "Custom Cabinet System",
      description: "Modular cabinet system with customizable interior configurations",
      category: "Cabinets",
      basePrice: "899.00",
      modelUrl: "/public-objects/furniture/cabinet_combo_whiteoak.glb",
      imageUrl: "/gallery/white-entertainment-center.jpg",
      isActive: true
    },
    {
      name: "Storage Wall Unit",
      description: "Floor-to-ceiling modular storage solution for any room",
      category: "Storage Wall Unit",
      basePrice: "1299.00",
      modelUrl: "/public-objects/furniture/wardrobe_white_236cm.glb",
      imageUrl: "/gallery/gray-built-in-office.jpg",
      isActive: true
    },
    {
      name: "Modular Shelving System",
      description: "Adjustable shelving units for flexible storage solutions",
      category: "Shelves",
      basePrice: "299.00",
      modelUrl: "/public-objects/furniture/cube_unit_white_147x147.glb",
      imageUrl: "/gallery/white-bedroom-storage.jpg",
      isActive: true
    },
    {
      name: "Office Storage Solution",
      description: "Professional office storage with desk integration options",
      category: "Office Storage",
      basePrice: "1199.00",
      modelUrl: "/public-objects/furniture/cabinet_combo_charcoal.glb",
      imageUrl: "/gallery/gray-desk-storage-combo.jpg",
      isActive: true
    },
    {
      name: "Garage Storage System",
      description: "Heavy-duty modular storage for garage and utility spaces",
      category: "Garage Storage",
      basePrice: "799.00",
      modelUrl: "/public-objects/furniture/cube_unit_black_147x147.glb",
      imageUrl: "/gallery/modern-gray-kitchen.jpg",
      isActive: true
    }
  ];
  const components2 = [
    {
      name: "Additional Shelf",
      description: "Extra adjustable shelf for any unit",
      price: "49.00",
      category: "Shelving",
      isActive: true
    },
    {
      name: "Soft-Close Drawer",
      description: "Premium drawer with soft-close mechanism",
      price: "129.00",
      category: "Drawers",
      isActive: true
    },
    {
      name: "Glass Door Panel",
      description: "Tempered glass door for display storage",
      price: "89.00",
      category: "Doors",
      isActive: true
    },
    {
      name: "Interior Lighting Kit",
      description: "LED lighting system with dimmer control",
      price: "159.00",
      category: "Lighting",
      isActive: true
    },
    {
      name: "Cable Management System",
      description: "Built-in cable routing for office setups",
      price: "79.00",
      category: "Organization",
      isActive: true
    },
    {
      name: "Heavy-Duty Brackets",
      description: "Reinforced mounting brackets for garage storage",
      price: "39.00",
      category: "Hardware",
      isActive: true
    }
  ];
  const finishes2 = [
    {
      name: "Pure White",
      color: "White",
      priceMultiplier: "1.00",
      isActive: true
    },
    {
      name: "Charcoal Black",
      color: "Black",
      priceMultiplier: "1.05",
      isActive: true
    },
    {
      name: "Natural Oak",
      color: "Wood",
      priceMultiplier: "1.15",
      isActive: true
    },
    {
      name: "Walnut Veneer",
      color: "Dark Wood",
      priceMultiplier: "1.25",
      isActive: true
    },
    {
      name: "Matte Gray",
      color: "Gray",
      priceMultiplier: "1.08",
      isActive: true
    }
  ];
  try {
    for (const product of products2) {
      await storage.createProduct(product);
    }
    console.log(`Inserted ${products2.length} products`);
    for (const component of components2) {
      await storage.createComponent(component);
    }
    console.log(`Inserted ${components2.length} components`);
    for (const finish of finishes2) {
      await storage.createFinish(finish);
    }
    console.log(`Inserted ${finishes2.length} finishes`);
    console.log("Database seeding completed successfully!");
  } catch (error) {
    console.error("Error seeding database:", error);
  }
}
var init_seedData = __esm({
  "server/seedData.ts"() {
    "use strict";
    init_storage();
  }
});

// server/index.ts
import express2 from "express";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import cors from "cors";
import compression from "compression";
import cookieParser from "cookie-parser";
import path3 from "path";
import { fileURLToPath } from "url";

// server/routes.ts
init_storage();
init_auth();
import { createServer } from "http";

// server/authRoutes.ts
init_storage();
init_auth();
import { z as z2 } from "zod";
var loginSchema = z2.object({
  email: z2.string().email(),
  password: z2.string().min(6)
});
var registerSchema = z2.object({
  email: z2.string().email(),
  password: z2.string().min(6),
  firstName: z2.string().min(1),
  lastName: z2.string().min(1)
});
var passwordResetSchema = z2.object({
  email: z2.string().email()
});
function setupAuthRoutes(app2) {
  app2.post("/api/auth/login", async (req, res) => {
    try {
      const { email, password } = loginSchema.parse(req.body);
      const user = await storage.getUserByEmail(email);
      if (!user || !user.passwordHash) {
        return res.status(401).json({ error: "Invalid credentials" });
      }
      if (!user.isActive) {
        return res.status(401).json({ error: "Account is deactivated" });
      }
      const isValidPassword = await comparePassword(password, user.passwordHash);
      if (!isValidPassword) {
        return res.status(401).json({ error: "Invalid credentials" });
      }
      await storage.updateUser(user.id, { lastLogin: /* @__PURE__ */ new Date() });
      const token = generateToken({
        userId: user.id,
        email: user.email,
        role: user.role
      });
      res.cookie("auth_token", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 7 * 24 * 60 * 60 * 1e3
        // 7 days
      });
      res.json({
        success: true,
        token,
        user: {
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          role: user.role
        }
      });
    } catch (error) {
      console.error("Login error:", error);
      if (error instanceof z2.ZodError) {
        return res.status(400).json({ error: "Invalid input", details: error.errors });
      }
      res.status(500).json({ error: "Internal server error" });
    }
  });
  app2.post("/api/auth/register", async (req, res) => {
    try {
      const { email, password, firstName, lastName } = registerSchema.parse(req.body);
      const existingUser = await storage.getUserByEmail(email);
      if (existingUser) {
        return res.status(400).json({ error: "Email already registered" });
      }
      const passwordHash = await hashPassword(password);
      const user = await storage.createUser({
        email,
        passwordHash,
        firstName,
        lastName,
        role: "customer",
        isActive: true
      });
      const token = generateToken({
        userId: user.id,
        email: user.email,
        role: user.role
      });
      res.cookie("auth_token", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 7 * 24 * 60 * 60 * 1e3
      });
      res.status(201).json({
        success: true,
        token,
        user: {
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          role: user.role
        }
      });
    } catch (error) {
      console.error("Registration error:", error);
      if (error instanceof z2.ZodError) {
        return res.status(400).json({ error: "Invalid input", details: error.errors });
      }
      res.status(500).json({ error: "Internal server error" });
    }
  });
  app2.get("/api/auth/user", requireAuth, async (req, res) => {
    try {
      const authReq = req;
      const user = await storage.getUser(authReq.user.userId);
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }
      res.json({
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        createdAt: user.createdAt
      });
    } catch (error) {
      console.error("Get user error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });
  app2.post("/api/auth/logout", (req, res) => {
    res.clearCookie("auth_token");
    res.json({ success: true });
  });
  app2.post("/api/auth/password-reset", async (req, res) => {
    try {
      const { email } = passwordResetSchema.parse(req.body);
      const user = await storage.getUserByEmail(email);
      if (!user) {
        return res.json({ success: true, message: "If the email exists, a reset link has been sent" });
      }
      console.log(`Password reset requested for: ${email}`);
      res.json({ success: true, message: "If the email exists, a reset link has been sent" });
    } catch (error) {
      console.error("Password reset error:", error);
      if (error instanceof z2.ZodError) {
        return res.status(400).json({ error: "Invalid input", details: error.errors });
      }
      res.status(500).json({ error: "Internal server error" });
    }
  });
}

// server/email.ts
import nodemailer from "nodemailer";
var transporter = null;
async function createEmailTransporter() {
  if (transporter) return transporter;
  transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT || 587),
    secure: false,
    auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS }
  });
  try {
    await transporter.verify();
  } catch {
  }
  return transporter;
}
async function sendQuoteEmail(to, subject, html) {
  const t = await createEmailTransporter();
  return t.sendMail({ from: process.env.FROM_EMAIL, to, subject, html });
}

// server/routes.ts
init_schema();
import { z as z3 } from "zod";

// server/objectStorage.ts
import { Storage } from "@google-cloud/storage";
var OBJECT_STORAGE_ENDPOINT = process.env.OBJECT_STORAGE_ENDPOINT || "http://127.0.0.1:1106";
var objectStorageClient = new Storage({
  credentials: {
    audience: "storage",
    subject_token_type: "access_token",
    token_url: `${OBJECT_STORAGE_ENDPOINT}/token`,
    type: "external_account",
    credential_source: {
      url: `${OBJECT_STORAGE_ENDPOINT}/credential`,
      format: {
        type: "json",
        subject_token_field_name: "access_token"
      }
    },
    universe_domain: "googleapis.com"
  },
  projectId: process.env.GCS_PROJECT_ID || ""
});
var ObjectNotFoundError = class _ObjectNotFoundError extends Error {
  constructor() {
    super("Object not found");
    this.name = "ObjectNotFoundError";
    Object.setPrototypeOf(this, _ObjectNotFoundError.prototype);
  }
};
var ObjectStorageService = class {
  constructor() {
  }
  // Gets the public object search paths.
  getPublicObjectSearchPaths() {
    const pathsStr = process.env.PUBLIC_OBJECT_SEARCH_PATHS || "";
    const paths = Array.from(
      new Set(
        pathsStr.split(",").map((path4) => path4.trim()).filter((path4) => path4.length > 0)
      )
    );
    if (paths.length === 0) {
      throw new Error(
        "PUBLIC_OBJECT_SEARCH_PATHS not set. Create a bucket in 'Object Storage' tool and set PUBLIC_OBJECT_SEARCH_PATHS env var (comma-separated paths)."
      );
    }
    return paths;
  }
  // Gets the private object directory.
  getPrivateObjectDir() {
    const dir = process.env.PRIVATE_OBJECT_DIR || "";
    if (!dir) {
      throw new Error(
        "PRIVATE_OBJECT_DIR not set. Create a bucket in 'Object Storage' tool and set PRIVATE_OBJECT_DIR env var."
      );
    }
    return dir;
  }
  // Search for a public object from the search paths.
  async searchPublicObject(filePath) {
    for (const searchPath of this.getPublicObjectSearchPaths()) {
      const fullPath = `${searchPath}/${filePath}`;
      const { bucketName, objectName } = parseObjectPath(fullPath);
      const bucket = objectStorageClient.bucket(bucketName);
      const file = bucket.file(objectName);
      const [exists] = await file.exists();
      if (exists) {
        return file;
      }
    }
    return null;
  }
  // Downloads an object to the response.
  async downloadObject(file, res, cacheTtlSec = 3600) {
    try {
      const [metadata] = await file.getMetadata();
      res.set({
        "Content-Type": metadata.contentType || "application/octet-stream",
        "Content-Length": metadata.size,
        "Cache-Control": `public, max-age=${cacheTtlSec}`
      });
      const stream = file.createReadStream();
      stream.on("error", (err) => {
        console.error("Stream error:", err);
        if (!res.headersSent) {
          res.status(500).json({ error: "Error streaming file" });
        }
      });
      stream.pipe(res);
    } catch (error) {
      console.error("Error downloading file:", error);
      if (!res.headersSent) {
        res.status(500).json({ error: "Error downloading file" });
      }
    }
  }
  // Gets the upload URL for a public object.
  async getPublicUploadURL(fileName) {
    const publicSearchPaths = this.getPublicObjectSearchPaths();
    if (publicSearchPaths.length === 0) {
      throw new Error("No public object search paths configured");
    }
    const uploadPath = `${publicSearchPaths[0]}/${fileName}`;
    const { bucketName, objectName } = parseObjectPath(uploadPath);
    return signObjectURL({
      bucketName,
      objectName,
      method: "PUT",
      ttlSec: 900
    });
  }
};
function parseObjectPath(path4) {
  if (!path4.startsWith("/")) {
    path4 = `/${path4}`;
  }
  const pathParts = path4.split("/");
  if (pathParts.length < 3) {
    throw new Error("Invalid path: must contain at least a bucket name");
  }
  const bucketName = pathParts[1];
  const objectName = pathParts.slice(2).join("/");
  return {
    bucketName,
    objectName
  };
}
async function signObjectURL({
  bucketName,
  objectName,
  method,
  ttlSec
}) {
  const request = {
    bucket_name: bucketName,
    object_name: objectName,
    method,
    expires_at: new Date(Date.now() + ttlSec * 1e3).toISOString()
  };
  const response = await fetch(
    `${OBJECT_STORAGE_ENDPOINT}/object-storage/signed-object-url`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(request)
    }
  );
  if (!response.ok) {
    throw new Error(
      `Failed to sign object URL, errorcode: ${response.status}, make sure object storage service is available`
    );
  }
  const { signed_url: signedURL } = await response.json();
  return signedURL;
}

// server/pricing.ts
var LABOUR_HOURS = {
  shelf: 0.25,
  drawer: 0.5,
  door: 0.4,
  rail: 0.15,
  hanging_rail: 0.15,
  lighting: 0.75
};
var LABOUR_RATE = 85;
var FINISH_MULTIPLIER = {
  white: 1,
  matte: 1.08,
  wood: 1.12,
  oak: 1.12,
  glass: 1.18
};
var DELIVERY_ZONES = {
  TORONTO: { fee: 75 },
  GTA: { fee: 125 },
  ONTARIO: { fee: 195 },
  OOP: { fee: 295 }
};
var MIN_ORDER = 1200;
var PROFIT_MARGIN = 0.38;
function calculateQuote(configuration, location) {
  let materialsPrice = parseFloat(configuration.basePrice || "0");
  let laborHours = 1;
  let installationFee = 0;
  if (configuration.selectedComponents) {
    for (const component of configuration.selectedComponents) {
      materialsPrice += parseFloat(component.price || "0");
      const componentType = (component.type || component.category || "").toLowerCase();
      laborHours += LABOUR_HOURS[componentType] || 0.25;
      if (componentType === "lighting") {
        installationFee += 125;
      }
    }
  }
  const finishType = configuration.finish?.type?.toLowerCase() || "white";
  const finishMultiplier = FINISH_MULTIPLIER[finishType] || parseFloat(configuration.finish?.priceMultiplier || "1.0");
  materialsPrice *= finishMultiplier;
  const laborPrice = laborHours * LABOUR_RATE;
  let deliveryPrice = DELIVERY_ZONES.TORONTO.fee;
  if (location) {
    const locationUpper = location.toUpperCase();
    if (locationUpper.includes("HAMILTON") || locationUpper.includes("MISSISSAUGA") || locationUpper.includes("MARKHAM") || locationUpper.includes("VAUGHAN") || locationUpper.includes("RICHMOND HILL") || locationUpper.includes("OAKVILLE")) {
      deliveryPrice = DELIVERY_ZONES.GTA.fee;
    } else if (locationUpper.includes("ONTARIO") || locationUpper.includes("ON")) {
      deliveryPrice = DELIVERY_ZONES.ONTARIO.fee;
    } else if (!locationUpper.includes("TORONTO")) {
      deliveryPrice = DELIVERY_ZONES.OOP.fee;
    }
  }
  const subtotal = materialsPrice + laborPrice + deliveryPrice + installationFee;
  const totalPrice = Math.max(Math.round(subtotal * (1 + PROFIT_MARGIN)), MIN_ORDER);
  return {
    materialsPrice: materialsPrice.toFixed(2),
    laborPrice: laborPrice.toFixed(2),
    laborHours: laborHours.toFixed(1),
    deliveryPrice: deliveryPrice.toFixed(2),
    installationFee: installationFee.toFixed(2),
    totalPrice: totalPrice.toFixed(2)
  };
}

// server/routes.ts
async function registerRoutes(app2) {
  setupAuthRoutes(app2);
  app2.get("/api/products", async (req, res) => {
    try {
      const products2 = await storage.getProducts();
      res.json(products2);
    } catch (error) {
      console.error("Error fetching products:", error);
      res.status(500).json({ message: "Failed to fetch products" });
    }
  });
  app2.get("/api/components", async (req, res) => {
    try {
      const components2 = await storage.getComponents();
      res.json(components2);
    } catch (error) {
      console.error("Error fetching components:", error);
      res.status(500).json({ message: "Failed to fetch components" });
    }
  });
  app2.get("/api/finishes", async (req, res) => {
    try {
      const finishes2 = await storage.getFinishes();
      res.json(finishes2);
    } catch (error) {
      console.error("Error fetching finishes:", error);
      res.status(500).json({ message: "Failed to fetch finishes" });
    }
  });
  app2.post("/api/quote/calculate", async (req, res) => {
    try {
      const { configuration, location } = req.body;
      const quote = calculateQuote(configuration, location);
      res.json(quote);
    } catch (error) {
      console.error("Error calculating quote:", error);
      res.status(500).json({ message: "Failed to calculate quote" });
    }
  });
  app2.post("/api/quotes", async (req, res) => {
    try {
      const validatedData = insertQuoteSchema.parse(req.body);
      const { configuration, location } = req.body;
      const pricing = calculateQuote(configuration, validatedData.installationAddress || void 0);
      const quote = await storage.createQuote({
        ...validatedData,
        materialsPrice: pricing.materialsPrice,
        laborPrice: pricing.laborPrice,
        deliveryPrice: pricing.deliveryPrice,
        installationFee: pricing.installationFee,
        totalPrice: pricing.totalPrice,
        status: "pending"
      });
      const emailHtml = `
        <h2>Your Moduvo Quote #${quote.id}</h2>
        <p>Dear ${validatedData.customerName},</p>
        <p>Thank you for your interest in our modular storage solutions. Here's your custom quote:</p>
        
        <div style="background: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3>Quote Details</h3>
          <p><strong>Materials:</strong> $${pricing.materialsPrice}</p>
          <p><strong>Labor (${pricing.laborHours}h):</strong> $${pricing.laborPrice}</p>
          <p><strong>Delivery:</strong> $${pricing.deliveryPrice}</p>
          ${parseFloat(pricing.installationFee) > 0 ? `<p><strong>Installation:</strong> $${pricing.installationFee}</p>` : ""}
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
      if (error instanceof z3.ZodError) {
        return res.status(400).json({
          message: "Validation error",
          errors: error.errors
        });
      }
      res.status(500).json({ message: "Failed to create quote" });
    }
  });
  app2.get("/api/designs", requireAuth, async (req, res) => {
    try {
      const authReq = req;
      const designs2 = await storage.getUserDesigns(authReq.user.userId);
      res.json(designs2);
    } catch (error) {
      console.error("Error fetching designs:", error);
      res.status(500).json({ message: "Failed to fetch designs" });
    }
  });
  app2.post("/api/designs", requireAuth, async (req, res) => {
    try {
      const authReq = req;
      const validatedData = insertDesignSchema.parse({
        ...req.body,
        userId: authReq.user.userId
      });
      const design = await storage.createDesign(validatedData);
      res.status(201).json(design);
    } catch (error) {
      console.error("Error creating design:", error);
      if (error instanceof z3.ZodError) {
        return res.status(400).json({
          message: "Validation error",
          errors: error.errors
        });
      }
      res.status(500).json({ message: "Failed to create design" });
    }
  });
  app2.put("/api/designs/:id", requireAuth, async (req, res) => {
    try {
      const authReq = req;
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
  app2.delete("/api/designs/:id", requireAuth, async (req, res) => {
    try {
      const authReq = req;
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
  app2.get("/api/quotes", requireAuth, async (req, res) => {
    try {
      const authReq = req;
      const quotes2 = await storage.getUserQuotes(authReq.user.userId);
      res.json(quotes2);
    } catch (error) {
      console.error("Error fetching quotes:", error);
      res.status(500).json({ message: "Failed to fetch quotes" });
    }
  });
  app2.get("/api/admin/quotes", requireAuth, requireAdmin, async (req, res) => {
    try {
      const quotes2 = await storage.getAllQuotes();
      res.json(quotes2);
    } catch (error) {
      console.error("Error fetching admin quotes:", error);
      res.status(500).json({ message: "Failed to fetch quotes" });
    }
  });
  app2.put("/api/admin/quotes/:id", requireAuth, requireAdmin, async (req, res) => {
    try {
      const updated = await storage.updateQuote(req.params.id, req.body);
      res.json(updated);
    } catch (error) {
      console.error("Error updating quote:", error);
      res.status(500).json({ message: "Failed to update quote" });
    }
  });
  app2.get("/api/admin/designs", requireAuth, requireAdmin, async (req, res) => {
    try {
      const designs2 = await storage.getAllDesigns();
      res.json(designs2);
    } catch (error) {
      console.error("Error fetching admin designs:", error);
      res.status(500).json({ message: "Failed to fetch designs" });
    }
  });
  app2.get("/objects/:objectPath(*)", optionalAuth, async (req, res) => {
    const objectStorageService = new ObjectStorageService();
    try {
      const objectFile = await objectStorageService.searchPublicObject(
        req.path.replace("/objects/", "")
      );
      if (!objectFile) {
        return res.sendStatus(404);
      }
      const authReq = req;
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
  app2.post("/api/objects/upload", requireAuth, async (req, res) => {
    const objectStorageService = new ObjectStorageService();
    const uploadURL = "https://example.com/upload-placeholder";
    res.json({ uploadURL });
  });
  app2.get("/public-objects/:filePath(*)", async (req, res) => {
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
  app2.post("/api/init-data", async (req, res) => {
    try {
      const products2 = await storage.getProducts();
      if (products2.length === 0) {
        await storage.createProduct({
          name: "Modular Wardrobe System",
          description: "Premium modular wardrobe with customizable components",
          category: "wardrobe",
          basePrice: "2499.00",
          modelUrl: "/public-objects/models/wardrobe.glb",
          imageUrl: "/public-objects/images/wardrobe-hero.jpg",
          isActive: true
        });
        await storage.createComponent({
          name: "Hanging Rail",
          description: "Premium hanging rail for clothes",
          price: "89.00",
          category: "hanging_rail",
          isActive: true
        });
        await storage.createComponent({
          name: "Drawer Set (3)",
          description: "Set of 3 premium drawers",
          price: "245.00",
          category: "drawer",
          isActive: true
        });
        await storage.createFinish({
          name: "Pure White",
          color: "#FFFFFF",
          priceMultiplier: "1.00",
          isActive: true
        });
        await storage.createFinish({
          name: "Oak Wood",
          color: "#D2B48C",
          priceMultiplier: "1.12",
          isActive: true
        });
      }
      res.json({ success: true, message: "Default data initialized" });
    } catch (error) {
      console.error("Error initializing data:", error);
      res.status(500).json({ message: "Failed to initialize data" });
    }
  });
  const httpServer = createServer(app2);
  return httpServer;
}

// server/vite.ts
import express from "express";
import fs from "fs";
import path2 from "path";
import { createServer as createViteServer, createLogger } from "vite";

// vite.config.ts
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import runtimeErrorOverlay from "@replit/vite-plugin-runtime-error-modal";
var vite_config_default = defineConfig({
  plugins: [
    react(),
    runtimeErrorOverlay(),
    ...process.env.NODE_ENV !== "production" && process.env.REPL_ID !== void 0 ? [
      await import("@replit/vite-plugin-cartographer").then(
        (m) => m.cartographer()
      )
    ] : []
  ],
  resolve: {
    alias: {
      "@": path.resolve(import.meta.dirname, "client", "src"),
      "@shared": path.resolve(import.meta.dirname, "shared"),
      "@assets": path.resolve(import.meta.dirname, "attached_assets")
    }
  },
  root: path.resolve(import.meta.dirname, "client"),
  build: {
    outDir: path.resolve(import.meta.dirname, "dist/public"),
    emptyOutDir: true
  },
  server: {
    fs: {
      strict: true,
      deny: ["**/.*"]
    }
  }
});

// server/vite.ts
import { nanoid } from "nanoid";
var viteLogger = createLogger();
function log(message, source = "express") {
  const formattedTime = (/* @__PURE__ */ new Date()).toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    hour12: true
  });
  console.log(`${formattedTime} [${source}] ${message}`);
}
async function setupVite(app2, server) {
  const serverOptions = {
    middlewareMode: true,
    hmr: { server },
    allowedHosts: true
  };
  const vite = await createViteServer({
    ...vite_config_default,
    configFile: false,
    customLogger: {
      ...viteLogger,
      error: (msg, options) => {
        viteLogger.error(msg, options);
        process.exit(1);
      }
    },
    server: serverOptions,
    appType: "custom"
  });
  app2.use(vite.middlewares);
  app2.use("*", async (req, res, next) => {
    const url = req.originalUrl;
    try {
      const clientTemplate = path2.resolve(
        import.meta.dirname,
        "..",
        "client",
        "index.html"
      );
      let template = await fs.promises.readFile(clientTemplate, "utf-8");
      template = template.replace(
        `src="/src/main.tsx"`,
        `src="/src/main.tsx?v=${nanoid()}"`
      );
      const page = await vite.transformIndexHtml(url, template);
      res.status(200).set({ "Content-Type": "text/html" }).end(page);
    } catch (e) {
      vite.ssrFixStacktrace(e);
      next(e);
    }
  });
}
function serveStatic(app2) {
  const distPath = path2.resolve(import.meta.dirname, "public");
  if (!fs.existsSync(distPath)) {
    throw new Error(
      `Could not find the build directory: ${distPath}, make sure to build the client first`
    );
  }
  app2.use(express.static(distPath));
  app2.use("*", (_req, res) => {
    res.sendFile(path2.resolve(distPath, "index.html"));
  });
}

// server/index.ts
var __filename = fileURLToPath(import.meta.url);
var __dirname = path3.dirname(__filename);
var app = express2();
app.set("trust proxy", 1);
app.use(helmet({ contentSecurityPolicy: false, crossOriginResourcePolicy: { policy: "cross-origin" } }));
app.use(cors({ origin: (process.env.CORS_ORIGIN ?? "").split(","), credentials: true }));
app.use(compression());
app.use(cookieParser());
app.use(rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || "900000"),
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || "600")
}));
var clientDir = path3.resolve(__dirname, "../../client/dist");
app.use(express2.static(clientDir));
app.get("/healthz", (_req, res) => res.status(200).send("ok"));
app.get("/api/health", (_req, res) => res.status(200).json({ status: "ok" }));
app.use(express2.json({ limit: "10mb" }));
app.use(express2.urlencoded({ extended: false, limit: "10mb" }));
app.use((req, res, next) => {
  const start = Date.now();
  const path4 = req.path;
  let capturedJsonResponse = void 0;
  const originalResJson = res.json;
  res.json = function(bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };
  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path4.startsWith("/api")) {
      let logLine = `${req.method} ${path4} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }
      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "\u2026";
      }
      log(logLine);
    }
  });
  next();
});
(async () => {
  const server = await registerRoutes(app);
  app.use((err, _req, res, _next) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";
    res.status(status).json({ message });
    throw err;
  });
  if (app.get("env") === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }
  if (process.env.NODE_ENV === "production") {
    try {
      await createEmailTransporter();
      log("Email system initialized successfully");
    } catch (error) {
      log(`Email system initialization failed: ${error}`);
    }
  }
  if (process.env.ADMIN_EMAIL && process.env.ADMIN_PASSWORD) {
    const { setupAdminFromEnv: setupAdminFromEnv2 } = await Promise.resolve().then(() => (init_adminSetup(), adminSetup_exports));
    await setupAdminFromEnv2();
  }
  if (process.env.NODE_ENV === "development") {
    const { seedDatabase: seedDatabase2 } = await Promise.resolve().then(() => (init_seedData(), seedData_exports));
    try {
      await seedDatabase2();
    } catch (error) {
      log(`Database seeding failed (likely already seeded): ${error}`);
    }
  }
  app.get("*", (_req, res) => res.sendFile(path3.join(clientDir, "index.html")));
  const port = parseInt(process.env.PORT || "8000", 10);
  server.listen({
    port,
    host: "0.0.0.0",
    reusePort: true
  }, () => {
    log(`serving on port ${port}`);
  });
})();
