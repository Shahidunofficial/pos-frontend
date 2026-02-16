import { API_BASE_URL } from './config';
import { Product } from './types';

// Google Merchant API v1 - replaces deprecated Content API
// Reference: https://developers.google.com/merchant/api/guides/data-sources/api-sources

export interface DataSource {
  name: string;
  dataSourceId: string;
  displayName: string;
  input: 'API' | 'FILE' | 'UI';
}

export interface MerchantProduct {
  offerId: string;
  contentLanguage: string;
  feedLabel: string;
  dataSource: string; // Reference to data source
  attributes: {
    title: string;
    description: string;
    link: string;
    imageLink: string;
    price: {
      value: string;
      currency: string;
    };
    availability: 'in stock' | 'out of stock' | 'preorder';
    brand?: string;
    condition?: 'new' | 'refurbished' | 'used';
    gtin?: string;
    mpn?: string;
  };
}

export interface SyncProductRequest {
  product: Product;
  accessToken: string;
  merchantId: string;
}

export interface SyncResult {
  success: boolean;
  data?: any;
  error?: string;
  details?: any;
}

export const merchantApi = {
  /**
   * Create a Data Source (required before uploading products)
   * Reference: https://developers.google.com/merchant/api/guides/data-sources/api-sources
   */
  async createDataSource(
    merchantId: string,
    accessToken: string,
    displayName: string = 'POS API Data Source'
  ): Promise<SyncResult> {
    try {
      const response = await fetch(`${API_BASE_URL}/merchant/create-datasource`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          merchantId,
          accessToken,
          displayName,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        return {
          success: false,
          error: errorData.error || 'Failed to create data source',
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
   * Sync a single product to Google Merchant Center using new Merchant API v1
   * Reference: https://developers.google.com/merchant/api/guides/products/add-manage
   */
  async syncProduct(request: SyncProductRequest): Promise<SyncResult> {
    try {
      const { product, accessToken, merchantId } = request;
      
      // Transform product to Google Merchant API v1 format
      const merchantProduct: MerchantProduct = {
        offerId: (product._id || product.id || ''),
        contentLanguage: 'en',
        feedLabel: 'LK', // Sri Lanka
        dataSource: 'accounts/{MERCHANT_ID}/dataSources/{DATASOURCE_ID}',
        attributes: {
          title: product.name,
          description: product.description,
          link: `https://cellcare.lk/products/${product._id || product.id || 'product'}`,
          imageLink: product.images?.[0] || '',
          price: {
            value: product.sellingPrice.toString(),
            currency: 'LKR',
          },
          availability: 'in stock' as const,
          brand: product.brand,
          condition: 'new' as const,
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
          merchantId,
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
    merchantId: string,
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
      const result = await this.syncProduct({ product, accessToken, merchantId });
      results.push(result);

      // Wait 2 seconds between requests to avoid rate limiting
      if (i < products.length - 1) {
        await new Promise(resolve => setTimeout(resolve, 2000));
      }
    }

    return results;
  },
};

