import { useParams, useNavigate } from "react-router-dom";
import { useGetCustomerInsights } from "../hooks/useCustomers";
import { cn } from "@/lib/utils";
import {
  ArrowRight, Phone, User, ShieldAlert,
  CreditCard, TrendingUp, SlidersHorizontal, Shirt, Ruler,
  Clock, Ban, ShieldCheck
} from "lucide-react";
import { Loader2 } from "lucide-react";

export default function CustomerDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const { data: insights, isLoading, error } = useGetCustomerInsights(id || "");

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <Loader2 className="w-10 h-10 text-primary animate-spin" />
        <p className="text-muted-foreground text-sm font-semibold">جاري تحميل إحصائيات العميل...</p>
      </div>
    );
  }

  if (error || !insights) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4 max-w-md mx-auto text-center">
        <div className="w-16 h-16 rounded-2xl bg-destructive/10 border border-destructive/20 flex items-center justify-center">
          <ShieldAlert className="w-8 h-8 text-destructive" />
        </div>
        <h3 className="text-xl font-bold text-foreground">العميل غير موجود</h3>
        <p className="text-muted-foreground text-sm">عذراً، لم نتمكن من العثور على إحصائيات هذا العميل.</p>
        <button
          onClick={() => navigate("/customers")}
          className="flex items-center gap-2 px-5 h-11 rounded-xl bg-accent border border-border text-foreground hover:bg-accent/85 font-bold transition-all text-sm mt-2 cursor-pointer"
        >
          العودة لقائمة العملاء
        </button>
      </div>
    );
  }

  const getTierBadge = (tier: string) => {
    switch (tier) {
      case "Gold":
        return {
          label: "عميل ذهبي",
          classes: "bg-amber-500/10 border-amber-500/30 text-amber-400 shadow-[0_0_8px_rgba(245,158,11,0.2)]",
          icon: ShieldCheck,
        };
      case "Silver":
        return {
          label: "عميل فضي",
          classes: "bg-slate-400/10 border-slate-400/30 text-slate-300",
          icon: ShieldCheck,
        };
      case "Bronze":
        return {
          label: "عميل برونزي",
          classes: "bg-orange-500/10 border-orange-500/30 text-orange-400",
          icon: ShieldCheck,
        };
      default:
        return {
          label: "عميل جديد",
          classes: "bg-blue-500/10 border-blue-500/30 text-blue-400",
          icon: User,
        };
    }
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "لا يوجد";
    const date = new Date(dateString);
    return date.toLocaleDateString("ar-EG-u-nu-latn", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const getInitials = (name: string) => {
    if (!name) return "?";
    return name.trim().split(/\s+/).slice(0, 2).map(p => p[0]).join("");
  };

  const tier = getTierBadge(insights.customerTier);
  const TierIcon = tier.icon;

  return (
    <div className="space-y-6">
      {/* Header / Back row */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => navigate("/customers")}
          className="w-10 h-10 rounded-xl bg-card border border-border flex items-center justify-center text-muted-foreground hover:text-foreground transition-all hover:bg-accent shrink-0 cursor-pointer"
        >
          <ArrowRight className="w-5 h-5 ml-0.5" />
        </button>

        <div className="flex flex-wrap items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary text-base font-black">
            {getInitials(insights.customerName)}
          </div>
          <div>
            <h1 className="text-2xl font-black text-foreground">{insights.customerName}</h1>
            <div className="flex items-center gap-2 mt-0.5 text-xs text-muted-foreground">
              <span className="flex items-center gap-1 font-mono">
                <Phone className="w-3.5 h-3.5 text-muted-foreground/60" />
                {insights.phone}
              </span>
              <span>•</span>
              <span className={cn("px-2 py-0.5 rounded-full border text-[10px] font-black flex items-center gap-1", tier.classes)}>
                <TierIcon className="w-3 h-3" />
                {tier.label}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Card 1: Rental Activity */}
        <div className="bg-card/75 backdrop-blur-sm border border-border/80 rounded-3xl p-6 space-y-4">
          <h3 className="text-base font-black text-primary flex items-center gap-2 border-b border-border/30 pb-3">
            <Shirt className="w-5 h-5 text-primary" />
            <span>نشاط الحجوزات والبدل</span>
          </h3>

          <div className="grid grid-cols-2 gap-4">
            <div className="bg-background/40 border border-border/60 rounded-2xl p-4 flex flex-col justify-between h-24">
              <span className="text-xs font-bold text-muted-foreground">إجمالي الحجوزات</span>
              <span className="text-2xl font-black text-foreground font-mono">{insights.totalBookings}</span>
            </div>
            
            <div className="bg-background/40 border border-border/60 rounded-2xl p-4 flex flex-col justify-between h-24">
              <span className="text-xs font-bold text-muted-foreground">تحت التجهيز (نشط)</span>
              <span className="text-2xl font-black text-amber-400 font-mono">{insights.activeBookings}</span>
            </div>

            <div className="bg-background/40 border border-border/60 rounded-2xl p-4 flex flex-col justify-between h-24">
              <span className="text-xs font-bold text-muted-foreground">خارج مع العميل</span>
              <span className="text-2xl font-black text-emerald-400 font-mono">{insights.pickedUpBookings}</span>
            </div>

            <div className="bg-background/40 border border-border/60 rounded-2xl p-4 flex flex-col justify-between h-24">
              <span className="text-xs font-bold text-muted-foreground">مرتجع ومكتمل</span>
              <span className="text-2xl font-black text-blue-400 font-mono">{insights.returnedBookings}</span>
            </div>
          </div>

          <div className="bg-background/40 border border-border/60 rounded-2xl p-4 flex items-center justify-between">
            <span className="text-xs font-bold text-muted-foreground">الحجوزات الملغاة</span>
            <span className="text-sm font-black text-red-400 font-mono flex items-center gap-1.5">
              <Ban className="w-3.5 h-3.5" />
              {insights.cancelledBookings}
            </span>
          </div>
        </div>

        {/* Card 2: Financial Details */}
        <div className="bg-card/75 backdrop-blur-sm border border-border/80 rounded-3xl p-6 space-y-4">
          <h3 className="text-base font-black text-primary flex items-center gap-2 border-b border-border/30 pb-3">
            <CreditCard className="w-5 h-5 text-primary" />
            <span>البيانات المالية والمبيعات</span>
          </h3>

          <div className="grid grid-cols-2 gap-4">
            <div className="bg-background/40 border border-border/60 rounded-2xl p-4 flex flex-col justify-between h-24">
              <span className="text-xs font-bold text-muted-foreground">إجمالي الإيرادات المطلوب</span>
              <span className="text-xl font-black text-foreground font-mono">{insights.totalRevenue} ج.م</span>
            </div>

            <div className="bg-background/40 border border-border/60 rounded-2xl p-4 flex flex-col justify-between h-24">
              <span className="text-xs font-bold text-muted-foreground">المبالغ المدفوعة</span>
              <span className="text-xl font-black text-emerald-400 font-mono">{insights.totalPaid} ج.م</span>
            </div>

            <div className="bg-background/40 border border-border/60 rounded-2xl p-4 flex flex-col justify-between h-24">
              <span className="text-xs font-bold text-muted-foreground">المبالغ المتبقية المستحقة</span>
              <span className="text-xl font-black text-amber-400 font-mono">{insights.totalPending} ج.م</span>
            </div>

            <div className="bg-background/40 border border-border/60 rounded-2xl p-4 flex flex-col justify-between h-24">
              <span className="text-xs font-bold text-muted-foreground">الخصومات / التعويضات</span>
              <span className="text-xl font-black text-red-400 font-mono">{insights.totalDeductions} ج.م</span>
            </div>
          </div>

          <div className="bg-background/40 border border-border/60 rounded-2xl p-4 flex items-center justify-between">
            <span className="text-xs font-bold text-muted-foreground">هل حصل على خصومات سابقاً؟</span>
            <span className={cn("text-xs font-black px-2.5 py-0.5 rounded-full border", 
              insights.hasDiscount ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400" : "bg-muted border-border text-muted-foreground"
            )}>
              {insights.hasDiscount ? "نعم" : "لا"}
            </span>
          </div>
        </div>

        {/* Card 3: Preferences & Sizes */}
        <div className="bg-card/75 backdrop-blur-sm border border-border/80 rounded-3xl p-6 space-y-4">
          <h3 className="text-base font-black text-primary flex items-center gap-2 border-b border-border/30 pb-3">
            <SlidersHorizontal className="w-5 h-5 text-primary" />
            <span>الخيارات والمقاسات المفضلة</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="bg-background/40 border border-border/60 rounded-2xl p-5 flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center border border-primary/20 shrink-0">
                <Shirt className="w-5 h-5 text-primary" />
              </div>
              <div>
                <span className="text-[10px] text-muted-foreground block font-bold">القسم الأكثر استخداماً</span>
                <span className="text-base font-black text-foreground">
                  {insights.mostUsedPartition ? `قسم ${insights.mostUsedPartition}` : "غير محدد"}
                </span>
              </div>
            </div>

            <div className="bg-background/40 border border-border/60 rounded-2xl p-5 flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center border border-primary/20 shrink-0">
                <Ruler className="w-5 h-5 text-primary" />
              </div>
              <div>
                <span className="text-[10px] text-muted-foreground block font-bold">مقاس البدلة المعتاد</span>
                <span className="text-base font-black text-foreground">
                  {insights.mostUsedSuitSize ? `مقاس ${insights.mostUsedSuitSize}` : "غير محدد"}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Card 4: Historical & Performance */}
        <div className="bg-card/75 backdrop-blur-sm border border-border/80 rounded-3xl p-6 space-y-4">
          <h3 className="text-base font-black text-primary flex items-center gap-2 border-b border-border/30 pb-3">
            <TrendingUp className="w-5 h-5 text-primary" />
            <span>مؤشرات فترات الإيجار والإلغاء</span>
          </h3>

          <div className="grid grid-cols-2 gap-4 text-xs font-bold">
            <div className="bg-background/40 border border-border/60 rounded-2xl p-4 flex flex-col justify-between h-20">
              <span className="text-[10px] text-muted-foreground block">معدل الإلغاء</span>
              <span className="text-lg font-black text-foreground font-mono">{(insights.cancellationRate * 100).toFixed(0)}%</span>
            </div>

            <div className="bg-background/40 border border-border/60 rounded-2xl p-4 flex flex-col justify-between h-20">
              <span className="text-[10px] text-muted-foreground block">معدل أيام الإيجار (المتوسط)</span>
              <span className="text-lg font-black text-foreground font-mono">{insights.averageRentalDays} يوم</span>
            </div>
          </div>

          <div className="bg-background/40 border border-border/60 rounded-2xl p-4 space-y-2">
            <div className="flex justify-between items-center text-xs">
              <span className="text-muted-foreground font-bold flex items-center gap-1.5"><Clock className="w-3.5 h-3.5" /> أول حجز تم تسجيله</span>
              <span className="font-mono text-foreground font-bold">{formatDate(insights.firstBookingDate)}</span>
            </div>
            
            <div className="flex justify-between items-center text-xs border-t border-border/30 pt-2">
              <span className="text-muted-foreground font-bold flex items-center gap-1.5"><Clock className="w-3.5 h-3.5" /> آخر حجز تم تسجيله</span>
              <span className="font-mono text-foreground font-bold">{formatDate(insights.lastBookingDate)}</span>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
