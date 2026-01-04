import { makeRequest } from './config';

export interface SalesOverview {
  todaysSales: number;
  todaysRevenue: number;
  monthToDateSales: number;
  monthToDateRevenue: number;
  activeOrders: number;
  topSellingProducts: ProductSalesReport[];
}

export interface ProductSalesReport {
  productId: string;
  productName: string;
  quantitySold: number;
  totalRevenue: number;
  averagePrice: number;
}

export interface DailySalesReport {
  date: string;
  totalSales: number;
  totalRevenue: number;
  totalProfit: number;
  averageOrderValue: number;
  transactions: Sale[];
}

export interface MonthlySalesReport {
  month: string;
  year: number;
  totalSales: number;
  totalRevenue: number;
  averageOrderValue: number;
  dailyBreakdown: DailySalesReport[];
}

export interface Sale {
  id: string;
  items: Array<{
    productId: string;
    quantity: number;
    price: number;
  }>;
  total: number;
  profit: number;
  createdAt: string;
  customerName?: string;
  warrantyTerms?: string;
  termsAndConditions?: string;
}

export interface InventoryAnalysis {
  totalInvestedAmount: number;
  expectedProfit: number;
  currentStockValue: number;
  products: ProductInventoryDetail[];
}

export interface ProductInventoryDetail {
  productId: string;
  productName: string;
  currentStock: number;
  purchasePrice: number;
  sellingPrice: number;
  promotionalPrice?: number;
  expectedProfit: number;
  investedAmount: number;
}

export const SalesReportApi = {
  async getSalesOverview(): Promise<SalesOverview> {
    return makeRequest<SalesOverview>('/reports/overview');
  },

  async getDailySalesReport(date: string): Promise<DailySalesReport> {
    return makeRequest<DailySalesReport>(`/reports/daily?date=${date}`);
  },

  async getMonthlySalesReport(month: number, year: number): Promise<MonthlySalesReport> {
    return makeRequest<MonthlySalesReport>(`/reports/monthly?month=${month}&year=${year}`);
  },

  async getInventoryAnalysis(): Promise<InventoryAnalysis> {
    return makeRequest<InventoryAnalysis>('/reports/inventory-analysis');
  },

  async getStockValue(): Promise<number> {
    const analysis = await this.getInventoryAnalysis();
    return analysis.currentStockValue;
  },

  async getExpectedProfit(): Promise<number> {
    const analysis = await this.getInventoryAnalysis();
    return analysis.expectedProfit;
  },

  async getProfitOfTheDay(): Promise<number> {
    const overview = await this.getSalesOverview();
    return overview.todaysRevenue;
  },

  async getProfitOfTheMonth(): Promise<number> {
    const overview = await this.getSalesOverview();
    return overview.monthToDateRevenue;
  },

  async getDateRangeSales(startDate: string, endDate: string): Promise<Sale[]> {
    return makeRequest<Sale[]>(`/reports/date-range?startDate=${startDate}&endDate=${endDate}`);
  }
};