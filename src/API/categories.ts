import { makeRequest } from './config';
import { Category, CreateCategoryRequest } from './types';

export const categoriesApi = {
  // Get all categories
  async getAll(): Promise<Category[]> {
    return makeRequest<Category[]>('/categories');
  },

  // Get single category by ID
  async getById(id: string): Promise<Category> {
    return makeRequest<Category>(`/categories/${id}`);
  },

  // Create new category
  async create(category: CreateCategoryRequest): Promise<Category> {
    return makeRequest<Category>('/categories', {
      method: 'POST',
      body: JSON.stringify(category),
    });
  },

  // Update category
  async update(id: string, updates: Partial<CreateCategoryRequest>): Promise<Category> {
    return makeRequest<Category>(`/categories/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
  },

  // Delete category
  async delete(id: string): Promise<{ message: string }> {
    return makeRequest<{ message: string }>(`/categories/${id}`, {
      method: 'DELETE',
    });
  },

  // Get categories by level
  async getByLevel(level: number): Promise<Category[]> {
    return makeRequest<Category[]>(`/categories/level/${level}`);
  },

  // Get subcategories of a parent category
  async getSubcategories(parentId: string): Promise<Category[]> {
    return makeRequest<Category[]>(`/categories/${parentId}/subcategories`);
  },

  // Get category hierarchy
  async getHierarchy(): Promise<Category[]> {
    return makeRequest<Category[]>('/categories/hierarchy');
  }
}; 