import { BaseApi, ApiResponse } from "./api";

export interface Category {
  id: string;
  name: string;
  type: "income" | "expense";
  createdAt: string;
}

// Mock data - sẽ được thay thế bằng API thật
const mockIncomeCategories: Category[] = [
  {
    id: "1",
    name: "Lương",
    type: "income",
    createdAt: new Date().toISOString(),
  },
  {
    id: "2",
    name: "Thưởng",
    type: "income",
    createdAt: new Date().toISOString(),
  },
  {
    id: "3",
    name: "Đầu tư",
    type: "income",
    createdAt: new Date().toISOString(),
  },
  {
    id: "4",
    name: "Bán hàng",
    type: "income",
    createdAt: new Date().toISOString(),
  },
  {
    id: "5",
    name: "Cho thuê",
    type: "income",
    createdAt: new Date().toISOString(),
  },
  {
    id: "6",
    name: "Khác",
    type: "income",
    createdAt: new Date().toISOString(),
  },
];

const mockExpenseCategories: Category[] = [
  {
    id: "7",
    name: "Ăn uống",
    type: "expense",
    createdAt: new Date().toISOString(),
  },
  {
    id: "8",
    name: "Di chuyển",
    type: "expense",
    createdAt: new Date().toISOString(),
  },
  {
    id: "9",
    name: "Mua sắm",
    type: "expense",
    createdAt: new Date().toISOString(),
  },
  {
    id: "10",
    name: "Hóa đơn",
    type: "expense",
    createdAt: new Date().toISOString(),
  },
  {
    id: "11",
    name: "Giải trí",
    type: "expense",
    createdAt: new Date().toISOString(),
  },
  {
    id: "12",
    name: "Sức khỏe",
    type: "expense",
    createdAt: new Date().toISOString(),
  },
  {
    id: "13",
    name: "Giáo dục",
    type: "expense",
    createdAt: new Date().toISOString(),
  },
  {
    id: "14",
    name: "Khác",
    type: "expense",
    createdAt: new Date().toISOString(),
  },
];

class CategoryService extends BaseApi {
  private mockIncome = [...mockIncomeCategories];
  private mockExpense = [...mockExpenseCategories];
  private useMock = true; // Set to false when API is ready

  constructor() {
    super();
  }

  // Get all categories by type
  async getCategories(
    type: "income" | "expense"
  ): Promise<ApiResponse<Category[]>> {
    if (this.useMock) {
      // Mock response
      return {
        success: true,
        data: type === "income" ? this.mockIncome : this.mockExpense,
      };
    }

    return this.get<Category[]>(`/categories?type=${type}`);
  }

  // Get all categories
  async getAllCategories(): Promise<ApiResponse<Category[]>> {
    if (this.useMock) {
      return {
        success: true,
        data: [...this.mockIncome, ...this.mockExpense],
      };
    }

    return this.get<Category[]>("/categories");
  }

  // Create new category
  async createCategory(
    name: string,
    type: "income" | "expense"
  ): Promise<ApiResponse<Category>> {
    if (this.useMock) {
      // Simulate API delay
      await new Promise((resolve) => setTimeout(resolve, 300));

      const newCategory: Category = {
        id: Date.now().toString(),
        name,
        type,
        createdAt: new Date().toISOString(),
      };

      if (type === "income") {
        this.mockIncome.push(newCategory);
      } else {
        this.mockExpense.push(newCategory);
      }

      return {
        success: true,
        data: newCategory,
        message: "Tạo danh mục thành công",
      };
    }

    return this.post<Category>("/categories", { name, type });
  }

  // Delete category
  async deleteCategory(id: string): Promise<ApiResponse<void>> {
    if (this.useMock) {
      await new Promise((resolve) => setTimeout(resolve, 200));

      this.mockIncome = this.mockIncome.filter((c) => c.id !== id);
      this.mockExpense = this.mockExpense.filter((c) => c.id !== id);

      return {
        success: true,
        message: "Xóa danh mục thành công",
      };
    }

    return this.delete<void>(`/categories/${id}`);
  }

  // Update category
  async updateCategory(
    id: string,
    name: string
  ): Promise<ApiResponse<Category>> {
    if (this.useMock) {
      await new Promise((resolve) => setTimeout(resolve, 200));

      let updatedCategory: Category | undefined;

      this.mockIncome = this.mockIncome.map((c) => {
        if (c.id === id) {
          updatedCategory = { ...c, name };
          return updatedCategory;
        }
        return c;
      });

      this.mockExpense = this.mockExpense.map((c) => {
        if (c.id === id) {
          updatedCategory = { ...c, name };
          return updatedCategory;
        }
        return c;
      });

      if (updatedCategory) {
        return {
          success: true,
          data: updatedCategory,
          message: "Cập nhật danh mục thành công",
        };
      }

      return {
        success: false,
        error: "Không tìm thấy danh mục",
      };
    }

    return this.put<Category>(`/categories/${id}`, { name });
  }

  // Check if category exists
  async categoryExists(
    name: string,
    type: "income" | "expense"
  ): Promise<boolean> {
    if (this.useMock) {
      const categories = type === "income" ? this.mockIncome : this.mockExpense;
      return categories.some(
        (c) => c.name.toLowerCase() === name.toLowerCase()
      );
    }

    const response = await this.get<{ exists: boolean }>(
      `/categories/check?name=${encodeURIComponent(name)}&type=${type}`
    );
    return response.data?.exists ?? false;
  }
}

// Export singleton instance
export const categoryService = new CategoryService();
