import React, { useState } from "react";
import { useGetPartitions, useCreatePartition, useUpdatePartition, useDeletePartition } from "@/features/partitions/hooks/usePartitions";
import { useGetHangers, useCreateHanger, useUpdateHanger, useDeleteHanger } from "@/features/hangers/hooks/useHangers";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { cn } from "@/lib/utils";
import {
  Plus, Pencil, Trash2, X, Check, Loader2,
  Settings, Layers, Hash, ChevronLeft, ChevronRight, Search,
} from "lucide-react";
import type { HangerResponse } from "@/features/hangers/types/hangers";
import type { PartitionResponse } from "@/features/partitions/types/partitions";

// ═══════════════════════════════════════════════════════════════
// Shared UI
// ═══════════════════════════════════════════════════════════════
const Modal = ({ title, onClose, children }: { title: string; onClose: () => void; children: React.ReactNode }) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4">
    <div className="bg-popover border border-border rounded-2xl w-full max-w-md shadow-2xl animate-in fade-in zoom-in duration-200">
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

const ConfirmDeleteModal = ({ label, onConfirm, onCancel, loading }: { label: string; onConfirm: () => void; onCancel: () => void; loading: boolean }) => (
  <Modal title="تأكيد الحذف" onClose={onCancel}>
    <p className="text-muted-foreground mb-6">
      هل أنت متأكد من حذف <span className="font-bold text-foreground">"{label}"</span>؟ لا يمكن التراجع عن هذا الإجراء.
    </p>
    <div className="flex gap-3">
      <button onClick={onCancel} className="flex-1 h-11 rounded-xl border border-border text-muted-foreground hover:bg-accent transition-all font-semibold">إلغاء</button>
      <button onClick={onConfirm} disabled={loading} className="flex-1 h-11 rounded-xl bg-destructive hover:bg-destructive/90 text-white font-bold transition-all flex items-center justify-center gap-2 disabled:opacity-60">
        {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />} حذف
      </button>
    </div>
  </Modal>
);

// ═══════════════════════════════════════════════════════════════
// PARTITIONS TAB
// ═══════════════════════════════════════════════════════════════
const partitionSchema = z.object({ name: z.string().min(1, "الاسم مطلوب") });
type PartitionFormData = z.infer<typeof partitionSchema>;

const PartitionForm = ({ defaultName = "", onSubmit, loading, submitLabel }: { defaultName?: string; onSubmit: (d: PartitionFormData) => void; loading: boolean; submitLabel: string }) => {
  const { register, handleSubmit, formState: { errors } } = useForm<PartitionFormData>({
    resolver: zodResolver(partitionSchema),
    defaultValues: { name: defaultName },
  });
  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-muted-foreground mb-2">اسم القسم</label>
        <input {...register("name")} placeholder="مثال: A" className={cn("w-full h-11 px-4 rounded-xl bg-background border text-foreground placeholder-muted-foreground outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all", errors.name ? "border-destructive" : "border-border")} />
        {errors.name && <p className="text-destructive text-xs mt-1">{errors.name.message}</p>}
      </div>
      <button type="submit" disabled={loading} className="w-full h-11 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground font-bold flex items-center justify-center gap-2 transition-all disabled:opacity-60">
        {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}{submitLabel}
      </button>
    </form>
  );
};

function PartitionsTab() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [showCreate, setShowCreate] = useState(false);
  const [editTarget, setEditTarget] = useState<PartitionResponse | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<PartitionResponse | null>(null);

  React.useEffect(() => { const t = setTimeout(() => setDebouncedSearch(search), 400); return () => clearTimeout(t); }, [search]);

  const { data, isLoading } = useGetPartitions({ pageNumber: page, pageSize: 10, searchValue: debouncedSearch || undefined });
  const createM = useCreatePartition();
  const updateM = useUpdatePartition();
  const deleteM = useDeletePartition();
  const items = data?.items ?? [];

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
        <div className="relative flex-1 max-w-xs">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input value={search} onChange={e => { setSearch(e.target.value); setPage(1); }} placeholder="بحث..." className="w-full h-10 pr-10 pl-4 rounded-xl bg-muted border border-border text-foreground placeholder-muted-foreground outline-none focus:ring-2 focus:ring-primary text-sm transition-all" />
        </div>
        <button onClick={() => setShowCreate(true)} className="flex items-center justify-center gap-2 px-4 h-10 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground font-bold text-sm transition-all shrink-0">
          <Plus className="w-4 h-4" /> إضافة قسم
        </button>
      </div>

      {/* Table */}
      <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[500px]">
            <thead>
              <tr className="border-b border-border bg-muted/40">
                <th className="text-right text-xs font-bold text-muted-foreground uppercase tracking-widest px-6 py-4">الاسم</th>
                <th className="text-right text-xs font-bold text-muted-foreground uppercase tracking-widest px-6 py-4">عدد الشماعات</th>
                <th className="text-right text-xs font-bold text-muted-foreground uppercase tracking-widest px-6 py-4">إجراءات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {isLoading && Array.from({ length: 4 }).map((_, i) => (
                <tr key={i}><td colSpan={3} className="px-6 py-4"><div className="h-4 rounded bg-muted animate-pulse" /></td></tr>
              ))}
              {!isLoading && items.length === 0 && (
                <tr><td colSpan={3} className="px-6 py-8 text-center text-muted-foreground text-sm">لا توجد أقسام</td></tr>
              )}
              {items.map(p => (
                <tr key={p.id} className="hover:bg-muted/40 transition-colors group">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center font-black text-primary">{p.name}</div>
                      <span className="font-bold text-foreground">قسم {p.name}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="px-3 py-1 rounded-full bg-accent/30 border border-border text-muted-foreground text-sm font-semibold">{p.hangersCount}</span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2 opacity-100 sm:opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={() => setEditTarget(p)} className="w-8 h-8 rounded-lg bg-muted hover:bg-primary/20 text-muted-foreground hover:text-primary flex items-center justify-center transition-all"><Pencil className="w-3.5 h-3.5" /></button>
                      <button onClick={() => setDeleteTarget(p)} className="w-8 h-8 rounded-lg bg-muted hover:bg-destructive/20 text-muted-foreground hover:text-destructive flex items-center justify-center transition-all"><Trash2 className="w-3.5 h-3.5" /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

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
      {showCreate && <Modal title="إضافة قسم جديد" onClose={() => setShowCreate(false)}><PartitionForm submitLabel="إنشاء القسم" loading={createM.isPending} onSubmit={async d => { await createM.mutateAsync(d); setShowCreate(false); }} /></Modal>}
      {editTarget && <Modal title="تعديل القسم" onClose={() => setEditTarget(null)}><PartitionForm defaultName={editTarget.name} submitLabel="حفظ التعديلات" loading={updateM.isPending} onSubmit={async d => { await updateM.mutateAsync({ id: editTarget.id, body: d }); setEditTarget(null); }} /></Modal>}
      {deleteTarget && <ConfirmDeleteModal label={`قسم ${deleteTarget.name}`} loading={deleteM.isPending} onConfirm={async () => { await deleteM.mutateAsync(deleteTarget.id); setDeleteTarget(null); }} onCancel={() => setDeleteTarget(null)} />}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// HANGERS TAB
// ═══════════════════════════════════════════════════════════════
const SIZES = [42, 44, 46, 48, 50, 52, 54, 56, 58, 60, 62, 64];

const hangerSchema = z.object({
  number: z.number({ message: "الرقم مطلوب" }).int().min(1, "يجب أن يكون أكبر من 0"),
  partitionId: z.string().min(1, "اختر القسم"),
  suitSize: z.number({ message: "المقاس مطلوب" }).int().min(42).max(64),
});
type HangerFormData = z.infer<typeof hangerSchema>;

const HangerForm = ({ defaults, onSubmit, loading, submitLabel }: { defaults?: Partial<HangerFormData>; onSubmit: (d: HangerFormData) => void; loading: boolean; submitLabel: string }) => {
  const { data: partitionsData } = useGetPartitions({ pageSize: 50 });
  const partitions = partitionsData?.items ?? [];
  const { register, handleSubmit, formState: { errors } } = useForm<HangerFormData>({
    resolver: zodResolver(hangerSchema),
    defaultValues: { number: defaults?.number, partitionId: defaults?.partitionId ?? "", suitSize: defaults?.suitSize ?? 42 },
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
        <select {...register("partitionId")} className={cn("w-full h-11 px-4 rounded-xl bg-background border text-foreground outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all", errors.partitionId ? "border-destructive" : "border-border")}>
          <option value="">اختر القسم</option>
          {partitions.map(p => <option key={p.id} value={p.id}>قسم {p.name}</option>)}
        </select>
        {errors.partitionId && <p className="text-destructive text-xs mt-1">{errors.partitionId.message}</p>}
      </div>
      <div>
        <label className="block text-sm font-medium text-muted-foreground mb-2">المقاس الافتراضي للبدلة</label>
        <select {...register("suitSize", { valueAsNumber: true })} className={cn("w-full h-11 px-4 rounded-xl bg-background border text-foreground outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all", errors.suitSize ? "border-destructive" : "border-border")}>
          {SIZES.map(sz => <option key={sz} value={sz}>مقاس {sz}</option>)}
        </select>
        {errors.suitSize && <p className="text-destructive text-xs mt-1">{errors.suitSize.message}</p>}
      </div>
      <button type="submit" disabled={loading} className="w-full h-11 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground font-bold flex items-center justify-center gap-2 transition-all disabled:opacity-60">
        {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}{submitLabel}
      </button>
    </form>
  );
};

function HangersTab() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [showCreate, setShowCreate] = useState(false);
  const [editTarget, setEditTarget] = useState<HangerResponse | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<HangerResponse | null>(null);

  React.useEffect(() => { const t = setTimeout(() => setDebouncedSearch(search), 400); return () => clearTimeout(t); }, [search]);

  const { data, isLoading } = useGetHangers({ pageNumber: page, pageSize: 10, searchValue: debouncedSearch || undefined });
  const createM = useCreateHanger();
  const updateM = useUpdateHanger();
  const deleteM = useDeleteHanger();
  const items = data?.items ?? [];

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
        <div className="relative flex-1 max-w-xs">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input value={search} onChange={e => { setSearch(e.target.value); setPage(1); }} placeholder="بحث..." className="w-full h-10 pr-10 pl-4 rounded-xl bg-muted border border-border text-foreground placeholder-muted-foreground outline-none focus:ring-2 focus:ring-primary text-sm transition-all" />
        </div>
        <button onClick={() => setShowCreate(true)} className="flex items-center justify-center gap-2 px-4 h-10 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground font-bold text-sm transition-all shrink-0">
          <Plus className="w-4 h-4" /> إضافة شماعة
        </button>
      </div>

      {/* Table */}
      <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[500px]">
            <thead>
              <tr className="border-b border-border bg-muted/40">
                <th className="text-right text-xs font-bold text-muted-foreground uppercase tracking-widest px-6 py-4">رقم الشماعة</th>
                <th className="text-right text-xs font-bold text-muted-foreground uppercase tracking-widest px-6 py-4">القسم</th>
                <th className="text-right text-xs font-bold text-muted-foreground uppercase tracking-widest px-6 py-4">إجراءات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {isLoading && Array.from({ length: 4 }).map((_, i) => (
                <tr key={i}><td colSpan={3} className="px-6 py-4"><div className="h-4 rounded bg-muted animate-pulse" /></td></tr>
              ))}
              {!isLoading && items.length === 0 && (
                <tr><td colSpan={3} className="px-6 py-8 text-center text-muted-foreground text-sm">لا توجد شماعات</td></tr>
              )}
              {items.map(h => (
                <tr key={h.id} className="hover:bg-muted/40 transition-colors group">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center font-black text-primary text-sm">#{h.number}</div>
                      <span className="font-bold text-foreground">شماعة {h.number}#</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="px-3 py-1 rounded-full bg-accent/30 border border-border text-muted-foreground text-sm font-semibold">قسم {h.partition.name}</span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2 opacity-100 sm:opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={() => setEditTarget(h)} className="w-8 h-8 rounded-lg bg-muted hover:bg-primary/20 text-muted-foreground hover:text-primary flex items-center justify-center transition-all"><Pencil className="w-3.5 h-3.5" /></button>
                      <button onClick={() => setDeleteTarget(h)} className="w-8 h-8 rounded-lg bg-muted hover:bg-destructive/20 text-muted-foreground hover:text-destructive flex items-center justify-center transition-all"><Trash2 className="w-3.5 h-3.5" /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

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
      {showCreate && <Modal title="إضافة شماعة جديدة" onClose={() => setShowCreate(false)}><HangerForm submitLabel="إنشاء الشماعة" loading={createM.isPending} onSubmit={async d => { await createM.mutateAsync(d as any); setShowCreate(false); }} /></Modal>}
      {editTarget && <Modal title="تعديل الشماعة" onClose={() => setEditTarget(null)}><HangerForm defaults={{ number: editTarget.number, partitionId: editTarget.partition.id, suitSize: editTarget.suitSize }} submitLabel="حفظ التعديلات" loading={updateM.isPending} onSubmit={async d => { await updateM.mutateAsync({ id: editTarget.id, body: d as any }); setEditTarget(null); }} /></Modal>}
      {deleteTarget && <ConfirmDeleteModal label={`شماعة #${deleteTarget.number} - قسم ${deleteTarget.partition.name}`} loading={deleteM.isPending} onConfirm={async () => { await deleteM.mutateAsync(deleteTarget.id); setDeleteTarget(null); }} onCancel={() => setDeleteTarget(null)} />}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// SETTINGS PAGE
// ═══════════════════════════════════════════════════════════════
type Tab = "partitions" | "hangers";

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState<Tab>("partitions");

  const tabs: { id: Tab; label: string; icon: typeof Layers }[] = [
    { id: "partitions", label: "الأقسام", icon: Layers },
    { id: "hangers", label: "الشماعات", icon: Hash },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 rounded-2xl bg-card border border-border flex items-center justify-center">
          <Settings className="w-6 h-6 text-muted-foreground" />
        </div>
        <div>
          <h1 className="text-2xl font-black text-foreground">الإعدادات</h1>
          <p className="text-muted-foreground text-sm">إدارة الأقسام والشماعات</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1 bg-card border border-border rounded-2xl p-1.5 w-fit">
        {tabs.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setActiveTab(id)}
            className={cn(
              "flex items-center gap-2 px-5 h-10 rounded-xl text-sm font-bold transition-all duration-200",
              activeTab === id
                ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20"
                : "text-muted-foreground hover:text-foreground hover:bg-accent"
            )}
          >
            <Icon className="w-4 h-4" />
            {label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      <div>
        {activeTab === "partitions" && <PartitionsTab />}
        {activeTab === "hangers" && <HangersTab />}
      </div>
    </div>
  );
}
