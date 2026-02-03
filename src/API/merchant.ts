import { API_BASE_URL } from './config';
import { Product } from './types';

export interface MerchantProduct {
  offerId: string;
  contentLanguage: string;
  feedLabel: string;
  name: string;
  productAttributes: {
    brand: string;
    description: string;
    imageLink: string;
    link: string;
    price: {
      value: string;
      currency: string;
    };
    availability: 'in stock' | 'out of stock' | 'preorder';
    condition: 'new' | 'refurbished' | 'used';
    gender?: 'MALE' | 'FEMALE' | 'UNISEX';
  };
}

export interface SyncProductRequest {
  product: Product;
  accessToken: string;
  merchantId?: string;
}

export interface SyncResult {
  success: boolean;
  data?: any;
  error?: string;
  details?: any;
}

export const merchantApi = {
  /**
   * Sync a single product to Google Merchant Center
   */
  async syncProduct(request: SyncProductRequest): Promise<SyncResult> {
    try {
      const { product, accessToken } = request;
      
      // Transform product to Google Merchant format
      const merchantProduct: MerchantProduct = {
        offerId: product._id || product.id,
        contentLanguage: 'en',
        feedLabel: 'LK', // Sri Lanka
        name: product.name,
        productAttributes: {
          brand: product.brand,
          description: product.description,
          imageLink: product.images?.[0] || '',
          link: `https://cellcare.lk/products/${product.slug || product._id}`,
          price: {
            value: product.sellingPrice.toString(),
            currency: 'LKR',
          },
          availability: 'in stock' as const,
          condition: 'new' as const,
          gender: 'UNISEX' as const,
        },
      };

      const response = await fetch(`${API_BASE_URL}/merchant/sync-product`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          merchantProduct,
          accessToken,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        return {
          success: false,
          error: errorData.error || `HTTP error! status: ${response.status}`,
          details: errorData,
        };
      }

      const result = await response.json();
      return {
        success: true,
        data: result,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  },

  /**
   * Sync multiple products to Google Merchant Center
   */
  async syncMultipleProducts(
    products: Product[],
    accessToken: string,
    onProgress?: (current: number, total: number) => void
  ): Promise<SyncResult[]> {
    const results: SyncResult[] = [];

    for (let i = 0; i < products.length; i++) {
      const product = products[i];
      
      // Update progress
      if (onProgress) {
        onProgress(i + 1, products.length);
      }

      // Sync product
      const result = await this.syncProduct({ product, accessToken });
      results.push(result);

      // Wait 2 seconds between requests to avoid rate limiting
      if (i < products.length - 1) {
        await new Promise(resolve => setTimeout(resolve, 2000));
      }
    }

    return results;
  },
};

