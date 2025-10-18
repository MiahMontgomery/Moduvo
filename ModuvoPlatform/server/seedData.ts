import { storage } from "./storage";
import type { InsertProduct, InsertComponent, InsertFinish } from "../shared/schema";

// Seed data for modular storage products
export async function seedDatabase() {
  console.log("Seeding database with modular storage products...");

  // Product categories with base products
  const products: InsertProduct[] = [
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

  // Components for customization
  const components: InsertComponent[] = [
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

  // Finish options
  const finishes: InsertFinish[] = [
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
    // Insert products
    for (const product of products) {
      await storage.createProduct(product);
    }
    console.log(`Inserted ${products.length} products`);

    // Insert components  
    for (const component of components) {
      await storage.createComponent(component);
    }
    console.log(`Inserted ${components.length} components`);

    // Insert finishes
    for (const finish of finishes) {
      await storage.createFinish(finish);
    }
    console.log(`Inserted ${finishes.length} finishes`);

    console.log("Database seeding completed successfully!");
  } catch (error) {
    console.error("Error seeding database:", error);
  }
}