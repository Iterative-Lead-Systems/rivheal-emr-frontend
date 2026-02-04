/**
 * Pharmacy Partner Integration Service
 * 
 * Unified interface for multiple pharmacy delivery partners.
 * Supports location-based routing, stock checking, and order management.
 * 
 * Partners:
 * - In-House Pharmacy (hospital's own pharmacy)
 * - Pharmarun (Lagos, Port Harcourt, Abuja)
 * - HealthPlus (Lagos, Abuja)
 * - MedPlus (National coverage)
 * - Others can be added via the partner registry
 */

// ============================================================================
// Core Types
// ============================================================================

export type FulfillmentType = 'in_house' | 'delivery' | 'pickup';
export type PartnerStatus = 'active' | 'inactive' | 'maintenance';

export interface GeoLocation {
  lat: number;
  lng: number;
  state: string;
  city: string;
  lga?: string; // Local Government Area
}

export interface DrugItem {
  id: string;
  name: string;
  genericName?: string;
  strength: string;
  dosageForm: 'tablet' | 'capsule' | 'syrup' | 'injection' | 'inhaler' | 'cream' | 'drops' | 'other';
  quantity: number;
  frequency: string;
  duration: string;
  instructions?: string;
}

export interface Prescription {
  id: string;
  prescriptionNumber: string;
  patientId: string;
  patientName: string;
  patientPhone: string;
  patientLocation?: GeoLocation;
  doctorId: string;
  doctorName: string;
  doctorLicense: string; // MDCN license
  hospitalId: string;
  hospitalName: string;
  hospitalLicense: string;
  visitId: string;
  drugs: DrugItem[];
  diagnosis?: string;
  notes?: string;
  createdAt: string;
  digitalSignature?: string;
}

export interface DeliveryAddress {
  street: string;
  city: string;
  state: string;
  lga?: string;
  landmark?: string;
  coordinates?: GeoLocation;
  contactPhone: string;
  contactName: string;
  deliveryInstructions?: string;
}

// ============================================================================
// Partner Types
// ============================================================================

export interface PharmacyPartner {
  id: string;
  code: string; // e.g., 'pharmarun', 'healthplus', 'medplus', 'in_house'
  name: string;
  logo?: string;
  status: PartnerStatus;
  supportedFulfillment: FulfillmentType[];
  coverageAreas: {
    states: string[];
    cities?: string[];
    nationwide?: boolean;
  };
  features: {
    realTimeStock: boolean;
    sameDay: boolean;
    expressDelivery: boolean;
    payOnDelivery: boolean;
    onlinePayment: boolean;
  };
  contactInfo: {
    phone: string;
    email: string;
    website?: string;
  };
  apiConfig?: {
    baseUrl: string;
    apiKey?: string;
    webhookUrl?: string;
  };
}

export interface DrugAvailability {
  drugId: string;
  drugName: string;
  available: boolean;
  quantity: number;
  unitPrice: number;
  currency: 'NGN';
  alternatives?: {
    name: string;
    strength: string;
    unitPrice: number;
    isGeneric: boolean;
  }[];
}

export interface PartnerQuote {
  partnerId: string;
  partnerName: string;
  partnerLogo?: string;
  fulfillmentType: FulfillmentType;
  availability: {
    allAvailable: boolean;
    items: DrugAvailability[];
    unavailableCount: number;
  };
  pricing: {
    subtotal: number;
    deliveryFee: number;
    serviceFee: number;
    discount: number;
    total: number;
    currency: 'NGN';
  };
  delivery: {
    estimatedTime: string; // e.g., "2-4 hours", "Next day"
    estimatedDate?: string;
    isExpress: boolean;
  };
  paymentMethods: ('online' | 'on_delivery' | 'wallet')[];
  expiresAt: string; // Quote validity
}

export interface PartnerOrder {
  id: string;
  partnerId: string;
  partnerOrderId: string; // External order ID from partner
  prescriptionId: string;
  status: OrderStatus;
  fulfillmentType: FulfillmentType;
  items: DrugItem[];
  pricing: PartnerQuote['pricing'];
  delivery?: {
    address: DeliveryAddress;
    estimatedTime: string;
    actualDeliveryTime?: string;
    driver?: {
      name: string;
      phone: string;
      vehicleNumber?: string;
      currentLocation?: GeoLocation;
    };
  };
  payment: {
    method: 'online' | 'on_delivery' | 'wallet';
    status: 'pending' | 'paid' | 'failed' | 'refunded';
    reference?: string;
    paidAt?: string;
  };
  trackingUrl?: string;
  createdAt: string;
  updatedAt: string;
}

export type OrderStatus = 
  | 'pending'
  | 'confirmed'
  | 'preparing'
  | 'ready_for_pickup'
  | 'dispatched'
  | 'in_transit'
  | 'delivered'
  | 'completed'
  | 'cancelled'
  | 'failed';

export interface OrderStatusUpdate {
  orderId: string;
  status: OrderStatus;
  message: string;
  timestamp: string;
  metadata?: Record<string, unknown>;
}

// ============================================================================
// Partner Service Interface
// ============================================================================

export interface IPharmacyPartnerAdapter {
  partnerId: string;
  
  /**
   * Check drug availability and get pricing
   */
  checkAvailability(
    drugs: DrugItem[],
    deliveryLocation?: GeoLocation
  ): Promise<PartnerQuote>;
  
  /**
   * Create an order with the partner
   */
  createOrder(
    prescription: Prescription,
    deliveryAddress?: DeliveryAddress,
    paymentMethod: 'online' | 'on_delivery' | 'wallet'
  ): Promise<PartnerOrder>;
  
  /**
   * Get order status and tracking info
   */
  getOrderStatus(orderId: string): Promise<PartnerOrder>;
  
  /**
   * Cancel an order
   */
  cancelOrder(orderId: string, reason: string): Promise<{ success: boolean; message: string }>;
  
  /**
   * Process webhook events from partner
   */
  handleWebhook(payload: unknown): Promise<OrderStatusUpdate>;
}

// ============================================================================
// Partner Registry
// ============================================================================

export const PHARMACY_PARTNERS: PharmacyPartner[] = [
  {
    id: 'in_house',
    code: 'in_house',
    name: 'In-House Pharmacy',
    status: 'active',
    supportedFulfillment: ['in_house', 'pickup'],
    coverageAreas: { states: [], nationwide: false }, // Hospital-specific
    features: {
      realTimeStock: true,
      sameDay: true,
      expressDelivery: false,
      payOnDelivery: false,
      onlinePayment: true,
    },
    contactInfo: {
      phone: '',
      email: '',
    },
  },
  {
    id: 'pharmarun',
    code: 'pharmarun',
    name: 'Pharmarun',
    logo: '/partners/pharmarun.png',
    status: 'active',
    supportedFulfillment: ['delivery'],
    coverageAreas: {
      states: ['Lagos', 'Rivers', 'FCT'],
      cities: ['Lagos', 'Port Harcourt', 'Abuja'],
    },
    features: {
      realTimeStock: true,
      sameDay: true,
      expressDelivery: true,
      payOnDelivery: true,
      onlinePayment: true,
    },
    contactInfo: {
      phone: '+234 800 000 0000',
      email: 'support@pharmarun.com',
      website: 'https://pharmarun.com',
    },
    apiConfig: {
      baseUrl: 'https://api.pharmarun.com/v1',
      webhookUrl: '/webhooks/pharmarun',
    },
  },
  {
    id: 'healthplus',
    code: 'healthplus',
    name: 'HealthPlus',
    logo: '/partners/healthplus.png',
    status: 'active',
    supportedFulfillment: ['delivery', 'pickup'],
    coverageAreas: {
      states: ['Lagos', 'FCT', 'Rivers', 'Oyo'],
      cities: ['Lagos', 'Abuja', 'Port Harcourt', 'Ibadan'],
    },
    features: {
      realTimeStock: true,
      sameDay: true,
      expressDelivery: false,
      payOnDelivery: true,
      onlinePayment: true,
    },
    contactInfo: {
      phone: '+234 800 111 1111',
      email: 'care@healthplus.com.ng',
      website: 'https://healthplus.com.ng',
    },
    apiConfig: {
      baseUrl: 'https://api.healthplus.com.ng/v1',
      webhookUrl: '/webhooks/healthplus',
    },
  },
  {
    id: 'medplus',
    code: 'medplus',
    name: 'MedPlus',
    logo: '/partners/medplus.png',
    status: 'active',
    supportedFulfillment: ['delivery', 'pickup'],
    coverageAreas: {
      states: [],
      nationwide: true,
    },
    features: {
      realTimeStock: true,
      sameDay: false,
      expressDelivery: false,
      payOnDelivery: true,
      onlinePayment: true,
    },
    contactInfo: {
      phone: '+234 800 222 2222',
      email: 'support@medplus.com.ng',
      website: 'https://medplus.com.ng',
    },
    apiConfig: {
      baseUrl: 'https://api.medplus.com.ng/v1',
      webhookUrl: '/webhooks/medplus',
    },
  },
];

// ============================================================================
// Pharmacy Partner Service
// ============================================================================

export class PharmacyPartnerService {
  private adapters: Map<string, IPharmacyPartnerAdapter> = new Map();
  
  constructor() {
    // Register adapters for each partner
    // In real implementation, each partner would have its own adapter
  }
  
  /**
   * Get available partners for a given location
   */
  getAvailablePartners(location: GeoLocation): PharmacyPartner[] {
    return PHARMACY_PARTNERS.filter((partner) => {
      if (partner.status !== 'active') return false;
      
      // In-house is always available at the hospital
      if (partner.code === 'in_house') return true;
      
      // Check coverage
      if (partner.coverageAreas.nationwide) return true;
      if (partner.coverageAreas.states.includes(location.state)) return true;
      if (partner.coverageAreas.cities?.includes(location.city)) return true;
      
      return false;
    });
  }
  
  /**
   * Get quotes from all available partners
   */
  async getQuotes(
    drugs: DrugItem[],
    location: GeoLocation,
    includeInHouse: boolean = true
  ): Promise<PartnerQuote[]> {
    const partners = this.getAvailablePartners(location);
    const quotes: PartnerQuote[] = [];
    
    for (const partner of partners) {
      if (!includeInHouse && partner.code === 'in_house') continue;
      
      try {
        // In real implementation, this would call the partner's API
        const quote = await this.mockGetQuote(partner, drugs, location);
        quotes.push(quote);
      } catch (error) {
        console.error(`Failed to get quote from ${partner.name}:`, error);
      }
    }
    
    // Sort by total price
    return quotes.sort((a, b) => a.pricing.total - b.pricing.total);
  }
  
  /**
   * Select the best fulfillment option automatically
   */
  async selectBestOption(
    drugs: DrugItem[],
    location: GeoLocation,
    preferences: {
      prioritizeSpeed?: boolean;
      prioritizePrice?: boolean;
      preferInHouse?: boolean;
    } = {}
  ): Promise<PartnerQuote | null> {
    const quotes = await this.getQuotes(drugs, location);
    
    if (quotes.length === 0) return null;
    
    // Filter to only fully available options
    const fullyAvailable = quotes.filter((q) => q.availability.allAvailable);
    
    if (fullyAvailable.length === 0) {
      // Return the option with most drugs available
      return quotes.reduce((best, current) => 
        current.availability.unavailableCount < best.availability.unavailableCount ? current : best
      );
    }
    
    // Apply preferences
    if (preferences.preferInHouse) {
      const inHouse = fullyAvailable.find((q) => q.partnerId === 'in_house');
      if (inHouse) return inHouse;
    }
    
    if (preferences.prioritizeSpeed) {
      // Sort by express delivery first, then estimated time
      return fullyAvailable.sort((a, b) => {
        if (a.delivery.isExpress && !b.delivery.isExpress) return -1;
        if (!a.delivery.isExpress && b.delivery.isExpress) return 1;
        return 0;
      })[0];
    }
    
    // Default: prioritize price
    return fullyAvailable[0];
  }
  
  /**
   * Create order with selected partner
   */
  async createOrder(
    partnerId: string,
    prescription: Prescription,
    deliveryAddress?: DeliveryAddress,
    paymentMethod: 'online' | 'on_delivery' | 'wallet' = 'online'
  ): Promise<PartnerOrder> {
    // In real implementation, this would use the partner's adapter
    const order: PartnerOrder = {
      id: `ORD-${Date.now().toString(36).toUpperCase()}`,
      partnerId,
      partnerOrderId: `${partnerId.toUpperCase()}-${Date.now()}`,
      prescriptionId: prescription.id,
      status: 'pending',
      fulfillmentType: deliveryAddress ? 'delivery' : 'in_house',
      items: prescription.drugs,
      pricing: {
        subtotal: prescription.drugs.reduce((sum, d) => sum + (d.quantity * 500), 0), // Mock
        deliveryFee: deliveryAddress ? 1500 : 0,
        serviceFee: 0,
        discount: 0,
        total: 0,
        currency: 'NGN',
      },
      delivery: deliveryAddress ? {
        address: deliveryAddress,
        estimatedTime: '2-4 hours',
      } : undefined,
      payment: {
        method: paymentMethod,
        status: 'pending',
      },
      trackingUrl: partnerId !== 'in_house' 
        ? `https://${partnerId}.com/track/${Date.now()}`
        : undefined,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    
    order.pricing.total = order.pricing.subtotal + order.pricing.deliveryFee;
    
    return order;
  }
  
  /**
   * Track order status
   */
  async trackOrder(partnerId: string, orderId: string): Promise<PartnerOrder> {
    // In real implementation, this would call the partner's API
    throw new Error('Not implemented');
  }
  
  // Mock implementation for development
  private async mockGetQuote(
    partner: PharmacyPartner,
    drugs: DrugItem[],
    location: GeoLocation
  ): Promise<PartnerQuote> {
    await new Promise((resolve) => setTimeout(resolve, 200));
    
    const items: DrugAvailability[] = drugs.map((drug) => ({
      drugId: drug.id,
      drugName: drug.name,
      available: partner.code === 'in_house' ? Math.random() > 0.3 : Math.random() > 0.15,
      quantity: drug.quantity,
      unitPrice: Math.floor(Math.random() * 2000) + 500,
      currency: 'NGN',
      alternatives: Math.random() > 0.6 ? [{
        name: `${drug.genericName || drug.name} (Generic)`,
        strength: drug.strength,
        unitPrice: Math.floor(Math.random() * 1000) + 300,
        isGeneric: true,
      }] : undefined,
    }));
    
    const subtotal = items.reduce((sum, item) => sum + (item.unitPrice * item.quantity), 0);
    const deliveryFee = partner.code === 'in_house' ? 0 : (Math.random() > 0.5 ? 1500 : 2000);
    
    return {
      partnerId: partner.id,
      partnerName: partner.name,
      partnerLogo: partner.logo,
      fulfillmentType: partner.code === 'in_house' ? 'in_house' : 'delivery',
      availability: {
        allAvailable: items.every((i) => i.available),
        items,
        unavailableCount: items.filter((i) => !i.available).length,
      },
      pricing: {
        subtotal,
        deliveryFee,
        serviceFee: 0,
        discount: 0,
        total: subtotal + deliveryFee,
        currency: 'NGN',
      },
      delivery: {
        estimatedTime: partner.features.expressDelivery ? '1-2 hours' : '2-4 hours',
        isExpress: partner.features.expressDelivery,
      },
      paymentMethods: [
        'online',
        ...(partner.features.payOnDelivery ? ['on_delivery' as const] : []),
      ],
      expiresAt: new Date(Date.now() + 30 * 60 * 1000).toISOString(), // 30 minutes
    };
  }
}

// ============================================================================
// Export singleton instance
// ============================================================================

export const pharmacyPartnerService = new PharmacyPartnerService();
export default pharmacyPartnerService;
