import { sql } from 'drizzle-orm';
import {
  index,
  jsonb,
  pgTable,
  timestamp,
  varchar,
  text,
  integer,
  decimal,
  boolean,
  uuid,
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { relations } from "drizzle-orm";

// Session storage table (required for Replit Auth)
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)],
);

// User storage table - platform agnostic
export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  email: varchar("email").unique().notNull(),
  passwordHash: varchar("password_hash"),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  profileImageUrl: varchar("profile_image_url"),
  role: varchar("role", { length: 20 }).default("customer"), // customer, admin, staff
  isActive: boolean("is_active").default(true),
  lastLogin: timestamp("last_login"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Product categories and base products
export const products = pgTable("products", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  category: varchar("category", { length: 100 }).notNull(), // wardrobe, bookshelf, storage_unit, custom
  basePrice: decimal("base_price", { precision: 10, scale: 2 }).notNull(),
  modelUrl: text("model_url"), // CDN URL for 3D model
  imageUrl: text("image_url"),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Available components for products
export const components = pgTable("components", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  price: decimal("price", { precision: 10, scale: 2 }).notNull(),
  category: varchar("category", { length: 100 }).notNull(), // hanging_rail, drawer, shelf, lighting, etc.
  modelUrl: text("model_url"),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
});

// Available finishes
export const finishes = pgTable("finishes", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: varchar("name", { length: 100 }).notNull(),
  color: varchar("color", { length: 50 }).notNull(),
  priceMultiplier: decimal("price_multiplier", { precision: 4, scale: 2 }).default("1.00"),
  isActive: boolean("is_active").default(true),
});

// User saved designs
export const designs = pgTable("designs", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: varchar("user_id").notNull().references(() => users.id),
  name: varchar("name", { length: 255 }).notNull(),
  productId: uuid("product_id").notNull().references(() => products.id),
  finishId: uuid("finish_id").notNull().references(() => finishes.id),
  dimensions: jsonb("dimensions"), // {width, height, depth}
  selectedComponents: jsonb("selected_components"), // array of component IDs
  configuration: jsonb("configuration"), // full config object
  previewImage: text("preview_image"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Quotes generated for users
export const quotes = pgTable("quotes", {
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
  status: varchar("status", { length: 50 }).default("pending"), // pending, sent, approved, rejected
  sentAt: timestamp("sent_at"),
  // AR/Visualization tracking
  arSessionCompleted: boolean("ar_session_completed").default(false),
  placementTimestamp: timestamp("placement_timestamp"),
  modelType: varchar("model_type", { length: 100 }), // geometric, gltf, custom
  emailCapturedAfterAR: boolean("email_captured_after_ar").default(false),
  leadSource: varchar("lead_source", { length: 50 }).default("ar_visualization"), // ar_visualization, direct_quote, etc.
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// System settings for admin
export const settings = pgTable("settings", {
  key: varchar("key", { length: 100 }).primaryKey(),
  value: jsonb("value").notNull(),
  description: text("description"),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Relations
export const usersRelations = relations(users, ({ many }) => ({
  designs: many(designs),
  quotes: many(quotes),
}));

export const productsRelations = relations(products, ({ many }) => ({
  designs: many(designs),
}));

export const designsRelations = relations(designs, ({ one, many }) => ({
  user: one(users, {
    fields: [designs.userId],
    references: [users.id],
  }),
  product: one(products, {
    fields: [designs.productId],
    references: [products.id],
  }),
  finish: one(finishes, {
    fields: [designs.finishId],
    references: [finishes.id],
  }),
  quotes: many(quotes),
}));

export const quotesRelations = relations(quotes, ({ one }) => ({
  user: one(users, {
    fields: [quotes.userId],
    references: [users.id],
  }),
  design: one(designs, {
    fields: [quotes.designId],
    references: [designs.id],
  }),
}));

// Schema types
export type InsertUser = typeof users.$inferInsert;
export type User = typeof users.$inferSelect;

export const insertProductSchema = createInsertSchema(products).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});
export type InsertProduct = z.infer<typeof insertProductSchema>;
export type Product = typeof products.$inferSelect;

export const insertComponentSchema = createInsertSchema(components).omit({
  id: true,
  createdAt: true,
});
export type InsertComponent = z.infer<typeof insertComponentSchema>;
export type Component = typeof components.$inferSelect;

export const insertFinishSchema = createInsertSchema(finishes).omit({
  id: true,
});
export type InsertFinish = z.infer<typeof insertFinishSchema>;
export type Finish = typeof finishes.$inferSelect;

export const insertDesignSchema = createInsertSchema(designs).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});
export type InsertDesign = z.infer<typeof insertDesignSchema>;
export type Design = typeof designs.$inferSelect;

export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  lastLogin: true,
});

export const insertQuoteSchema = createInsertSchema(quotes).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
}).extend({
  customerEmail: z.string().email("Please enter a valid email address"),
  customerName: z.string().min(2, "Name must be at least 2 characters"),
  customerPhone: z.string().regex(/^[\+]?[1-9][\d]{0,15}$/, "Please enter a valid phone number").optional(),
  installationAddress: z.string().min(10, "Please provide a complete address"),
});
export type InsertQuote = z.infer<typeof insertQuoteSchema>;
export type Quote = typeof quotes.$inferSelect;
