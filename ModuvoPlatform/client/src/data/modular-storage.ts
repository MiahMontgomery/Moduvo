// Modular Storage Furniture Data for AR Integration
// Generic modular storage solutions for custom installations

export interface ModularStorageVariant {
  color: string;
  size?: string;
  sku: string;
  assetUrls: {
    glb?: string;
    usdz?: string;
  };
  thumbImages: string[];
}

export interface ModularStorageProduct {
  series: string;
  category: string;
  name: string;
  dimensions_cm: {
    width: number;
    depth: number;
    height: number;
  };
  materials: string[];
  basePrice: number;
  variants: ModularStorageVariant[];
  configurableOptions: string[];
  warranty?: string;
  categoryTags?: string[];
}

// Modular Storage Database - Premium Storage Solutions
export const modularStorageData: ModularStorageProduct[] = [
  {
    series: "Cube Series",
    category: "Shelving Units > Cube Storage",
    name: "Modular cube storage unit 147x147 cm",
    dimensions_cm: { width: 147, depth: 39, height: 147 },
    materials: ["Premium MDF", "Laminate finish", "Metal hardware"],
    basePrice: 299.00,
    variants: [
      {
        color: "Pure White",
        sku: "MOD-CUBE-147-WH",
        assetUrls: {
          glb: "/public-objects/furniture/cube_unit_white_147x147.glb",
          usdz: "/public-objects/furniture/cube_unit_white_147x147.usdz"
        },
        thumbImages: [
          "/public-objects/placeholder-furniture-white.jpg"
        ]
      },
      {
        color: "Charcoal Black",
        sku: "MOD-CUBE-147-BK",
        assetUrls: {
          glb: "/public-objects/furniture/cube_unit_black_147x147.glb",
          usdz: "/public-objects/furniture/cube_unit_black_147x147.usdz"
        },
        thumbImages: [
          "/public-objects/placeholder-furniture-black.jpg"
        ]
      },
      {
        color: "Natural Oak",
        sku: "MOD-CUBE-147-OAK",
        assetUrls: {
          glb: "/public-objects/furniture/cube_unit_oak_147x147.glb",
          usdz: "/public-objects/furniture/cube_unit_oak_147x147.usdz"
        },
        thumbImages: [
          "/public-objects/placeholder-furniture-oak.jpg"
        ]
      }
    ],
    configurableOptions: [
      "Compatible with modular insert boxes and drawers",
      "Can be wall-mounted or used as room divider",
      "Optional base legs available separately"
    ],
    categoryTags: ["Storage", "Modular", "Cube System"]
  },
  {
    series: "Cabinet Series",
    category: "Storage Systems > Sideboards",
    name: "Modular storage cabinet with doors 120x42x74 cm",
    dimensions_cm: { width: 120, depth: 42, height: 74 },
    materials: ["Premium MDF", "Soft-close hinges", "Laminate finish"],
    basePrice: 459.00,
    variants: [
      {
        color: "White Oak with White doors",
        sku: "MOD-CAB-120-WOWHITE",
        assetUrls: {
          glb: "/public-objects/furniture/cabinet_combo_whiteoak.glb",
          usdz: "/public-objects/furniture/cabinet_combo_whiteoak.usdz"
        },
        thumbImages: [
          "/public-objects/placeholder-cabinet-white.jpg"
        ]
      },
      {
        color: "Charcoal with Gray doors",
        sku: "MOD-CAB-120-CHGRAY",
        assetUrls: {
          glb: "/public-objects/furniture/cabinet_combo_charcoal.glb",
          usdz: "/public-objects/furniture/cabinet_combo_charcoal.usdz"
        },
        thumbImages: [
          "/public-objects/placeholder-cabinet-gray.jpg"
        ]
      }
    ],
    configurableOptions: [
      "Adjustable interior shelves included",
      "Soft-close door mechanisms standard",
      "Optional hardware upgrades available"
    ],
    categoryTags: ["Storage", "Living Room", "Media Console"]
  },
  {
    series: "Wardrobe Series",
    category: "Wardrobes > Modular System",
    name: "Premium wardrobe with sliding doors 200x66x236 cm",
    dimensions_cm: { width: 200, depth: 66, height: 236 },
    materials: ["Premium MDF", "Aluminum tracks", "Soft-close mechanisms"],
    basePrice: 1299.00,
    variants: [
      {
        color: "Pure White frame with white sliding doors",
        size: "200x66x236 cm (Tall)",
        sku: "MOD-WARD-200-WHITE",
        assetUrls: {
          glb: "/public-objects/furniture/wardrobe_white_236cm.glb",
          usdz: "/public-objects/furniture/wardrobe_white_236cm.usdz"
        },
        thumbImages: [
          "/public-objects/placeholder-wardrobe-white.jpg"
        ]
      },
      {
        color: "Charcoal frame with dark gray sliding doors",
        size: "200x66x236 cm (Tall)",
        sku: "MOD-WARD-200-CHAR",
        assetUrls: {
          glb: "/public-objects/furniture/wardrobe_charcoal_236cm.glb",
          usdz: "/public-objects/furniture/wardrobe_charcoal_236cm.usdz"
        },
        thumbImages: [
          "/public-objects/placeholder-wardrobe-charcoal.jpg"
        ]
      }
    ],
    configurableOptions: [
      "Interior organizer systems available separately",
      "Premium soft-closing sliding door mechanism",
      "Adjustable feet for uneven floors",
      "Min. ceiling height required: 240 cm (94½\")"
    ],
    warranty: "15-year limited warranty on all Moduvo modular systems",
    categoryTags: ["Wardrobes", "Bedroom", "Storage", "Premium System"]
  }
];

// Helper function to get furniture by series
export const getFurnitureByType = (series: string): ModularStorageProduct | undefined => {
  return modularStorageData.find(item => item.series === series);
};

// Helper function to get all available series
export const getAvailableSeries = (): string[] => {
  return modularStorageData.map(item => item.series);
};

// Convert modular storage data to Moduvo configuration format
export const convertToModuvoConfig = (product: ModularStorageProduct, variantIndex: number = 0) => {
  const variant = product.variants[variantIndex];
  
  return {
    productName: product.name,
    series: product.series,
    dimensions: product.dimensions_cm,
    finish: {
      name: variant.color,
      price: 0 // Base prices are already inclusive
    },
    materials: product.materials,
    price: product.basePrice,
    sku: variant.sku,
    assetUrls: variant.assetUrls,
    thumbImages: variant.thumbImages,
    configurableOptions: product.configurableOptions
  };
};