export interface QuoteConfiguration {
  product: {
    id: string;
    name: string;
    basePrice: string;
    category: string;
  };
  finish: {
    id: string;
    name: string;
    priceMultiplier: string;
  };
  dimensions: {
    width: number;
    height: number;
    depth: number;
  };
  selectedComponents: Array<{
    id: string;
    name: string;
    price: string;
    category: string;
  }>;
}

export interface QuoteBreakdown {
  materialsPrice: number;
  laborPrice: number;
  deliveryPrice: number;
  subtotal: number;
  totalPrice: number;
  margin: number;
  breakdown: {
    basePrice: number;
    componentsPrice: number;
    finishMultiplier: number;
    laborHours: number;
    laborRate: number;
  };
}

export interface LocationPricing {
  deliveryZone: string;
  baseDeliveryFee: number;
  additionalFee: number;
  laborRateMultiplier: number;
}

export class ModuvoQuoteCalculator {
  private static readonly BASE_LABOR_RATE = 75; // $75/hour for Toronto area
  private static readonly PROFIT_MARGIN = 0.38; // 38% profit margin
  private static readonly BASE_INSTALL_HOURS = 4; // Base installation time
  private static readonly COMPONENT_INSTALL_TIME = 0.5; // Additional hours per component

  /**
   * Calculate comprehensive quote based on configuration and location
   */
  static calculateQuote(
    configuration: QuoteConfiguration,
    location?: string
  ): QuoteBreakdown {
    // Calculate materials cost
    const basePrice = parseFloat(configuration.product.basePrice || '0');
    const componentsPrice = this.calculateComponentsPrice(configuration.selectedComponents);
    const finishMultiplier = parseFloat(configuration.finish?.priceMultiplier || '1.0');
    const materialsPrice = (basePrice + componentsPrice) * finishMultiplier;

    // Calculate labor cost
    const laborDetails = this.calculateLaborCost(configuration, location);
    const laborPrice = laborDetails.totalCost;

    // Calculate delivery cost
    const locationPricing = this.getLocationPricing(location);
    const deliveryPrice = locationPricing.baseDeliveryFee + locationPricing.additionalFee;

    // Calculate subtotal and apply profit margin
    const subtotal = materialsPrice + laborPrice + deliveryPrice;
    const totalPrice = subtotal / (1 - this.PROFIT_MARGIN);
    const margin = totalPrice - subtotal;

    return {
      materialsPrice: Math.round(materialsPrice * 100) / 100,
      laborPrice: Math.round(laborPrice * 100) / 100,
      deliveryPrice: Math.round(deliveryPrice * 100) / 100,
      subtotal: Math.round(subtotal * 100) / 100,
      totalPrice: Math.round(totalPrice * 100) / 100,
      margin: Math.round(margin * 100) / 100,
      breakdown: {
        basePrice,
        componentsPrice,
        finishMultiplier,
        laborHours: laborDetails.hours,
        laborRate: laborDetails.rate,
      },
    };
  }

  /**
   * Calculate total price for selected components
   */
  private static calculateComponentsPrice(components: QuoteConfiguration['selectedComponents']): number {
    return components.reduce((total, component) => {
      return total + parseFloat(component.price || '0');
    }, 0);
  }

  /**
   * Calculate labor cost based on configuration complexity
   */
  private static calculateLaborCost(
    configuration: QuoteConfiguration,
    location?: string
  ): { hours: number; rate: number; totalCost: number } {
    let hours = this.BASE_INSTALL_HOURS;

    // Add time for each component
    hours += (configuration.selectedComponents?.length || 0) * this.COMPONENT_INSTALL_TIME;

    // Add complexity factors based on dimensions
    const volume = (configuration.dimensions.width * configuration.dimensions.height * configuration.dimensions.depth) / 1000000;
    if (volume > 1.5) { // Large installations
      hours += 2;
    }

    // Factor in specific component complexities
    configuration.selectedComponents?.forEach(component => {
      switch (component.category) {
        case 'lighting':
          hours += 1; // Electrical work
          break;
        case 'drawer':
          hours += 0.75; // Precise fitting required
          break;
        case 'mirror':
          hours += 0.5; // Careful handling
          break;
      }
    });

    // Get location-specific labor rate
    const locationPricing = this.getLocationPricing(location);
    const rate = this.BASE_LABOR_RATE * locationPricing.laborRateMultiplier;

    return {
      hours: Math.round(hours * 10) / 10,
      rate,
      totalCost: hours * rate,
    };
  }

  /**
   * Get location-specific pricing information
   */
  private static getLocationPricing(location?: string): LocationPricing {
    const locationLower = location?.toLowerCase() || '';

    // Toronto core area
    if (locationLower.includes('toronto') && 
        (locationLower.includes('downtown') || locationLower.includes('core'))) {
      return {
        deliveryZone: 'Toronto Core',
        baseDeliveryFee: 150,
        additionalFee: 0,
        laborRateMultiplier: 1.1, // Premium for core area
      };
    }
    
    // Greater Toronto Area
    if (locationLower.includes('toronto') || 
        locationLower.includes('mississauga') || 
        locationLower.includes('brampton') ||
        locationLower.includes('markham') ||
        locationLower.includes('richmond hill') ||
        locationLower.includes('vaughan') ||
        locationLower.includes('etobicoke') ||
        locationLower.includes('scarborough') ||
        locationLower.includes('north york')) {
      return {
        deliveryZone: 'GTA',
        baseDeliveryFee: 150,
        additionalFee: 0,
        laborRateMultiplier: 1.0,
      };
    }

    // Extended GTA
    if (locationLower.includes('hamilton') ||
        locationLower.includes('burlington') ||
        locationLower.includes('oakville') ||
        locationLower.includes('milton') ||
        locationLower.includes('ajax') ||
        locationLower.includes('pickering') ||
        locationLower.includes('oshawa') ||
        locationLower.includes('whitby')) {
      return {
        deliveryZone: 'Extended GTA',
        baseDeliveryFee: 150,
        additionalFee: 75,
        laborRateMultiplier: 1.05,
      };
    }

    // Outside GTA - Ontario
    if (locationLower.includes('ontario') || locationLower.includes('on')) {
      return {
        deliveryZone: 'Ontario',
        baseDeliveryFee: 150,
        additionalFee: 150,
        laborRateMultiplier: 1.15,
      };
    }

    // Default (assume GTA if no location provided)
    return {
      deliveryZone: 'GTA',
      baseDeliveryFee: 150,
      additionalFee: 0,
      laborRateMultiplier: 1.0,
    };
  }

  /**
   * Calculate quick estimate for display purposes
   */
  static calculateQuickEstimate(configuration: QuoteConfiguration): number {
    const quote = this.calculateQuote(configuration);
    return quote.totalPrice;
  }

  /**
   * Format currency for display
   */
  static formatCurrency(amount: number): string {
    return new Intl.NumberFormat('en-CA', {
      style: 'currency',
      currency: 'CAD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  }

  /**
   * Get quote summary for email/display
   */
  static getQuoteSummary(
    configuration: QuoteConfiguration,
    breakdown: QuoteBreakdown,
    location?: string
  ): string {
    const locationPricing = this.getLocationPricing(location);
    
    return `
Quote Summary for ${configuration.product.name}

Configuration:
• Dimensions: ${configuration.dimensions.width}cm × ${configuration.dimensions.height}cm × ${configuration.dimensions.depth}cm
• Finish: ${configuration.finish.name}
• Components: ${configuration.selectedComponents.length} selected
• Delivery Zone: ${locationPricing.deliveryZone}

Price Breakdown:
• Materials: ${this.formatCurrency(breakdown.materialsPrice)}
• Labor (${breakdown.breakdown.laborHours} hours): ${this.formatCurrency(breakdown.laborPrice)}
• Delivery: ${this.formatCurrency(breakdown.deliveryPrice)}
• Subtotal: ${this.formatCurrency(breakdown.subtotal)}

Total Price: ${this.formatCurrency(breakdown.totalPrice)}

* Price includes all materials, professional installation, and delivery
* Quote valid for 30 days
* HST will be added at time of purchase
* Final pricing subject to site assessment
`.trim();
  }

  /**
   * Validate configuration for quote calculation
   */
  static validateConfiguration(configuration: Partial<QuoteConfiguration>): string[] {
    const errors: string[] = [];

    if (!configuration.product) {
      errors.push('Product selection is required');
    } else {
      if (!configuration.product.basePrice || parseFloat(configuration.product.basePrice) <= 0) {
        errors.push('Valid product price is required');
      }
    }

    if (!configuration.finish) {
      errors.push('Finish selection is required');
    }

    if (!configuration.dimensions) {
      errors.push('Dimensions are required');
    } else {
      if (configuration.dimensions.width <= 0 || configuration.dimensions.width > 500) {
        errors.push('Width must be between 1-500cm');
      }
      if (configuration.dimensions.height <= 0 || configuration.dimensions.height > 300) {
        errors.push('Height must be between 1-300cm');
      }
      if (configuration.dimensions.depth <= 0 || configuration.dimensions.depth > 100) {
        errors.push('Depth must be between 1-100cm');
      }
    }

    return errors;
  }

  /**
   * Calculate savings compared to retail prices
   */
  static calculateSavings(configuration: QuoteConfiguration): number {
    // Estimate retail pricing (typically 40-60% higher than our direct pricing)
    const ourPrice = this.calculateQuote(configuration).totalPrice;
    const estimatedRetail = ourPrice * 1.5; // 50% markup assumption
    
    return estimatedRetail - ourPrice;
  }
}
