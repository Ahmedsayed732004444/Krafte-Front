import type { PaginatedResponse } from "@/shared/types/pagination";

// ─── Expense Response ───────────────────────────────────────────────
export interface ExpenseResponse {
  id: string;
  title: string;
  amount: number;
  notes?: string | null;
  expenseDate: string;
  createdAt: string;
}

export type ExpensesListResponse = PaginatedResponse<ExpenseResponse>;

// ─── Expense Summary ────────────────────────────────────────────────
export interface ExpenseSummaryResponse {
  totalExpenses: number;
  totalCount: number;
  recentItems: ExpenseResponse[];
  from?: string | null;
  to?: string | null;
}

// ─── Requests ──────────────────────────────────────────────────────
export interface CreateExpenseRequest {
  title: string;
  amount: number;
  notes?: string | null;
  expenseDate?: string | null;
}

export interface UpdateExpenseRequest {
  title: string;
  amount: number;
  notes?: string | null;
  expenseDate: string;
}

// ─── Filters ────────────────────────────────────────────────────────
export interface ExpenseFilters {
  pageNumber?: number;
  pageSize?: number;
  searchValue?: string;
  sortColumn?: string;
  sortDirection?: "Asc" | "Desc";
  from?: string;
  to?: string;
}
