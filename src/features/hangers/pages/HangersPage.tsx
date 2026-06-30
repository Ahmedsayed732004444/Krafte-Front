import React, { useState } from "react";
import { useGetHangers, useCreateHanger, useUpdateHanger, useDeleteHanger } from "../hooks/useHangers";
import { useGetPartitions } from "@/features/partitions/hooks/usePartitions";
import { Plus, Search, Pencil, Trash2, X, Check, Loader2, ChevronLeft, ChevronRight, Hash } from "lucide-react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { cn } from "@/lib/utils";
import type { HangerResponse } from "../types/hangers";

const schema = z.object({
  number: z.number({ message: "الرقم مطلوب" }).int().min(1, "الرقم يجب أن يكون أكبر من 0"),
  partitionId: z.string().min(1, "القسم مطلوب"),
  suitSize: z.number({ message: "المقاس مطلوب" }).int().min(42).max(64),
});
type FormData = z.infer<typeof schema>;

// ─── Modal ─────────────────────────────────────────────────────────
const Modal = ({ title, onClose, children }: { title: string; onClose: () => void; children: React.ReactNode }) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4 animate-in fade-in duration-200">
    <div className="bg-popover border border-border rounded-2xl w-full max-w-md mx-4 shadow-2xl animate-in zoom-in duration-200">
      <div className="flex items-center justify-between p-6 border-b border-border">
        <h2 className="text-lg font-bold text-foreground">{title}</h2>
        <button onClick={onClose} className="text-muted-foreground hover:text-foreground transition-colors p-1 rounded-lg hover:bg-accent">
          <X className="w-5 h-5" />
        </button>
      </div>
      <div className="p-6">{children}</div>
    </div>
  </div>
);

// ─── Form ──────────────────────────────────────────────────────────
interface FormProps {
  defaults?: Partial<FormData>;
  onSubmit: (data: FormData) => void;
  loading: boolean;
  submitLabel: string;
}

const SIZES = [42, 44, 46, 48, 50, 52, 54, 56, 58, 60, 62, 64];

const HangerForm = ({ defaults, onSubmit, loading, submitLabel }: FormProps) => {
  const { data: partitionsData } = useGetPartitions({ pageSize: 50 });
  const partitions = partitionsData?.items ?? [];
  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      number: defaults?.number,
      partitionId: defaults?.partitionId ?? "",
      suitSize: defaults?.suitSize ?? 42,
    },
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-muted-foreground mb-2">رقم الشماعة</label>
        <input type="number" {...register("number", { valueAsNumber: true })} placeholder="1" className={cn("w-full h-11 px-4 rounded-xl bg-background border text-foreground placeholder-muted-foreground outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all", errors.number ? "border-destructive" : "border-border")} />
        {errors.number && <p className="text-destructive text-xs mt-1">{errors.number.message}</p>}
      </div>
      <div>
        <label className="block text-sm font-medium text-muted-foreground mb-2">القسم</label>
        <select {...register("partitionId")} className={cn("w-full h-11 px-4 rounded-xl bg-[#1a1f2e] border text-foreground outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all bg-background", errors.partitionId ? "border-destructive" : "border-border")}>
          <option value="">اختر القسم</option>
          {partitions.map(p => <option key={p.id} value={p.id}>قسم {p.name}</option>)}
        </select>
        {errors.partitionId && <p className="text-destructive text-xs mt-1">{errors.partitionId.message}</p>}
      </div>
      <div>
        <label className="block text-sm font-medium text-muted-foreground mb-2">مقاس البدلة</label>
        <select {...register("suitSize", { valueAsNumber: true })} className={cn("w-full h-11 px-4 rounded-xl bg-[#1a1f2e] border text-foreground outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all bg-background", errors.suitSize ? "border-destructive" : "border-border")}>
          {SIZES.map(s => <option key={s} value={s}>{s}</option>)}
        </select>
        {errors.suitSize && <p className="text-destructive text-xs mt-1">{errors.suitSize.message}</p>}
      </div>
      <button type="submit" disabled={loading} className="w-full h-11 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground font-bold flex items-center justify-center gap-2 transition-all disabled:opacity-60">
        {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
        {submitLabel}
      </button>
    </form>
  );
};

// ─── Confirm Delete ────────────────────────────────────────────────
const ConfirmDelete = ({ hanger, onConfirm, onCancel, loading }: { hanger: HangerResponse; onConfirm: () => void; onCancel: () => void; loading: boolean }) => (
  <Modal title="تأكيد الحذف" onClose={onCancel}>
    <p className="text-muted-foreground mb-6">هل أنت متأكد من حذف الشماعة <span className="text-foreground font-bold">#{hanger.number}</span> من قسم <span className="text-foreground font-bold">{hanger.partition.name}</span>؟</p>
    <div className="flex gap-3">
      <button onClick={onCancel} className="flex-1 h-11 rounded-xl border border-border text-muted-foreground hover:bg-accent transition-all font-semibold">إلغاء</button>
      <button onClick={onConfirm} disabled={loading} className="flex-1 h-11 rounded-xl bg-destructive hover:bg-destructive/90 text-white font-bold transition-all flex items-center justify-center gap-2 disabled:opacity-60">
        {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />} حذف
      </button>
    </div>
  </Modal>
);

// ─── Page ──────────────────────────────────────────────────────────
export default function HangersPage() {
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [page, setPage] = useState(1);
  const [showCreate, setShowCreate] = useState(false);
  const [editTarget, setEditTarget] = useState<HangerResponse | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<HangerResponse | null>(null);

  React.useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search), 400);
    return () => clearTimeout(t);
  }, [search]);

  const { data, isLoading, error } = useGetHangers({ pageNumber: page, pageSize: 10, searchValue: debouncedSearch || undefined });
  const createMutation = useCreateHanger();
  const updateMutation = useUpdateHanger();
  const deleteMutation = useDeleteHanger();

  const hangers = data?.items ?? [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-foreground">الشماعات</h1>
          <p className="text-muted-foreground text-sm mt-1">إدارة الشماعات وربطها بالأقسام والمقاسات</p>
        </div>
        <button onClick={() => setShowCreate(true)} className="flex items-center justify-center gap-2 px-5 h-11 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground font-bold transition-all shadow-lg shadow-primary/20 shrink-0">
          <Plus className="w-4 h-4" /> إضافة شماعة
        </button>
      </div>

      {/* Search */}
      <div className="relative max-w-sm">
        <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <input value={search} onChange={e => { setSearch(e.target.value); setPage(1); }} placeholder="بحث..." className="w-full h-11 pr-10 pl-10 rounded-xl bg-muted border border-border text-foreground placeholder-muted-foreground outline-none focus:ring-2 focus:ring-primary transition-all" />
        {search && <button onClick={() => setSearch("")} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"><X className="w-4 h-4" /></button>}
      </div>

      {/* Loading */}
      {isLoading && <div className="space-y-2">{Array.from({ length: 6 }).map((_, i) => <div key={i} className="h-16 rounded-xl bg-card border border-border animate-pulse" />)}</div>}

      {/* Error */}
      {error && <div className="flex items-center gap-3 p-4 rounded-xl bg-destructive/10 border border-destructive/25 text-destructive"><X className="w-5 h-5" /> فشل تحميل الشماعات.</div>}

      {/* Empty */}
      {!isLoading && !error && hangers.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20 text-center bg-card border border-border rounded-2xl">
          <Hash className="w-12 h-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-bold text-foreground mb-1">لا توجد شماعات</h3>
          <p className="text-muted-foreground text-sm">أضف شماعة جديدة للبدء</p>
        </div>
      )}

      {/* Table List */}
      {!isLoading && !error && hangers.length > 0 && (
        <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[500px]">
              <thead>
                <tr className="border-b border-border bg-muted/40">
                  <th className="text-right text-xs font-bold text-muted-foreground uppercase px-6 py-4">رقم الشماعة</th>
                  <th className="text-right text-xs font-bold text-muted-foreground uppercase px-6 py-4">القسم</th>
                  <th className="text-right text-xs font-bold text-muted-foreground uppercase px-6 py-4">مقاس البدلة</th>
                  <th className="text-right text-xs font-bold text-muted-foreground uppercase px-6 py-4">إجراءات</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {hangers.map(hanger => (
                  <tr key={hanger.id} className="hover:bg-muted/40 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center font-black text-primary">#{hanger.number}</div>
                        <span className="font-bold text-foreground">شماعة #{hanger.number}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="px-3 py-1 rounded-full bg-accent/30 border border-border text-muted-foreground text-sm font-semibold">قسم {hanger.partition.name}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="px-3 py-1 rounded-full bg-primary/15 border border-primary/25 text-primary text-sm font-semibold">{hanger.suitSize}</span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 opacity-100 sm:opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={() => setEditTarget(hanger)} className="w-8 h-8 rounded-lg bg-muted hover:bg-primary/20 text-muted-foreground hover:text-primary flex items-center justify-center transition-all"><Pencil className="w-3.5 h-3.5" /></button>
                        <button onClick={() => setDeleteTarget(hanger)} className="w-8 h-8 rounded-lg bg-muted hover:bg-destructive/20 text-muted-foreground hover:text-destructive flex items-center justify-center transition-all"><Trash2 className="w-3.5 h-3.5" /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Pagination */}
      {data && data.totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 mt-4">
          <button onClick={() => setPage(p => p - 1)} disabled={!data.hasPreviousPage} className="w-9 h-9 rounded-xl border border-border text-muted-foreground hover:bg-accent disabled:opacity-30 flex items-center justify-center"><ChevronRight className="w-4 h-4" /></button>
          {Array.from({ length: data.totalPages }, (_, i) => i + 1).map(n => (
            <button key={n} onClick={() => setPage(n)} className={cn("w-9 h-9 rounded-xl font-bold text-sm transition-all", n === page ? "bg-primary text-primary-foreground" : "border border-border text-muted-foreground hover:bg-accent")}>{n}</button>
          ))}
          <button onClick={() => setPage(p => p + 1)} disabled={!data.hasNextPage} className="w-9 h-9 rounded-xl border border-border text-muted-foreground hover:bg-accent disabled:opacity-30 flex items-center justify-center"><ChevronLeft className="w-4 h-4" /></button>
        </div>
      )}

      {/* Modals */}
      {showCreate && <Modal title="إضافة شماعة جديدة" onClose={() => setShowCreate(false)}><HangerForm submitLabel="إنشاء الشماعة" loading={createMutation.isPending} onSubmit={async d => { await createMutation.mutateAsync(d as any); setShowCreate(false); }} /></Modal>}
      {editTarget && <Modal title="تعديل الشماعة" onClose={() => setEditTarget(null)}><HangerForm defaults={{ number: editTarget.number, partitionId: editTarget.partition.id, suitSize: editTarget.suitSize }} submitLabel="حفظ التعديلات" loading={updateMutation.isPending} onSubmit={async d => { await updateMutation.mutateAsync({ id: editTarget.id, body: d as any }); setEditTarget(null); }} /></Modal>}
      {deleteTarget && <ConfirmDelete hanger={deleteTarget} loading={deleteMutation.isPending} onConfirm={async () => { await deleteMutation.mutateAsync(deleteTarget.id); setDeleteTarget(null); }} onCancel={() => setDeleteTarget(null)} />}
    </div>
  );
}
