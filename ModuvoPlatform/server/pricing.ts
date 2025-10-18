// Production pricing configuration with deterministic calculations
export const LABOUR_HOURS = {
  shelf: 0.25,
  drawer: 0.5,
  door: 0.4,
  rail: 0.15,
  hanging_rail: 0.15,
  lighting: 0.75
} as const;

export const LABOUR_RATE = 85; // CAD per hour

export const FINISH_MULTIPLIER = {
  white: 1.0,
  matte: 1.08,
  wood: 1.12,
  oak: 1.12,
  glass: 1.18
} as const;

export const DELIVERY_ZONES = {
  TORONTO: { fee: 75 },
  GTA: { fee: 125 },
  ONTARIO: { fee: 195 },
  OOP: { fee: 295 }
};

export const MIN_ORDER = 1200;
export const PROFIT_MARGIN = 0.38; // 38% markup

export interface PricingConfiguration {
  basePrice?: string;
  selectedComponents?: Array<{
    price: string;
    type?: string;
    category?: string;
  }>;
  finish?: {
    type?: string;
    priceMultiplier?: string;
  };
}

export function calculateQuote(configuration: PricingConfiguration, location?: string) {
  let materialsPrice = parseFloat(configuration.basePrice || "0");
  let laborHours = 1; // Base assembly time
  let installationFee = 0;
  
  // Component-based pricing and labor calculation
  if (configuration.selectedComponents) {
    for (const component of configuration.selectedComponents) {
      materialsPrice += parseFloat(component.price || "0");
      
      const componentType = (component.type || component.category || "").toLowerCase();
      laborHours += LABOUR_HOURS[componentType as keyof typeof LABOUR_HOURS] || 0.25;
      
      // Electrical work additional fees
      if (componentType === 'lighting') {
        installationFee += 125;
      }
    }
  }
  
  // Apply finish multiplier
  const finishType = configuration.finish?.type?.toLowerCase() || 'white';
  const finishMultiplier = FINISH_MULTIPLIER[finishType as keyof typeof FINISH_MULTIPLIER] || 
                           parseFloat(configuration.finish?.priceMultiplier || "1.0");
  materialsPrice *= finishMultiplier;
  
  // Labor cost calculation
  const laborPrice = laborHours * LABOUR_RATE;
  
  // Geographic delivery pricing
  let deliveryPrice = DELIVERY_ZONES.TORONTO.fee;
  if (location) {
    const locationUpper = location.toUpperCase();
    if (locationUpper.includes('HAMILTON') || locationUpper.includes('MISSISSAUGA') || 
        locationUpper.includes('MARKHAM') || locationUpper.includes('VAUGHAN') ||
        locationUpper.includes('RICHMOND HILL') || locationUpper.includes('OAKVILLE')) {
      deliveryPrice = DELIVERY_ZONES.GTA.fee;
    } else if (locationUpper.includes('ONTARIO') || locationUpper.includes('ON')) {
      deliveryPrice = DELIVERY_ZONES.ONTARIO.fee;
    } else if (!locationUpper.includes('TORONTO')) {
      deliveryPrice = DELIVERY_ZONES.OOP.fee;
    }
  }
  
  // Calculate subtotal and apply margin
  const subtotal = materialsPrice + laborPrice + deliveryPrice + installationFee;
  const totalPrice = Math.max(Math.round(subtotal * (1 + PROFIT_MARGIN)), MIN_ORDER);
  
  return {
    materialsPrice: materialsPrice.toFixed(2),
    laborPrice: laborPrice.toFixed(2),
    laborHours: laborHours.toFixed(1),
    deliveryPrice: deliveryPrice.toFixed(2),
    installationFee: installationFee.toFixed(2),
    totalPrice: totalPrice.toFixed(2),
  };
}