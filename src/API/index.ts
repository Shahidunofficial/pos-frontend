// Export all API modules
export { productsApi } from './products';
export { salesApi } from './sales';
export { categoriesApi } from './categories';

// Export types
export * from './types';

// Export config
export { API_BASE_URL, makeRequest } from './config';

// Legacy compatibility - export a combined apiService object
import { productsApi } from './products';
import { salesApi } from './sales';
import { categoriesApi } from './categories';

export const apiService = {
  // Products
  getProducts: productsApi.getAll,
  getProduct: productsApi.getById,
  createProduct: productsApi.create,
  updateProduct: productsApi.update,
  deleteProduct: productsApi.delete,
  updateProductStock: productsApi.updateStock,
  getAvailableProducts: productsApi.getAvailable,

  // Sales
  getSales: salesApi.getAll,
  getSale: salesApi.getById,
  createSale: salesApi.create,
  generateReceipt: salesApi.generateReceipt,
  getPrintReceipt: salesApi.getPrintReceipt,

  // Categories
  getCategories: categoriesApi.getAll,
  createCategory: categoriesApi.create,
}; 