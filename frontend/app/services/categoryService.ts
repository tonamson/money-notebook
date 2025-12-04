import { BaseApi, ApiResponse } from "./api";

export type CategoryType = "income" | "expense";

export interface Category {
  id: number;
  name: string;
  type: CategoryType;
  icon?: string;
  color?: string;
  sortOrder: number;
  isDefault: boolean;
  createdAt: string;
}

export interface CreateCategoryDto {
  name: string;
  type: CategoryType;
  icon?: string;
  color?: string;
  sortOrder?: number;
}

export interface UpdateCategoryDto {
  name?: string;
  icon?: string;
  color?: string;
  sortOrder?: number;
}

class CategoryService extends BaseApi {
  constructor() {
    super();
  }

  // Get all categories by type
  async getCategories(type?: CategoryType): Promise<ApiResponse<Category[]>> {
    const url = type ? `/categories?type=${type}` : "/categories";
    return this.get<Category[]>(url);
  }

  // Get all categories
  async getAllCategories(): Promise<ApiResponse<Category[]>> {
    return this.get<Category[]>("/categories");
  }

  // Get single category
  async getCategory(id: number): Promise<ApiResponse<Category>> {
    return this.get<Category>(`/categories/${id}`);
  }

  // Create new category
  async createCategory(
    data: CreateCategoryDto
  ): Promise<ApiResponse<Category>> {
    return this.post<Category>("/categories", data);
  }

  // Update category
  async updateCategory(
    id: number,
    data: UpdateCategoryDto
  ): Promise<ApiResponse<Category>> {
    return this.put<Category>(`/categories/${id}`, data);
  }

  // Delete category
  async deleteCategory(id: number): Promise<ApiResponse<void>> {
    return this.delete<void>(`/categories/${id}`);
  }

  // Check if category exists
  async checkExists(
    name: string,
    type: CategoryType
  ): Promise<ApiResponse<{ exists: boolean }>> {
    return this.get<{ exists: boolean }>(
      `/categories/check?name=${encodeURIComponent(name)}&type=${type}`
    );
  }
}

// Export singleton instance
export const categoryService = new CategoryService();
