import { makeRequest } from './config';
import { Product, UpdateProductRequest } from './types';

export const productsApi = {
  // Get all products
  async getAll(): Promise<Product[]> {
    return makeRequest<Product[]>('/products');
  },

  // Get single product by ID
  async getById(id: string): Promise<Product> {
    return makeRequest<Product>(`/products/${id}`);
  },

  // Create new product
  async create(product: Omit<Product, '_id' | 'id' | 'createdAt' | 'updatedAt'>): Promise<Product> {
    return makeRequest<Product>('/products', {
      method: 'POST',
      body: JSON.stringify(product),
    });
  },

  // Complete edit/update product function
  async update(id: string, updates: UpdateProductRequest): Promise<Product> {
    return makeRequest<Product>(`/products/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
  },

  // Partial update for specific fields
  async partialUpdate(id: string, updates: Partial<UpdateProductRequest>): Promise<Product> {
    return makeRequest<Product>(`/products/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(updates),
    });
  },

  // Delete product
  async delete(id: string): Promise<{ message: string }> {
    return makeRequest<{ message: string }>(`/products/${id}`, {
      method: 'DELETE',
    });
  },

  // Update stock quantity
  async updateStock(id: string, stockChange: number): Promise<Product> {
    return makeRequest<Product>(`/products/${id}/stock`, {
      method: 'PUT',
      body: JSON.stringify({ stockChange }),
    });
  },

  // Update pricing (purchased and selling prices)
  async updatePricing(id: string, pricing: { purchasedPrice?: number; sellingPrice?: number; basePrice?: number }): Promise<Product> {
    return makeRequest<Product>(`/products/${id}/pricing`, {
      method: 'PUT',
      body: JSON.stringify(pricing),
    });
  },

  // Search products by various criteria
  async search(query: {
    name?: string;
    brand?: string;
    category?: string;
    minPrice?: number;
    maxPrice?: number;
  }): Promise<Product[]> {
    const searchParams = new URLSearchParams();
    Object.entries(query).forEach(([key, value]) => {
      if (value !== undefined) {
        searchParams.append(key, value.toString());
      }
    });
    
    return makeRequest<Product[]>(`/products/search?${searchParams.toString()}`);
  },

  // Get products by category
  async getByCategory(category: string): Promise<Product[]> {
    return makeRequest<Product[]>(`/products/category/${encodeURIComponent(category)}`);
  },

  // Get low stock products
  async getLowStock(threshold: number = 10): Promise<Product[]> {
    return makeRequest<Product[]>(`/products/low-stock?threshold=${threshold}`);
  },

  // Bulk update products
  async bulkUpdate(updates: Array<{ id: string; updates: UpdateProductRequest }>): Promise<Product[]> {
    return makeRequest<Product[]>('/products/bulk-update', {
      method: 'PUT',
      body: JSON.stringify({ updates }),
    });
  },
  

  // Get available products for sales
  async getAvailable(): Promise<Product[]> {
    return makeRequest<Product[]>('/sales/products/available');
  },

  // Quick stock update for individual products
  async quickStockUpdate(id: string, stockChange: number): Promise<Product> {
    return makeRequest<Product>(`/products/${id}/stock`, {
      method: 'PUT',
      body: JSON.stringify({ stockChange }),
    });
  },

  // Update proportional pricing based on purchased price
  async updateProportionalPricing(id: string, purchasedPrice: number, profitMargin: number): Promise<Product> {
    const sellingPrice = purchasedPrice * (1 + profitMargin / 100);
    return makeRequest<Product>(`/products/${id}`, {
      method: 'PATCH',
      body: JSON.stringify({ 
        purchasedPrice, 
        sellingPrice: Math.round(sellingPrice * 100) / 100 
      }),
    });
  }
}; 