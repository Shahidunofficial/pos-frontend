import { makeRequest, API_BASE_URL } from './config';
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

  // Create new product with image files (uploads to AWS S3)
  async create(product: Omit<Product, '_id' | 'id' | 'createdAt' | 'updatedAt'>, imageFiles?: File[]): Promise<Product> {
    // If image files are provided, use FormData
    if (imageFiles && imageFiles.length > 0) {
      console.log('🖼️  Frontend: Creating product with image files:', {
        productName: product.name,
        filesCount: imageFiles.length,
        files: imageFiles.map(f => ({ name: f.name, size: f.size, type: f.type }))
      });

      const formData = new FormData();
      
      imageFiles.forEach((file, index) => {
        console.log(`📎 Appending file ${index + 1}:`, file.name);
        formData.append('images', file);
      });
      
      formData.append('name', product.name);
      formData.append('brand', product.brand);
      formData.append('basePrice', product.basePrice.toString());
      formData.append('purchasedPrice', product.purchasedPrice.toString());
      formData.append('sellingPrice', product.sellingPrice.toString());
      formData.append('mainCategory', product.mainCategory);
      if (product.subCategory) formData.append('subCategory', product.subCategory);
      if (product.subSubCategory) formData.append('subSubCategory', product.subSubCategory);
      formData.append('description', product.description);
      if (product.specifications) formData.append('specifications', JSON.stringify(product.specifications));
      if (product.availableOptions) formData.append('availableOptions', JSON.stringify(product.availableOptions));
      if (product.variants) formData.append('variants', JSON.stringify(product.variants));

      const token = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null;
      
      console.log('📤 Sending FormData to backend...');
      const response = await fetch(`${API_BASE_URL}/products`, {
        method: 'POST',
        headers: { ...(token ? { Authorization: `Bearer ${token}` } : {}) },
        body: formData,
      });

      console.log('📥 Response status:', response.status);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('❌ Error response:', errorData);
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }
      
      const result = await response.json();
      console.log('✅ Product created successfully:', result._id);
      return result;
    }
    
    // Otherwise, use JSON (for pre-uploaded image URLs)
    console.log('📝 Creating product with image URLs (no files)');
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

  // Get available products for sales
  async getAvailable(): Promise<Product[]> {
    return makeRequest<Product[]>('/sales/products/available');
  },
};
