import { useGetPartitions } from "@/features/partitions/hooks/usePartitions";
import { cn } from "@/lib/utils";
import { Loader2, AlertCircle, UserCircle, Bell } from "lucide-react";
import { useNavigate } from "react-router-dom";

// ─── Custom Icons to Match Screenshot Exactly ──────────────────────
const WardrobeIcon = ({ className }: { className?: string }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <rect width="18" height="18" x="3" y="3" rx="2" />
    <path d="M12 3v18" />
    <path d="M8 10h1" />
    <path d="M15 10h-1" />
  </svg>
);

const HangerIcon = ({ className }: { className?: string }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <path d="M12 7c.5 0 1-.2 1.4-.5.9-.7 1-2 .3-2.9C13 2.7 11.7 2.6 11 3.3c-.5.4-.8.9-.8 1.5 0 .5-.2 1-.5 1.4L2.8 15c-.5.7-.3 1.7.4 2.2.3.2.6.3.9.3h15.8c.8 0 1.5-.7 1.5-1.5 0-.3-.1-.6-.3-.9L14.3 7.8c-.3-.4-.5-.9-.5-1.4v-.6"/>
  </svg>
);

// ─── Skeleton ──────────────────────────────────────────────────────
const CardSkeleton = () => (
  <div className="bg-card border border-border rounded-3xl p-8 animate-pulse min-h-[300px]">
    <div className="h-10 w-24 rounded bg-muted mb-6" />
    <div className="h-40 rounded-2xl bg-muted" />
  </div>
);

// ─── Hanger Slot ──────────────────────────────────────────────────
const HangerSlot = ({ number, onClick }: { number: number; onClick: () => void }) => (
  <div
    onClick={onClick}
    className="flex flex-col items-center justify-center aspect-square rounded-xl bg-muted/40 border border-border hover:bg-primary/10 hover:border-primary/30 transition-all duration-200 cursor-pointer group"
  >
    <HangerIcon className="w-4 h-4 text-muted-foreground/60 group-hover:text-primary mb-0.5 transition-colors" />
    <span className="text-sm font-black text-muted-foreground group-hover:text-primary transition-colors leading-none">
      {number}
    </span>
  </div>
);

// ─── Partition Card ────────────────────────────────────────────────
interface PartitionCardProps {
  id: string;
  name: string;
  hangersCount: number;
  hangers: { id: string; number: number }[];
  onHangerClick: (partitionId: string, hangerId: string) => void;
}

const PartitionCard = ({ id, name, hangersCount, hangers, onHangerClick }: PartitionCardProps) => {
  return (
    <div
      className={cn(
        "relative group bg-card/65 border border-border/80 rounded-3xl overflow-hidden transition-all duration-300",
        "hover:border-primary/20 hover:shadow-lg hover:shadow-primary/5",
        "min-h-[280px] flex flex-col"
      )}
    >
      {/* Giant background letter (Watermark) */}
      <div
        className={cn(
          "absolute bottom-0 right-4 font-black leading-none select-none pointer-events-none",
          "text-[180px] text-foreground/[0.03] dark:text-foreground/[0.015]"
        )}
      >
        {name}
      </div>

      {/* Content */}
      <div className="relative z-10 p-6 flex flex-col flex-1">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2.5">
            <WardrobeIcon className="w-5 h-5 text-muted-foreground/80" />
            <h2 className="text-xl font-bold text-foreground">قسم {name}</h2>
          </div>
          <span className="px-3 py-1 rounded-full border border-primary/20 bg-primary/10 text-primary text-xs font-bold flex items-center gap-1.5">
            <HangerIcon className="w-3.5 h-3.5" />
            {hangersCount} شماعة
          </span>
        </div>

        {/* Hangers Area with Dashed Inner Border */}
        <div className="flex-1 flex flex-col justify-center">
          {hangersCount === 0 ? (
            <div className="relative border border-dashed border-border/60 rounded-2xl p-6 flex flex-col items-center justify-center min-h-[160px] bg-card/10">
              {/* Hanger rack ticks matching the screenshot */}
              <div className="absolute top-0 left-0 right-0 h-4 flex justify-around px-8">
                <div className="w-px h-2.5 bg-border/40" />
                <div className="w-px h-2.5 bg-border/40" />
                <div className="w-px h-2.5 bg-border/40" />
                <div className="w-px h-2.5 bg-border/40" />
                <div className="w-px h-2.5 bg-border/40" />
              </div>
              
              <HangerIcon className="w-10 h-10 text-muted-foreground/40 mb-3 mt-4" />
              <p className="text-sm font-semibold text-muted-foreground/80">لا توجد شماعات في هذا القسم</p>
            </div>
          ) : (
            <div className="border border-border/40 rounded-2xl p-6 bg-card/10">
              <p className="text-xs font-bold text-muted-foreground/80 uppercase tracking-widest mb-3">
                الشماعات المتاحة
              </p>
              <div className="grid grid-cols-5 sm:grid-cols-6 lg:grid-cols-8 gap-2">
                {hangers.map((h) => (
                  <HangerSlot key={h.id} number={h.number} onClick={() => onHangerClick(id, h.id)} />
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// ─── Page ──────────────────────────────────────────────────────────
export default function HomePage() {
  const navigate = useNavigate();
  const { data, isLoading, error } = useGetPartitions({ pageSize: 50 });
  const partitions = data?.items ?? [];

  const handleHangerClick = (partitionId: string, hangerId: string) => {
    navigate("/bookings/create", { state: { partitionId, hangerId } });
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-2">
        {/* Top-Left Icons (Profile & Notification) */}
        <div className="flex items-center gap-4 text-primary order-2 md:order-1">
          <button className="text-primary hover:text-primary-foreground hover:scale-105 transition-all p-1">
            <UserCircle className="w-6 h-6" />
          </button>
          <button className="text-primary hover:text-primary-foreground hover:scale-105 transition-all p-1 relative">
            <Bell className="w-6 h-6" />
          </button>
        </div>

        {/* Centered Title */}
        <div className="text-center space-y-1.5 flex-1 order-1 md:order-2">
          <h1 className="text-4xl font-extrabold text-primary tracking-tight">اختر القسم والشماعة</h1>
          <p className="text-muted-foreground text-sm font-medium">اختر القسم المناسب لحجز بدلتك</p>
        </div>

        {/* Balancer spacer for desktop layout */}
        <div className="hidden md:block w-20 order-3" />
      </div>

      {/* Stats Bar */}
      {!isLoading && !error && partitions.length > 0 && (
        <div className="flex items-center justify-center gap-10 py-3.5 px-8 rounded-2xl bg-card border border-border max-w-xl mx-auto shadow-sm">
          <div className="flex items-center gap-2">
            <WardrobeIcon className="w-5 h-5 text-primary" />
            <span className="text-sm font-bold text-foreground">
              {partitions.length} <span className="text-muted-foreground font-semibold">أقسام</span>
            </span>
          </div>
          <div className="w-px h-5 bg-border" />
          <div className="flex items-center gap-2">
            <HangerIcon className="w-5 h-5 text-primary" />
            <span className="text-sm font-bold text-foreground">
              {partitions.reduce((s, p) => s + p.hangersCount, 0)} <span className="text-muted-foreground font-semibold">شماعة إجمالي</span>
            </span>
          </div>
        </div>
      )}

      {/* Loading */}
      {isLoading && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {Array.from({ length: 4 }).map((_, i) => <CardSkeleton key={i} />)}
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="flex items-center gap-4 p-6 rounded-2xl bg-destructive/10 border border-destructive/20 max-w-xl mx-auto">
          <div className="w-12 h-12 rounded-2xl bg-destructive/20 flex items-center justify-center shrink-0">
            <AlertCircle className="w-6 h-6 text-destructive" />
          </div>
          <div>
            <p className="text-destructive font-bold mb-1">فشل تحميل البيانات</p>
            <p className="text-destructive/70 text-sm">تأكد من تشغيل الخادم وأعد المحاولة</p>
          </div>
        </div>
      )}

      {/* Empty State */}
      {!isLoading && !error && partitions.length === 0 && (
        <div className="flex flex-col items-center justify-center py-32 text-center">
          <div className="w-20 h-20 rounded-3xl bg-card border border-border flex items-center justify-center mb-6">
            <WardrobeIcon className="w-10 h-10 text-muted-foreground" />
          </div>
          <h3 className="text-xl font-bold text-muted-foreground mb-2">لا توجد أقسام</h3>
          <p className="text-muted-foreground text-sm">
            اذهب إلى{" "}
            <span className="text-primary font-semibold">الإعدادات</span>{" "}
            لإضافة أقسام وشماعات
          </p>
        </div>
      )}

      {/* Partitions Grid */}
      {!isLoading && !error && partitions.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {partitions.map((p) => (
            <PartitionCard
              key={p.id}
              id={p.id}
              name={p.name}
              hangersCount={p.hangersCount}
              hangers={p.hangers}
              onHangerClick={handleHangerClick}
            />
          ))}
        </div>
      )}

      {/* Background Loading Spinner */}
      {isLoading && (
        <div className="fixed bottom-6 right-6 w-10 h-10 rounded-full bg-primary flex items-center justify-center shadow-xl shadow-primary/30">
          <Loader2 className="w-5 h-5 text-primary-foreground animate-spin" />
        </div>
      )}
    </div>
  );
}
