export interface Material {
  _id: string;
  name: string;
  category: string;
  subCategory?: string;
  description?: string;
  images?: string[];
  isRecyclable?: boolean;
  isHazardous?: boolean;
  processingTime?: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface MaterialCategoryItem {
  category: string;
  count?: number;
}

