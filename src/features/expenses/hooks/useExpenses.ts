import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { expenseService } from "../services/expenseService";
import { extractErrorMessage } from "@/lib/api/client";
import type { ExpenseFilters } from "../types/expenses";
import type { CreateExpenseRequest, UpdateExpenseRequest } from "../types/expenses";

const QK = "expenses";

// ─── Queries ───────────────────────────────────────────────────────

export const useGetExpenses = (params?: ExpenseFilters) =>
  useQuery({
    queryKey: [QK, params],
    queryFn: ({ signal }) => expenseService.getAll(params, signal),
  });

export const useGetExpenseById = (id: string) =>
  useQuery({
    queryKey: [QK, id],
    queryFn: () => expenseService.getById(id),
    enabled: !!id,
  });

export const useGetExpenseSummary = (from?: string, to?: string) =>
  useQuery({
    queryKey: [QK, "summary", from, to],
    queryFn: () => expenseService.getSummary(from, to),
  });

// ─── Mutations ─────────────────────────────────────────────────────

export const useCreateExpense = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: CreateExpenseRequest) => expenseService.create(body),
    onSuccess: () => {
      toast.success("تم تسجيل المصروف بنجاح ✓");
      qc.invalidateQueries({ queryKey: [QK] });
    },
    onError: (err) => toast.error(extractErrorMessage(err)),
  });
};

export const useUpdateExpense = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, body }: { id: string; body: UpdateExpenseRequest }) =>
      expenseService.update(id, body),
    onSuccess: () => {
      toast.success("تم تعديل المصروف بنجاح ✓");
      qc.invalidateQueries({ queryKey: [QK] });
    },
    onError: (err) => toast.error(extractErrorMessage(err)),
  });
};

export const useDeleteExpense = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => expenseService.remove(id),
    onSuccess: () => {
      toast.success("تم حذف المصروف بنجاح ✓");
      qc.invalidateQueries({ queryKey: [QK] });
    },
    onError: (err) => toast.error(extractErrorMessage(err)),
  });
};
