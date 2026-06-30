import { apiClient } from "@/lib/api/client";
import type {
  ExpensesListResponse,
  ExpenseResponse,
  ExpenseSummaryResponse,
  CreateExpenseRequest,
  UpdateExpenseRequest,
  ExpenseFilters,
} from "../types/expenses";

class ExpenseService {
  /** GET /expenses */
  async getAll(params?: ExpenseFilters, signal?: AbortSignal): Promise<ExpensesListResponse> {
    const q = new URLSearchParams();
    if (params?.pageNumber) q.append("PageNumber", String(params.pageNumber));
    if (params?.pageSize)   q.append("PageSize",   String(params.pageSize));
    if (params?.searchValue) q.append("SearchValue", params.searchValue);
    if (params?.sortColumn)  q.append("SortColumn",  params.sortColumn);
    if (params?.sortDirection) q.append("SortDirection", params.sortDirection);
    if (params?.from) q.append("from", params.from);
    if (params?.to)   q.append("to",   params.to);
    const res = await apiClient.get<ExpensesListResponse>(`/expenses?${q.toString()}`, { signal });
    return res.data;
  }

  /** GET /expenses/{id} */
  async getById(id: string): Promise<ExpenseResponse> {
    const res = await apiClient.get<ExpenseResponse>(`/expenses/${id}`);
    return res.data;
  }

  /** GET /expenses/summary */
  async getSummary(from?: string, to?: string): Promise<ExpenseSummaryResponse> {
    const q = new URLSearchParams();
    if (from) q.append("from", from);
    if (to)   q.append("to",   to);
    const res = await apiClient.get<ExpenseSummaryResponse>(`/expenses/summary?${q.toString()}`);
    return res.data;
  }

  /** POST /expenses */
  async create(body: CreateExpenseRequest): Promise<ExpenseResponse> {
    const res = await apiClient.post<ExpenseResponse>("/expenses", body);
    return res.data;
  }

  /** PUT /expenses/{id} */
  async update(id: string, body: UpdateExpenseRequest): Promise<void> {
    await apiClient.put(`/expenses/${id}`, body);
  }

  /** DELETE /expenses/{id} */
  async remove(id: string): Promise<void> {
    await apiClient.delete(`/expenses/${id}`);
  }
}

export const expenseService = new ExpenseService();
