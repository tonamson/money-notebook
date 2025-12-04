import { BaseApi, ApiResponse } from "./api";
import { CategoryType } from "./categoryService";

export interface Transaction {
  id: number;
  type: CategoryType;
  amount: number;
  categoryId: number;
  categoryName: string;
  note?: string;
  transactionDate: string;
  createdAt: string;
}

export interface TransactionStats {
  totalIncome: number;
  totalExpense: number;
  balance: number;
  startDate: string;
  endDate: string;
}

export interface CreateTransactionDto {
  type: CategoryType;
  amount: number;
  categoryId: number;
  note?: string;
  transactionDate: string;
}

export interface UpdateTransactionDto {
  type?: CategoryType;
  amount?: number;
  categoryId?: number;
  note?: string;
  transactionDate?: string;
}

export interface TransactionFilter {
  startDate?: string;
  endDate?: string;
  type?: CategoryType;
  categoryId?: number;
  page?: number;
  limit?: number;
}

export interface TransactionListResponse {
  data: Transaction[];
  meta: {
    total: number;
    page: number;
    limit: number;
  };
}

class TransactionService extends BaseApi {
  constructor() {
    super();
  }

  // Get transactions with filter
  async getTransactions(
    filter?: TransactionFilter
  ): Promise<
    ApiResponse<Transaction[]> & {
      meta?: { total: number; page: number; limit: number };
    }
  > {
    const params = new URLSearchParams();

    if (filter?.startDate) params.append("startDate", filter.startDate);
    if (filter?.endDate) params.append("endDate", filter.endDate);
    if (filter?.type) params.append("type", filter.type);
    if (filter?.categoryId)
      params.append("categoryId", String(filter.categoryId));
    if (filter?.page) params.append("page", String(filter.page));
    if (filter?.limit) params.append("limit", String(filter.limit));

    const queryString = params.toString();
    const url = queryString ? `/transactions?${queryString}` : "/transactions";

    return this.get<Transaction[]>(url);
  }

  // Get single transaction
  async getTransaction(id: number): Promise<ApiResponse<Transaction>> {
    return this.get<Transaction>(`/transactions/${id}`);
  }

  // Get transaction statistics
  async getStats(
    startDate: string,
    endDate: string
  ): Promise<ApiResponse<TransactionStats>> {
    return this.get<TransactionStats>(
      `/transactions/stats?startDate=${startDate}&endDate=${endDate}`
    );
  }

  // Create transaction
  async createTransaction(
    data: CreateTransactionDto
  ): Promise<ApiResponse<Transaction>> {
    return this.post<Transaction>("/transactions", data);
  }

  // Update transaction
  async updateTransaction(
    id: number,
    data: UpdateTransactionDto
  ): Promise<ApiResponse<Transaction>> {
    return this.put<Transaction>(`/transactions/${id}`, data);
  }

  // Delete transaction
  async deleteTransaction(id: number): Promise<ApiResponse<void>> {
    return this.delete<void>(`/transactions/${id}`);
  }
}

// Export singleton instance
export const transactionService = new TransactionService();
