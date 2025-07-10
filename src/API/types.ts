export interface ProductVariant {
  id: string;
  color?: string;
  ram?: string;
  storage?: string;
  purchasedPrice: number;
  sellingPrice: number;
  stock: number;
}

export interface Product {
  _id?: string;
  id?: string;
  name: string;
  brand: string;
  basePrice: number;
  purchasedPrice: number;
  sellingPrice: number;
  mainCategory: string;
  subCategory?: string;
  subSubCategory?: string;
  description: string;
  images: string[];
  specifications?: Record<string, string>;
  availableOptions: {
    color?: string[];
    ram?: string[];
    storage?: string[];
  };
  variants: ProductVariant[];
  createdAt?: string;
  updatedAt?: string;
}

export interface Sale {
  _id?: string;
  id?: string;
  items: Array<{
    productId: string;
    quantity: number;
    price: number;
  }>;
  total: number;
  customerName?: string;
  createdAt?: string;
}

export interface CreateSaleRequest {
  items: Array<{
    productId: string;
    quantity: number;
  }>;
  customerName?: string;
}

export interface Category {
  id: string;
  name: string;
  level: number;
  parentId?: string;
  subCategories: Category[];
}

export interface CreateCategoryRequest {
  name: string;
  parentId?: string;
  level: number;
}

export interface UpdateProductRequest {
  name?: string;
  brand?: string;
  basePrice?: number;
  purchasedPrice?: number;
  sellingPrice?: number;
  mainCategory?: string;
  subCategory?: string;
  subSubCategory?: string;
  description?: string;
  images?: string[];
  specifications?: Record<string, string>;
  availableOptions?: {
    color?: string[];
    ram?: string[];
    storage?: string[];
  };
  variants?: ProductVariant[];
} 