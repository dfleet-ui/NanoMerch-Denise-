
export interface GeneratedImage {
  id: string;
  url: string;
  prompt: string;
  timestamp: number;
  scenarioType: 'preset' | 'custom';
  scenarioId?: string;       // Now properly stored
  colorLabel?: string;       // e.g. "Navy Blue"
  colorHex?: string;         // e.g. "#172554"
}

export interface ScenarioOption {
  label: string;
  value: string;
  hex: string;
}

export interface PricingTier {
  qty: string;
  price: string;
}

export interface Scenario {
  id: string;
  name: string;
  description: string;
  iconName: string;
  promptTemplate: string;
  options?: {
    colors?: ScenarioOption[];
  };
  defaultSpecs?: {
    price: string;
    features: string[];
    pricingTiers?: PricingTier[];
  };
}

export interface StoryboardItem {
  id: string;
  image: GeneratedImage;
  title: string;
  description: string;
  features: string;
  price: string;
  pricingTiers: PricingTier[];
}

export type GenerationStatus = 'idle' | 'loading' | 'success' | 'error';

export interface BrandSettings {
  line1: string;
  line2: string;
  line3: string;
  contactInfo: string;
  footerNote: string;
}

export const DEFAULT_BRAND_SETTINGS: BrandSettings = {
  line1: 'ISLAND',
  line2: 'WIDE',
  line3: 'promotions',
  contactInfo: 'Denise Fleet | denise@iwpromotions.ca | (709) 743-3763',
  footerNote: "Pricing for setups are based on specific logo placements for quotation purposes; subject to change with finalized artwork and design. Pricing for freight is based on entire order shipping to St. John's, Newfoundland and Labrador; subject to change if multiple locations required or for areas outside shipping point. Pricing is valid for 30 days.",
};

export const UCW_BRAND_SETTINGS: BrandSettings = {
  line1: 'UNIVERSAL',
  line2: 'CORPORATE',
  line3: 'wear',
  contactInfo: 'Universal Corporate Wear | info@ucwear.ca | (709) 368-0400',
  footerNote: "Pricing for setups are based on specific logo placements for quotation purposes; subject to change with finalized artwork and design. Pricing for freight is based on entire order shipping to St. John's, Newfoundland and Labrador; subject to change if multiple locations required or for areas outside shipping point. Pricing is valid for 30 days.",
};

declare global {
  interface Window {
    html2pdf: any;
  }
}
