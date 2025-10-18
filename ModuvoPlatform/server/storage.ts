import {
  users,
  products,
  components,
  finishes,
  designs,
  quotes,
  settings,
  type User,
  type InsertUser,
  type Product,
  type InsertProduct,
  type Component,
  type InsertComponent,
  type Finish,
  type InsertFinish,
  type Design,
  type InsertDesign,
  type Quote,
  type InsertQuote,
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, and } from "drizzle-orm";

export interface IStorage {
  // User operations
  getUser(id: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: string, updates: Partial<InsertUser>): Promise<User | undefined>;
  
  // Product operations
  getProducts(): Promise<Product[]>;
  getProduct(id: string): Promise<Product | undefined>;
  createProduct(product: InsertProduct): Promise<Product>;
  updateProduct(id: string, product: Partial<InsertProduct>): Promise<Product | undefined>;
  
  // Component operations
  getComponents(): Promise<Component[]>;
  getComponent(id: string): Promise<Component | undefined>;
  createComponent(component: InsertComponent): Promise<Component>;
  
  // Finish operations
  getFinishes(): Promise<Finish[]>;
  getFinish(id: string): Promise<Finish | undefined>;
  createFinish(finish: InsertFinish): Promise<Finish>;
  
  // Design operations
  getUserDesigns(userId: string): Promise<Design[]>;
  getDesign(id: string): Promise<Design | undefined>;
  createDesign(design: InsertDesign): Promise<Design>;
  updateDesign(id: string, design: Partial<InsertDesign>): Promise<Design | undefined>;
  deleteDesign(id: string): Promise<boolean>;
  
  // Quote operations
  getUserQuotes(userId: string): Promise<Quote[]>;
  getAllQuotes(): Promise<Quote[]>;
  getQuote(id: string): Promise<Quote | undefined>;
  createQuote(quote: InsertQuote): Promise<Quote>;
  updateQuote(id: string, quote: Partial<InsertQuote>): Promise<Quote | undefined>;
  
  // Settings operations
  getSetting(key: string): Promise<any>;
  setSetting(key: string, value: any, description?: string): Promise<void>;
  
  // Admin operations
  getAllDesigns(): Promise<Design[]>;
}

export class DatabaseStorage implements IStorage {
  // User operations
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user;
  }

  async createUser(userData: InsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values({
        ...userData,
        createdAt: new Date(),
        updatedAt: new Date(),
      })
      .returning();
    return user;
  }

  async updateUser(id: string, updates: Partial<InsertUser>): Promise<User | undefined> {
    const [user] = await db
      .update(users)
      .set({
        ...updates,
        updatedAt: new Date(),
      })
      .where(eq(users.id, id))
      .returning();
    return user;
  }

  // Product operations
  async getProducts(): Promise<Product[]> {
    return await db.select().from(products).where(eq(products.isActive, true));
  }

  async getProduct(id: string): Promise<Product | undefined> {
    const [product] = await db.select().from(products).where(eq(products.id, id));
    return product;
  }

  async createProduct(product: InsertProduct): Promise<Product> {
    const [created] = await db.insert(products).values(product).returning();
    return created;
  }

  async updateProduct(id: string, product: Partial<InsertProduct>): Promise<Product | undefined> {
    const [updated] = await db
      .update(products)
      .set({ ...product, updatedAt: new Date() })
      .where(eq(products.id, id))
      .returning();
    return updated;
  }

  // Component operations
  async getComponents(): Promise<Component[]> {
    return await db.select().from(components).where(eq(components.isActive, true));
  }

  async getComponent(id: string): Promise<Component | undefined> {
    const [component] = await db.select().from(components).where(eq(components.id, id));
    return component;
  }

  async createComponent(component: InsertComponent): Promise<Component> {
    const [created] = await db.insert(components).values(component).returning();
    return created;
  }

  // Finish operations
  async getFinishes(): Promise<Finish[]> {
    return await db.select().from(finishes).where(eq(finishes.isActive, true));
  }

  async getFinish(id: string): Promise<Finish | undefined> {
    const [finish] = await db.select().from(finishes).where(eq(finishes.id, id));
    return finish;
  }

  async createFinish(finish: InsertFinish): Promise<Finish> {
    const [created] = await db.insert(finishes).values(finish).returning();
    return created;
  }

  // Design operations
  async getUserDesigns(userId: string): Promise<Design[]> {
    return await db.select().from(designs)
      .where(eq(designs.userId, userId))
      .orderBy(desc(designs.updatedAt));
  }

  async getDesign(id: string): Promise<Design | undefined> {
    const [design] = await db.select().from(designs).where(eq(designs.id, id));
    return design;
  }

  async createDesign(design: InsertDesign): Promise<Design> {
    const [created] = await db.insert(designs).values(design).returning();
    return created;
  }

  async updateDesign(id: string, design: Partial<InsertDesign>): Promise<Design | undefined> {
    const [updated] = await db
      .update(designs)
      .set({ ...design, updatedAt: new Date() })
      .where(eq(designs.id, id))
      .returning();
    return updated;
  }

  async deleteDesign(id: string): Promise<boolean> {
    const result = await db.delete(designs).where(eq(designs.id, id));
    return true; // Drizzle doesn't return rowsAffected, assume success if no error
  }

  async getAllDesigns(): Promise<Design[]> {
    return await db.select().from(designs).orderBy(desc(designs.updatedAt));
  }

  // Quote operations
  async getUserQuotes(userId: string): Promise<Quote[]> {
    return await db.select().from(quotes)
      .where(eq(quotes.userId, userId))
      .orderBy(desc(quotes.createdAt));
  }

  async getAllQuotes(): Promise<Quote[]> {
    return await db.select().from(quotes).orderBy(desc(quotes.createdAt));
  }

  async getQuote(id: string): Promise<Quote | undefined> {
    const [quote] = await db.select().from(quotes).where(eq(quotes.id, id));
    return quote;
  }

  async createQuote(quote: InsertQuote): Promise<Quote> {
    const [created] = await db.insert(quotes).values(quote).returning();
    return created;
  }

  async updateQuote(id: string, quote: Partial<InsertQuote>): Promise<Quote | undefined> {
    const [updated] = await db
      .update(quotes)
      .set({ ...quote, updatedAt: new Date() })
      .where(eq(quotes.id, id))
      .returning();
    return updated;
  }

  // Settings operations
  async getSetting(key: string): Promise<any> {
    const [setting] = await db.select().from(settings).where(eq(settings.key, key));
    return setting?.value;
  }

  async setSetting(key: string, value: any, description?: string): Promise<void> {
    await db
      .insert(settings)
      .values({ key, value, description })
      .onConflictDoUpdate({
        target: settings.key,
        set: { value, description, updatedAt: new Date() },
      });
  }
}

export const storage = new DatabaseStorage();
