import { useState, useMemo } from "react";
import {
  useGetExpenses,
  useGetExpenseSummary,
  useCreateExpense,
  useUpdateExpense,
  useDeleteExpense,
} from "../hooks/useExpenses";
import type { ExpenseResponse } from "../types/expenses";
import {
  Wallet,
  Plus,
  Pencil,
  Trash2,
  Loader2,
  Search,
  TrendingDown,
  Calendar,
  FileText,
  AlertTriangle,
  ChevronRight,
  ChevronLeft,
  X,
  Check,
} from "lucide-react";
import { cn } from "@/lib/utils";

// ─────────────────────────────────────────────────────────────────────────────
// Helper Components
// ─────────────────────────────────────────────────────────────────────────────

function Modal({
  title,
  onClose,
  children,
}: {
  title: string;
  onClose: () => void;
  children: React.ReactNode;
}) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md bg-card border border-border rounded-2xl shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-5 pt-5 pb-3 border-b border-border">
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg hover:bg-accent flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
          <span className="font-black text-sm text-foreground">{title}</span>
        </div>
        <div className="p-5">{children}</div>
      </div>
    </div>
  );
}

function InputField({
  label,
  required,
  error,
  children,
}: {
  label: string;
  required?: boolean;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <label className="block text-xs font-semibold text-muted-foreground text-right">
        {label} {required && <span className="text-destructive">*</span>}
      </label>
      {children}
      {error && <p className="text-xs text-destructive text-right">{error}</p>}
    </div>
  );
}

const inputCls =
  "w-full h-11 px-4 rounded-xl bg-background border border-border text-foreground text-sm font-semibold outline-none focus:ring-2 focus:ring-primary transition-all text-right placeholder:font-normal";

// ─────────────────────────────────────────────────────────────────────────────
// Expense Form Modal (Create / Edit)
// ─────────────────────────────────────────────────────────────────────────────

interface ExpenseFormModalProps {
  mode: "create" | "edit";
  initial?: ExpenseResponse;
  onClose: () => void;
}

function ExpenseFormModal({ mode, initial, onClose }: ExpenseFormModalProps) {
  const [title, setTitle] = useState(initial?.title ?? "");
  const [amount, setAmount] = useState<number>(initial?.amount ?? 0);
  const [notes, setNotes] = useState(initial?.notes ?? "");
  const [expenseDate, setExpenseDate] = useState(
    initial?.expenseDate
      ? new Date(initial.expenseDate).toISOString().slice(0, 10)
      : new Date().toISOString().slice(0, 10)
  );
  const [errors, setErrors] = useState<Record<string, string>>({});

  const createM = useCreateExpense();
  const updateM = useUpdateExpense();
  const isPending = createM.isPending || updateM.isPending;

  const validate = () => {
    const e: Record<string, string> = {};
    if (!title.trim()) e.title = "العنوان مطلوب";
    if (!amount || amount <= 0) e.amount = "المبلغ يجب أن يكون أكبر من صفر";
    if (!expenseDate) e.expenseDate = "التاريخ مطلوب";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    try {
      if (mode === "create") {
        await createM.mutateAsync({
          title: title.trim(),
          amount,
          notes: notes.trim() || null,
          expenseDate,
        });
      } else {
        await updateM.mutateAsync({
          id: initial!.id,
          body: {
            title: title.trim(),
            amount,
            notes: notes.trim() || null,
            expenseDate,
          },
        });
      }
      onClose();
    } catch {
      // handled by mutation
    }
  };

  return (
    <Modal
      title={mode === "create" ? "إضافة مصروف جديد" : "تعديل المصروف"}
      onClose={onClose}
    >
      <div className="space-y-4 text-right" dir="rtl">
        <InputField label="عنوان المصروف" required error={errors.title}>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="مثال: فاتورة كهرباء، صيانة..."
            className={inputCls}
          />
        </InputField>

        <InputField label="المبلغ (د.ك)" required error={errors.amount}>
          <input
            type="number"
            step="0.001"
            min="0"
            value={amount}
            onChange={(e) => setAmount(Number(e.target.value))}
            className={cn(inputCls, "font-mono")}
          />
        </InputField>

        <InputField label="تاريخ المصروف" required error={errors.expenseDate}>
          <input
            type="date"
            value={expenseDate}
            onChange={(e) => setExpenseDate(e.target.value)}
            className={inputCls}
          />
        </InputField>

        <InputField label="ملاحظات (اختياري)">
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={3}
            placeholder="أي تفاصيل إضافية عن المصروف..."
            className="w-full p-4 rounded-xl bg-background border border-border text-foreground text-sm font-semibold outline-none focus:ring-2 focus:ring-primary transition-all resize-none text-right placeholder:font-normal"
          />
        </InputField>

        <button
          onClick={handleSubmit}
          disabled={isPending}
          className="w-full h-11 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground font-bold flex items-center justify-center gap-2 transition-all disabled:opacity-60 text-sm cursor-pointer"
        >
          {isPending ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Check className="w-4 h-4" />
          )}
          {mode === "create" ? "إضافة المصروف" : "حفظ التعديلات"}
        </button>
      </div>
    </Modal>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Delete Confirm Modal
// ─────────────────────────────────────────────────────────────────────────────

function DeleteModal({
  expense,
  onClose,
}: {
  expense: ExpenseResponse;
  onClose: () => void;
}) {
  const deleteM = useDeleteExpense();

  const handleDelete = async () => {
    try {
      await deleteM.mutateAsync(expense.id);
      onClose();
    } catch {
      // handled
    }
  };

  return (
    <Modal title="تأكيد حذف المصروف" onClose={onClose}>
      <div className="space-y-5 text-right" dir="rtl">
        <div className="flex flex-col items-center gap-3 py-2">
          <div className="w-14 h-14 rounded-2xl bg-destructive/10 border border-destructive/20 flex items-center justify-center">
            <AlertTriangle className="w-7 h-7 text-destructive" />
          </div>
          <p className="text-sm text-muted-foreground font-semibold text-center">
            هل أنت متأكد من حذف مصروف{" "}
            <span className="text-foreground font-black">"{expense.title}"</span>؟
            <br />
            <span className="text-xs text-destructive/80 mt-1 block">
              لا يمكن التراجع عن هذا الإجراء
            </span>
          </p>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={onClose}
            className="h-11 rounded-xl bg-accent border border-border text-sm font-bold text-foreground hover:bg-accent/80 transition-all cursor-pointer"
          >
            إلغاء
          </button>
          <button
            onClick={handleDelete}
            disabled={deleteM.isPending}
            className="h-11 rounded-xl bg-destructive hover:bg-destructive/90 text-white font-bold flex items-center justify-center gap-2 transition-all disabled:opacity-60 text-sm cursor-pointer"
          >
            {deleteM.isPending ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Trash2 className="w-4 h-4" />
            )}
            حذف نهائي
          </button>
        </div>
      </div>
    </Modal>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Main Page
// ─────────────────────────────────────────────────────────────────────────────

export default function ExpensesPage() {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

  const [showCreate, setShowCreate] = useState(false);
  const [editExpense, setEditExpense] = useState<ExpenseResponse | null>(null);
  const [deleteExpense, setDeleteExpense] = useState<ExpenseResponse | null>(null);

  const pageSize = 15;

  const { data, isLoading } = useGetExpenses({
    pageNumber: page,
    pageSize,
    searchValue: search || undefined,
    from: dateFrom || undefined,
    to: dateTo || undefined,
  });

  const { data: summary } = useGetExpenseSummary(
    dateFrom || undefined,
    dateTo || undefined
  );

  const expenses = data?.items ?? [];
  const totalPages = data?.totalPages ?? 1;
  const totalCount = data?.totalCount ?? 0;

  // Quick stats from summary
  const totalExpenses = summary?.totalExpenses ?? 0;

  // Compute current month filter label
  const filterLabel = useMemo(() => {
    if (!dateFrom && !dateTo) return "كل الفترات";
    if (dateFrom && dateTo)
      return `${dateFrom} → ${dateTo}`;
    if (dateFrom) return `من ${dateFrom}`;
    return `حتى ${dateTo}`;
  }, [dateFrom, dateTo]);

  const handleClearFilters = () => {
    setSearch("");
    setDateFrom("");
    setDateTo("");
    setPage(1);
  };

  const formatAmount = (n: number) =>
    n.toLocaleString("ar-EG-u-nu-latn", { minimumFractionDigits: 3 });

  const formatDate = (s: string) =>
    new Date(s).toLocaleDateString("ar-EG-u-nu-latn", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });

  return (
    <div className="space-y-6 text-right" dir="rtl">
      {/* ── Page Header ─────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-foreground flex items-center gap-2">
            <Wallet className="w-6 h-6 text-primary" />
            المصروفات
          </h1>
          <p className="text-muted-foreground text-sm mt-1 font-medium">
            تتبع وإدارة مصروفات المحل
          </p>
        </div>
        <button
          onClick={() => setShowCreate(true)}
          className="flex items-center gap-2 h-11 px-5 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground font-bold text-sm shadow-md transition-all cursor-pointer shrink-0"
        >
          <Plus className="w-4.5 h-4.5" />
          إضافة مصروف
        </button>
      </div>

      {/* ── Summary Card ─────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Total Expenses */}
        <div className="bg-card border border-border rounded-2xl p-5 flex items-center gap-4 shadow-sm">
          <div className="w-11 h-11 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center justify-center shrink-0">
            <TrendingDown className="w-5 h-5 text-red-400" />
          </div>
          <div>
            <p className="text-xs text-muted-foreground font-bold mb-0.5">
              إجمالي المصروفات
            </p>
            <p className="text-xl font-black text-foreground font-mono">
              {formatAmount(totalExpenses)}
              <span className="text-xs text-muted-foreground font-bold mr-1">د.ك</span>
            </p>
            <p className="text-[10px] text-muted-foreground mt-0.5 font-medium">{filterLabel}</p>
          </div>
        </div>

        {/* Total Count */}
        <div className="bg-card border border-border rounded-2xl p-5 flex items-center gap-4 shadow-sm">
          <div className="w-11 h-11 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0">
            <FileText className="w-5 h-5 text-primary" />
          </div>
          <div>
            <p className="text-xs text-muted-foreground font-bold mb-0.5">
              عدد المصروفات
            </p>
            <p className="text-xl font-black text-foreground font-mono">
              {totalCount.toLocaleString("ar-EG-u-nu-latn")}
            </p>
            <p className="text-[10px] text-muted-foreground mt-0.5 font-medium">{filterLabel}</p>
          </div>
        </div>

        {/* Average per entry */}
        <div className="bg-card border border-border rounded-2xl p-5 flex items-center gap-4 shadow-sm">
          <div className="w-11 h-11 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center shrink-0">
            <Calendar className="w-5 h-5 text-amber-400" />
          </div>
          <div>
            <p className="text-xs text-muted-foreground font-bold mb-0.5">
              متوسط المصروف
            </p>
            <p className="text-xl font-black text-foreground font-mono">
              {totalCount > 0 ? formatAmount(totalExpenses / totalCount) : "0.000"}
              <span className="text-xs text-muted-foreground font-bold mr-1">د.ك</span>
            </p>
            <p className="text-[10px] text-muted-foreground mt-0.5 font-medium">{filterLabel}</p>
          </div>
        </div>
      </div>

      {/* ── Filters ──────────────────────────────────────────────────── */}
      <div className="bg-card border border-border rounded-2xl p-4 flex flex-col sm:flex-row gap-3">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
          <input
            type="text"
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            placeholder="البحث بعنوان المصروف..."
            className="w-full h-10 pr-10 pl-4 rounded-xl bg-background border border-border text-sm font-semibold text-foreground outline-none focus:ring-2 focus:ring-primary transition-all text-right"
          />
        </div>

        {/* Date From */}
        <div className="flex items-center gap-2">
          <label className="text-xs text-muted-foreground font-bold shrink-0">من:</label>
          <input
            type="date"
            value={dateFrom}
            onChange={(e) => { setDateFrom(e.target.value); setPage(1); }}
            className="h-10 px-3 rounded-xl bg-background border border-border text-sm font-semibold text-foreground outline-none focus:ring-2 focus:ring-primary transition-all"
          />
        </div>

        {/* Date To */}
        <div className="flex items-center gap-2">
          <label className="text-xs text-muted-foreground font-bold shrink-0">إلى:</label>
          <input
            type="date"
            value={dateTo}
            onChange={(e) => { setDateTo(e.target.value); setPage(1); }}
            className="h-10 px-3 rounded-xl bg-background border border-border text-sm font-semibold text-foreground outline-none focus:ring-2 focus:ring-primary transition-all"
          />
        </div>

        {/* Clear */}
        {(search || dateFrom || dateTo) && (
          <button
            onClick={handleClearFilters}
            className="flex items-center gap-1.5 h-10 px-4 rounded-xl bg-accent border border-border text-xs font-bold text-muted-foreground hover:text-foreground transition-colors cursor-pointer shrink-0"
          >
            <X className="w-3.5 h-3.5" />
            مسح
          </button>
        )}
      </div>

      {/* ── Table ────────────────────────────────────────────────────── */}
      <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-sm">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3">
            <Loader2 className="w-8 h-8 text-primary animate-spin" />
            <p className="text-muted-foreground text-sm font-semibold">
              جاري تحميل المصروفات...
            </p>
          </div>
        ) : expenses.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 gap-4">
            <div className="w-16 h-16 rounded-2xl bg-muted/50 border border-border flex items-center justify-center">
              <Wallet className="w-8 h-8 text-muted-foreground" />
            </div>
            <div className="text-center">
              <p className="text-foreground font-black mb-1">لا توجد مصروفات</p>
              <p className="text-muted-foreground text-sm font-medium">
                {search || dateFrom || dateTo
                  ? "لا توجد نتائج للفلترة المحددة"
                  : "ابدأ بإضافة مصروف جديد"}
              </p>
            </div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/30">
                  <th className="px-5 py-3.5 text-right font-black text-xs text-muted-foreground">
                    العنوان
                  </th>
                  <th className="px-5 py-3.5 text-right font-black text-xs text-muted-foreground">
                    المبلغ
                  </th>
                  <th className="px-5 py-3.5 text-right font-black text-xs text-muted-foreground hidden md:table-cell">
                    التاريخ
                  </th>
                  <th className="px-5 py-3.5 text-right font-black text-xs text-muted-foreground hidden lg:table-cell">
                    الملاحظات
                  </th>
                  <th className="px-5 py-3.5 text-right font-black text-xs text-muted-foreground hidden md:table-cell">
                    وقت الإضافة
                  </th>
                  <th className="px-5 py-3.5 text-left font-black text-xs text-muted-foreground">
                    إجراءات
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {expenses.map((exp) => (
                  <tr
                    key={exp.id}
                    className="hover:bg-accent/30 transition-colors group"
                  >
                    {/* Title */}
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-red-500/10 border border-red-500/15 flex items-center justify-center shrink-0">
                          <TrendingDown className="w-3.5 h-3.5 text-red-400" />
                        </div>
                        <span className="font-bold text-foreground text-xs">
                          {exp.title}
                        </span>
                      </div>
                    </td>

                    {/* Amount */}
                    <td className="px-5 py-4">
                      <span className="font-black text-red-400 font-mono text-sm">
                        {formatAmount(exp.amount)}
                        <span className="text-xs text-muted-foreground font-bold mr-1">
                          د.ك
                        </span>
                      </span>
                    </td>

                    {/* Expense Date */}
                    <td className="px-5 py-4 hidden md:table-cell">
                      <span className="text-xs font-bold text-muted-foreground">
                        {formatDate(exp.expenseDate)}
                      </span>
                    </td>

                    {/* Notes */}
                    <td className="px-5 py-4 hidden lg:table-cell max-w-[200px]">
                      {exp.notes ? (
                        <span
                          className="text-xs text-muted-foreground font-medium truncate block"
                          title={exp.notes}
                        >
                          {exp.notes}
                        </span>
                      ) : (
                        <span className="text-xs text-muted-foreground/40">—</span>
                      )}
                    </td>

                    {/* Created At */}
                    <td className="px-5 py-4 hidden md:table-cell">
                      <span className="text-[11px] font-bold text-muted-foreground/70">
                        {formatDate(exp.createdAt)}
                      </span>
                    </td>

                    {/* Actions */}
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-2 justify-end opacity-60 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => setEditExpense(exp)}
                          className="w-8 h-8 rounded-lg bg-accent border border-border flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-accent/80 transition-all cursor-pointer"
                          title="تعديل"
                        >
                          <Pencil className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => setDeleteExpense(exp)}
                          className="w-8 h-8 rounded-lg bg-destructive/10 border border-destructive/20 flex items-center justify-center text-destructive hover:bg-destructive hover:text-white transition-all cursor-pointer"
                          title="حذف"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* ── Pagination ─────────────────────────────────────────────── */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-5 py-3 border-t border-border bg-muted/10">
            <p className="text-xs font-bold text-muted-foreground">
              صفحة{" "}
              <span className="text-foreground">
                {page.toLocaleString("ar-EG-u-nu-latn")}
              </span>{" "}
              من{" "}
              <span className="text-foreground">
                {totalPages.toLocaleString("ar-EG-u-nu-latn")}
              </span>
            </p>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className={cn(
                  "w-8 h-8 rounded-lg border flex items-center justify-center text-sm font-bold transition-all cursor-pointer",
                  page === 1
                    ? "border-border text-muted-foreground/40 cursor-not-allowed"
                    : "border-border text-foreground hover:bg-accent"
                )}
              >
                <ChevronRight className="w-4 h-4" />
              </button>
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className={cn(
                  "w-8 h-8 rounded-lg border flex items-center justify-center text-sm font-bold transition-all cursor-pointer",
                  page === totalPages
                    ? "border-border text-muted-foreground/40 cursor-not-allowed"
                    : "border-border text-foreground hover:bg-accent"
                )}
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ── Modals ─────────────────────────────────────────────────── */}
      {showCreate && (
        <ExpenseFormModal mode="create" onClose={() => setShowCreate(false)} />
      )}

      {editExpense && (
        <ExpenseFormModal
          mode="edit"
          initial={editExpense}
          onClose={() => setEditExpense(null)}
        />
      )}

      {deleteExpense && (
        <DeleteModal
          expense={deleteExpense}
          onClose={() => setDeleteExpense(null)}
        />
      )}
    </div>
  );
}
