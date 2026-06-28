import React, { useState } from "react";
import { useGetPartitions, useCreatePartition, useUpdatePartition, useDeletePartition } from "../hooks/usePartitions";
import { useNavigate } from "react-router-dom";
import { Plus, Search, Pencil, Trash2, ChevronLeft, ChevronRight, Layers, X, Check, Loader2, Tag } from "lucide-react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { cn } from "@/lib/utils";

const schema = z.object({ name: z.string().min(1, "الاسم مطلوب") });
type FormData = z.infer<typeof schema>;

// ─── Modal ─────────────────────────────────────────────────────────
interface ModalProps {
  title: string;
  onClose: () => void;
  children: React.ReactNode;
}
const Modal = ({ title, onClose, children }: ModalProps) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
    <div className="bg-[#1a1f2e] border border-white/10 rounded-2xl w-full max-w-md mx-4 shadow-2xl">
      <div className="flex items-center justify-between p-6 border-b border-white/10">
        <h2 className="text-lg font-bold text-white">{title}</h2>
        <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors">
          <X className="w-5 h-5" />
        </button>
      </div>
      <div className="p-6">{children}</div>
    </div>
  </div>
);

// ─── Confirm Delete Modal ──────────────────────────────────────────
interface ConfirmProps { name: string; onConfirm: () => void; onCancel: () => void; loading: boolean; }
const ConfirmDelete = ({ name, onConfirm, onCancel, loading }: ConfirmProps) => (
  <Modal title="تأكيد الحذف" onClose={onCancel}>
    <p className="text-slate-300 mb-6">هل أنت متأكد من حذف القسم <span className="text-white font-bold">"{name}"</span>؟</p>
    <div className="flex gap-3">
      <button onClick={onCancel} className="flex-1 h-11 rounded-xl border border-white/10 text-slate-300 hover:bg-white/5 transition-all font-semibold">إلغاء</button>
      <button onClick={onConfirm} disabled={loading} className="flex-1 h-11 rounded-xl bg-red-500 hover:bg-red-600 text-white font-bold transition-all flex items-center justify-center gap-2 disabled:opacity-60">
        {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
        حذف
      </button>
    </div>
  </Modal>
);

// ─── Partition Form ────────────────────────────────────────────────
interface PartitionFormProps { defaultName?: string; onSubmit: (data: FormData) => void; loading: boolean; submitLabel: string; }
const PartitionForm = ({ defaultName = "", onSubmit, loading, submitLabel }: PartitionFormProps) => {
  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { name: defaultName },
  });
  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-slate-300 mb-2">اسم القسم</label>
        <input {...register("name")} placeholder="مثال: A" className={cn("w-full h-11 px-4 rounded-xl bg-white/5 border text-white placeholder-slate-500 outline-none focus:ring-2 focus:ring-indigo-500 transition-all", errors.name ? "border-red-500" : "border-white/10")} />
        {errors.name && <p className="text-red-400 text-xs mt-1">{errors.name.message}</p>}
      </div>
      <button type="submit" disabled={loading} className="w-full h-11 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold flex items-center justify-center gap-2 transition-all disabled:opacity-60">
        {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
        {submitLabel}
      </button>
    </form>
  );
};

// ─── Page ──────────────────────────────────────────────────────────
export default function PartitionsPage() {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [page, setPage] = useState(1);
  const [showCreate, setShowCreate] = useState(false);
  const [editTarget, setEditTarget] = useState<{ id: string; name: string } | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; name: string } | null>(null);

  // Debounce search
  React.useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search), 400);
    return () => clearTimeout(t);
  }, [search]);

  const { data, isLoading, error } = useGetPartitions({ pageNumber: page, pageSize: 10, searchValue: debouncedSearch || undefined });
  const createMutation = useCreatePartition();
  const updateMutation = useUpdatePartition();
  const deleteMutation = useDeletePartition();

  const partitions = data?.items ?? [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-white">الأقسام</h1>
          <p className="text-slate-400 text-sm mt-1">إدارة أقسام المخزن</p>
        </div>
        <button onClick={() => setShowCreate(true)} className="flex items-center gap-2 px-5 h-11 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold transition-all shadow-lg shadow-indigo-500/20">
          <Plus className="w-4 h-4" /> إضافة قسم
        </button>
      </div>

      {/* Search */}
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
        <input
          value={search}
          onChange={e => { setSearch(e.target.value); setPage(1); }}
          placeholder="بحث بالاسم..."
          className="w-full h-11 pl-10 pr-4 rounded-xl bg-white/5 border border-white/10 text-white placeholder-slate-500 outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
        />
        {search && <button onClick={() => setSearch("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"><X className="w-4 h-4" /></button>}
      </div>

      {/* Loading */}
      {isLoading && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="h-40 rounded-2xl bg-white/5 animate-pulse" />
          ))}
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="flex items-center gap-3 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400">
          <X className="w-5 h-5 shrink-0" /> فشل تحميل الأقسام. تحقق من الاتصال بالسيرفر.
        </div>
      )}

      {/* Empty */}
      {!isLoading && !error && partitions.length === 0 && (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <div className="w-16 h-16 rounded-2xl bg-white/5 flex items-center justify-center mb-4"><Layers className="w-8 h-8 text-slate-500" /></div>
          <p className="text-slate-400 font-medium">{search ? `لا توجد نتائج لـ "${search}"` : "لا يوجد أقسام بعد"}</p>
        </div>
      )}

      {/* Grid */}
      {!isLoading && !error && partitions.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {partitions.map(p => (
            <div key={p.id} className="group bg-white/5 hover:bg-white/8 border border-white/10 hover:border-indigo-500/40 rounded-2xl p-5 transition-all duration-300 cursor-pointer" onClick={() => navigate(`/partitions/${p.id}`)}>
              <div className="flex items-start justify-between mb-4">
                <div className="w-10 h-10 rounded-xl bg-indigo-500/20 flex items-center justify-center">
                  <Tag className="w-5 h-5 text-indigo-400" />
                </div>
                {/* Actions — stop propagation so clicking edit/delete doesn't navigate */}
                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button onClick={e => { e.stopPropagation(); setEditTarget({ id: p.id, name: p.name }); }}
                    className="w-8 h-8 rounded-lg bg-white/5 hover:bg-indigo-500/20 text-slate-400 hover:text-indigo-400 flex items-center justify-center transition-all">
                    <Pencil className="w-3.5 h-3.5" />
                  </button>
                  <button onClick={e => { e.stopPropagation(); setDeleteTarget({ id: p.id, name: p.name }); }}
                    className="w-8 h-8 rounded-lg bg-white/5 hover:bg-red-500/20 text-slate-400 hover:text-red-400 flex items-center justify-center transition-all">
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
              <h3 className="text-xl font-black text-white mb-1">{p.name}</h3>
              <p className="text-sm text-slate-400">{p.hangersCount} شماعة</p>
              {p.hangers.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-3">
                  {p.hangers.slice(0, 6).map(h => (
                    <span key={h.id} className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-white/5 text-slate-400">#{h.number}</span>
                  ))}
                  {p.hangers.length > 6 && <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-white/5 text-slate-400">+{p.hangers.length - 6}</span>}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Pagination */}
      {data && data.totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 pt-4">
          <button onClick={() => setPage(p => p - 1)} disabled={!data.hasPreviousPage} className="w-10 h-10 rounded-xl border border-white/10 text-slate-400 hover:bg-white/5 disabled:opacity-30 flex items-center justify-center transition-all">
            <ChevronRight className="w-4 h-4" />
          </button>
          {Array.from({ length: data.totalPages }, (_, i) => i + 1).map(n => (
            <button key={n} onClick={() => setPage(n)} className={cn("w-10 h-10 rounded-xl font-bold text-sm transition-all", n === page ? "bg-indigo-600 text-white" : "border border-white/10 text-slate-400 hover:bg-white/5")}>
              {n}
            </button>
          ))}
          <button onClick={() => setPage(p => p + 1)} disabled={!data.hasNextPage} className="w-10 h-10 rounded-xl border border-white/10 text-slate-400 hover:bg-white/5 disabled:opacity-30 flex items-center justify-center transition-all">
            <ChevronLeft className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Modals */}
      {showCreate && (
        <Modal title="إضافة قسم جديد" onClose={() => setShowCreate(false)}>
          <PartitionForm submitLabel="إنشاء القسم" loading={createMutation.isPending}
            onSubmit={async (data) => { await createMutation.mutateAsync(data); setShowCreate(false); }} />
        </Modal>
      )}
      {editTarget && (
        <Modal title="تعديل القسم" onClose={() => setEditTarget(null)}>
          <PartitionForm defaultName={editTarget.name} submitLabel="حفظ التعديلات" loading={updateMutation.isPending}
            onSubmit={async (data) => { await updateMutation.mutateAsync({ id: editTarget.id, body: data }); setEditTarget(null); }} />
        </Modal>
      )}
      {deleteTarget && (
        <ConfirmDelete name={deleteTarget.name} loading={deleteMutation.isPending}
          onConfirm={async () => { await deleteMutation.mutateAsync(deleteTarget.id); setDeleteTarget(null); }}
          onCancel={() => setDeleteTarget(null)} />
      )}
    </div>
  );
}
