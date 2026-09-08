export type MLValidCategory =
  | 'Battery'
  | 'CRT'
  | 'LCD_LED'
  | 'Motors'
  | 'PCB'
  | 'Plastic'
  | 'Wires'
  | string;

export interface MLClassificationResult {
  category: string;
  confidence: number;
  confidence_percent: number;
}

export interface MLPricingData {
  category: string;
  recommended_rate_inr: number;
  unit: string;
  estimated_value_inr: number;
  estimated_value_min_inr: number;
  estimated_value_max_inr: number;
  match_level?: string;
}

export interface MLPriceResult {
  classification?: Record<string, any>;
  pricing: MLPricingData;
}

export interface MLPriceRequestPayload {
  category: string;
  state: string;
  city: string;
  quantity: number;
  total_weight_kg: number;
}

