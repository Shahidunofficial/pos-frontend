import { makeRequest } from './config';
import { Sale, CreateSaleRequest } from './types';

export const salesApi = {
  // Get all sales
  async getAll(): Promise<Sale[]> {
    return makeRequest<Sale[]>('/sales');
  },

  // Get single sale by ID
  async getById(id: string): Promise<Sale> {
    return makeRequest<Sale>(`/sales/${id}`);
  },

  // Create new sale
  async create(sale: CreateSaleRequest): Promise<Sale> {
    return makeRequest<Sale>('/sales', {
      method: 'POST',
      body: JSON.stringify(sale),
    });
  },

  // Update sale
  async update(id: string, updates: Partial<Sale>): Promise<Sale> {
    return makeRequest<Sale>(`/sales/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
  },

  // Delete sale
  async delete(id: string): Promise<{ message: string }> {
    return makeRequest<{ message: string }>(`/sales/${id}`, {
      method: 'DELETE',
    });
  },

  // Generate receipt for sale
  async generateReceipt(saleId: string): Promise<any> {
    return makeRequest<any>(`/sales/${saleId}/receipt`);
  },

  // Get printable receipt
  async getPrintReceipt(saleId: string): Promise<{ receiptText: string }> {
    return makeRequest<{ receiptText: string }>(`/sales/${saleId}/receipt/print`);
  },

  // Get sales within date range
  async getByDateRange(startDate: string, endDate: string): Promise<Sale[]> {
    return makeRequest<Sale[]>(`/sales/date-range?start=${startDate}&end=${endDate}`);
  },

  // Get sales report
  async getReport(filters?: {
    startDate?: string;
    endDate?: string;
    customerId?: string;
  }): Promise<{
    totalSales: number;
    totalRevenue: number;
    averageOrderValue: number;
    sales: Sale[];
  }> {
    const searchParams = new URLSearchParams();
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined) {
          searchParams.append(key, value);
        }
      });
    }
    
    return makeRequest(`/sales/report?${searchParams.toString()}`);
  }
}; 