import { useParams, useNavigate } from "react-router-dom";
import { useGetPartitionById } from "../hooks/usePartitions";
import { ArrowRight, Hash, Loader2, AlertCircle } from "lucide-react";

export default function PartitionDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: partition, isLoading, error } = useGetPartitionById(id ?? "");

  if (isLoading) return (
    <div className="flex items-center justify-center py-32">
      <Loader2 className="w-8 h-8 text-indigo-400 animate-spin" />
    </div>
  );

  if (error || !partition) return (
    <div className="flex flex-col items-center justify-center py-32 text-center">
      <div className="w-16 h-16 rounded-2xl bg-red-500/10 flex items-center justify-center mb-4">
        <AlertCircle className="w-8 h-8 text-red-400" />
      </div>
      <p className="text-slate-300 font-semibold mb-4">القسم غير موجود</p>
      <button onClick={() => navigate("/partitions")} className="px-5 h-10 rounded-xl border border-white/10 text-slate-300 hover:bg-white/5 transition-all text-sm font-semibold">
        العودة للأقسام
      </button>
    </div>
  );

  return (
    <div className="space-y-6 max-w-2xl">
      {/* Back */}
      <button onClick={() => navigate("/partitions")} className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors text-sm font-medium">
        <ArrowRight className="w-4 h-4" /> العودة للأقسام
      </button>

      {/* Header Card */}
      <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
        <div className="flex items-center gap-4 mb-6">
          <div className="w-14 h-14 rounded-2xl bg-indigo-500/20 flex items-center justify-center text-2xl font-black text-indigo-300">
            {partition.name}
          </div>
          <div>
            <h1 className="text-2xl font-black text-white">قسم {partition.name}</h1>
            <p className="text-slate-400 text-sm">{partition.hangersCount} شماعة مسجلة</p>
          </div>
        </div>

        {/* Hangers Grid */}
        {partition.hangers.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-10 text-center">
            <Hash className="w-8 h-8 text-slate-600 mb-3" />
            <p className="text-slate-500 text-sm">لا توجد شماعات في هذا القسم</p>
          </div>
        ) : (
          <>
            <h2 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-3">الشماعات</h2>
            <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
              {partition.hangers.map(h => (
                <div key={h.id} className="aspect-square rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center">
                  <span className="text-indigo-300 font-black text-lg">#{h.number}</span>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
