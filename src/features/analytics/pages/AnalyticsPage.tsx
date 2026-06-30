import { useState } from "react";
import {
  useGetDailyReport,
  useGetWeeklyReport,
  useGetMonthlyReport,
  useGetAnnualReport,
  useGetSuitSizes,
  useGetSuitSizesAvailability,
  useGetHangersUtilization,
  useGetPartitionPerformance,
  useGetRevenueBreakdown,
  useGetPendingPayments,
  useGetAccessories,
  useGetPeakTimes,
  useGetCustomerRetention,
  useGetRiskReport,
  useGetMostRequestedSuits,
} from "../hooks/useAnalytics";
import { useGetPartitions } from "@/features/partitions/hooks/usePartitions";
import {
  BarChart3,
  Calendar,
  DollarSign,
  Activity,
  AlertTriangle,
  UserCheck,
  CheckCircle,
  Shirt,
  Sliders,
  Info,
  FileSpreadsheet,
  TrendingDown,
  TrendingUp,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { analyticsService } from "../services/analyticsService";
import { toast } from "sonner";

// Custom helper to render progress bar
const ProgressBar = ({ value, max = 100, className }: { value: number; max?: number; className?: string }) => {
  const percent = Math.min(100, Math.max(0, (value / max) * 100));
  return (
    <div className="w-full bg-border/40 rounded-full h-2.5 overflow-hidden">
      <div
        className={cn("bg-primary h-full transition-all duration-500 rounded-full", className)}
        style={{ width: `${percent}%` }}
      />
    </div>
  );
};

export default function AnalyticsPage() {
  // Main tabs: "periodic" | "finance" | "inventory" | "behavior"
  const [activeTab, setActiveTab] = useState<"periodic" | "finance" | "inventory" | "behavior">("periodic");

  // Sub-tabs under periodic: "daily" | "weekly" | "monthly" | "annual"
  const [periodicSubTab, setPeriodicSubTab] = useState<"daily" | "weekly" | "monthly" | "annual">("daily");

  // Filters state
  const todayStr = new Date().toISOString().split("T")[0];
  const [selectedDate, setSelectedDate] = useState(todayStr);
  const [selectedWeekStart, setSelectedWeekStart] = useState(todayStr);
  
  const currentYear = new Date().getFullYear();
  const currentMonth = new Date().getMonth() + 1;
  const [selectedYear, setSelectedYear] = useState(currentYear);
  const [selectedMonth, setSelectedMonth] = useState(currentMonth);
  const [selectedAnnualYear, setSelectedAnnualYear] = useState(currentYear);

  // Range filters
  const startOfYearStr = `${currentYear}-01-01`;
  const [revenueFrom, setRevenueFrom] = useState(startOfYearStr);
  const [revenueTo, setRevenueTo] = useState(todayStr);
  const [suitSizesFrom, setSuitSizesFrom] = useState(startOfYearStr);
  const [suitSizesTo, setSuitSizesTo] = useState(todayStr);
  const [selectedPartitionId, setSelectedPartitionId] = useState<string>("all");

  // Behavior & risks date filters
  const [behaviorFrom, setBehaviorFrom] = useState(startOfYearStr);
  const [behaviorTo, setBehaviorTo] = useState(todayStr);

  // Excel exporting state
  const [exporting, setExporting] = useState<Record<number, boolean>>({});

  const handleExport = async (reportType: number, from?: string, to?: string) => {
    setExporting((prev) => ({ ...prev, [reportType]: true }));
    try {
      const blob = await analyticsService.exportExcel(reportType, from, to);
      const names = {
        0: "سجل-الحجوزات",
        1: "الإيراد-الشهري",
        2: "المدفوعات-المعلقة",
        3: "المخزون-والمقاسات",
        4: "سجل-المصروفات",
        5: "الحسابات-التفصيلي-الموحد",
      };
      const name = names[reportType as keyof typeof names] || "تقرير";
      const suffix = from || to ? `_${from ?? ""}_${to ?? ""}` : `_${new Date().toISOString().split("T")[0]}`;
      const fileName = `${name}${suffix}.xlsx`;

      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", fileName);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      toast.success("تم تصدير ملف Excel بنجاح");
    } catch (err) {
      console.error("Export failed", err);
      toast.error("فشل تصدير ملف Excel");
    } finally {
      setExporting((prev) => ({ ...prev, [reportType]: false }));
    }
  };

  const getWeekRange = (startStr: string) => {
    const start = new Date(startStr);
    const end = new Date(start);
    end.setDate(start.getDate() + 6);
    return {
      from: startStr,
      to: end.toISOString().split("T")[0],
    };
  };

  const getMonthRange = (year: number, month: number) => {
    const from = `${year}-${String(month).padStart(2, "0")}-01`;
    const end = new Date(year, month, 0);
    const to = `${year}-${String(month).padStart(2, "0")}-${String(end.getDate()).padStart(2, "0")}`;
    return { from, to };
  };

  const getYearRange = (year: number) => {
    return {
      from: `${year}-01-01`,
      to: `${year}-12-31`,
    };
  };

  // Fetching Data Queries
  const { data: dailyData, isLoading: dailyLoading } = useGetDailyReport(selectedDate);
  const { data: weeklyData, isLoading: weeklyLoading } = useGetWeeklyReport(selectedWeekStart);
  const { data: monthlyData, isLoading: monthlyLoading } = useGetMonthlyReport(selectedYear, selectedMonth);
  const { data: annualData, isLoading: annualLoading } = useGetAnnualReport(selectedAnnualYear);

  const { data: suitSizesRanking, isLoading: suitSizesRankLoading } = useGetSuitSizes(suitSizesFrom, suitSizesTo);
  const { data: suitSizesAvailability, isLoading: suitSizesAvailLoading } = useGetSuitSizesAvailability();
  const { data: mostRequestedSuits, isLoading: mostRequestedSuitsLoading } = useGetMostRequestedSuits(suitSizesFrom, suitSizesTo);
  const { data: partitionsList } = useGetPartitions({ pageSize: 50 });
  const { data: hangersUtilization, isLoading: hangersUtilLoading } = useGetHangersUtilization(
    selectedPartitionId === "all" ? undefined : selectedPartitionId
  );
  const { data: partitionsPerformance, isLoading: partitionsPerfLoading } = useGetPartitionPerformance();

  const { data: revenueBreakdown, isLoading: revenueLoading } = useGetRevenueBreakdown(revenueFrom, revenueTo);
  const { data: pendingPayments, isLoading: pendingLoading } = useGetPendingPayments(revenueFrom, revenueTo);

  const { data: accessoriesData, isLoading: accessoriesLoading } = useGetAccessories(behaviorFrom, behaviorTo);
  const { data: peakTimesData, isLoading: peakTimesLoading } = useGetPeakTimes(behaviorFrom, behaviorTo);
  const { data: customerRetention, isLoading: retentionLoading } = useGetCustomerRetention();
  const { data: riskReport, isLoading: riskLoading } = useGetRiskReport(behaviorFrom, behaviorTo);

  return (
    <div className="space-y-6 max-w-7xl mx-auto px-4 sm:px-6 pb-12" dir="rtl">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-border/40 pb-5">
        <div className="text-right space-y-1">
          <h1 className="text-2xl md:text-3xl font-black text-foreground tracking-tight flex items-center justify-start gap-2.5">
            <BarChart3 className="w-8 h-8 text-primary" />
            <span>التحليلات والتقارير الإحصائية</span>
          </h1>
          <p className="text-muted-foreground text-xs md:text-sm font-medium">
            متابعة حية لأداء المحل، الإيرادات المالية، نسب المخاطر وتوزيع مقاسات البدلات
          </p>
        </div>
      </div>

      {/* Main Tab Navigation */}
      <div className="flex overflow-x-auto gap-2 p-1 rounded-2xl bg-card border border-border/80 scrollbar-none">
        <button
          onClick={() => setActiveTab("periodic")}
          className={cn(
            "flex items-center gap-2 px-5 py-3 rounded-xl font-bold text-xs md:text-sm whitespace-nowrap transition-all cursor-pointer",
            activeTab === "periodic" ? "bg-primary text-primary-foreground shadow-md" : "text-muted-foreground hover:text-foreground hover:bg-accent/40"
          )}
        >
          <Calendar className="w-4 h-4" />
          <span>التقارير الدورية</span>
        </button>

        <button
          onClick={() => setActiveTab("finance")}
          className={cn(
            "flex items-center gap-2 px-5 py-3 rounded-xl font-bold text-xs md:text-sm whitespace-nowrap transition-all cursor-pointer",
            activeTab === "finance" ? "bg-primary text-primary-foreground shadow-md" : "text-muted-foreground hover:text-foreground hover:bg-accent/40"
          )}
        >
          <DollarSign className="w-4 h-4" />
          <span>المالية والديون المعلقة</span>
        </button>

        <button
          onClick={() => setActiveTab("inventory")}
          className={cn(
            "flex items-center gap-2 px-5 py-3 rounded-xl font-bold text-xs md:text-sm whitespace-nowrap transition-all cursor-pointer",
            activeTab === "inventory" ? "bg-primary text-primary-foreground shadow-md" : "text-muted-foreground hover:text-foreground hover:bg-accent/40"
          )}
        >
          <Shirt className="w-4 h-4" />
          <span>مقاسات وأقسام البدلات</span>
        </button>

        <button
          onClick={() => setActiveTab("behavior")}
          className={cn(
            "flex items-center gap-2 px-5 py-3 rounded-xl font-bold text-xs md:text-sm whitespace-nowrap transition-all cursor-pointer",
            activeTab === "behavior" ? "bg-primary text-primary-foreground shadow-md" : "text-muted-foreground hover:text-foreground hover:bg-accent/40"
          )}
        >
          <Activity className="w-4 h-4" />
          <span>سلوك العملاء والاتجاهات</span>
        </button>
      </div>

      {/* Tab Contents */}

      {/* ─── TAB 1: PERIODIC REPORTS ─── */}
      {activeTab === "periodic" && (
        <div className="space-y-6">
          {/* Subtabs Selector */}
          <div className="flex gap-2 border-b border-border/40 pb-2">
            {(["daily", "weekly", "monthly", "annual"] as const).map((sub) => {
              const labels = { daily: "تقرير يومي", weekly: "تقرير أسبوعي", monthly: "تقرير شهري", annual: "تقرير سنوي" };
              return (
                <button
                  key={sub}
                  onClick={() => setPeriodicSubTab(sub)}
                  className={cn(
                    "px-4 py-2 text-xs font-bold border-b-2 transition-all cursor-pointer",
                    periodicSubTab === sub ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground"
                  )}
                >
                  {labels[sub]}
                </button>
              );
            })}
          </div>

          {/* Subtab Contents: Daily */}
          {periodicSubTab === "daily" && (
            <div className="space-y-6">
              {/* Date Filter */}
              <div className="bg-card border border-border/85 rounded-3xl p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-2.5">
                  <Calendar className="w-5 h-5 text-muted-foreground" />
                  <span className="text-sm font-bold text-foreground">عرض اليوم المحدد:</span>
                </div>
                <div className="flex gap-2 w-full sm:w-auto">
                  <input
                    type="date"
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    className="px-4 h-11 rounded-xl bg-background border border-border text-foreground font-semibold outline-none focus:ring-2 focus:ring-primary text-sm transition-all flex-1 sm:flex-none"
                  />
                  <button
                    disabled={exporting[0]}
                    onClick={() => handleExport(0, selectedDate, selectedDate)}
                    className="flex items-center gap-2 px-4 h-11 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs md:text-sm transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed shrink-0"
                  >
                    {exporting[0] ? <Activity className="w-4 h-4 animate-spin" /> : <FileSpreadsheet className="w-4 h-4" />}
                    <span>تصدير اليوم (Excel)</span>
                  </button>
                </div>
              </div>

              {dailyLoading ? (
                <div className="flex justify-center py-12"><Activity className="w-8 h-8 text-primary animate-spin" /></div>
              ) : dailyData ? (
                <>
                  {/* Daily Stats Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    {/* revenue collected */}
                    <div className="bg-card border border-border/80 rounded-3xl p-6 relative overflow-hidden shadow-sm">
                      <div className="absolute top-0 right-0 w-24 h-24 bg-primary/5 rounded-full -mr-8 -mt-8" />
                      <div className="flex justify-between items-start">
                        <div className="space-y-1 text-right">
                          <span className="text-xs text-muted-foreground font-bold">الإيرادات المحصلة اليوم</span>
                          <h4 className="text-2xl font-black text-emerald-400 font-mono">{dailyData.revenueCollectedToday} ج.م</h4>
                        </div>
                        <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-400 shadow-inner">
                          <DollarSign className="w-5 h-5" />
                        </div>
                      </div>
                    </div>

                    {/* new bookings */}
                    <div className="bg-card border border-border/80 rounded-3xl p-6 relative overflow-hidden shadow-sm">
                      <div className="flex justify-between items-start">
                        <div className="space-y-1 text-right">
                          <span className="text-xs text-muted-foreground font-bold">حجوزات جديدة اليوم</span>
                          <h4 className="text-2xl font-black text-foreground font-mono">{dailyData.newBookings} حجز</h4>
                        </div>
                        <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary shadow-inner">
                          <Calendar className="w-5 h-5" />
                        </div>
                      </div>
                    </div>

                    {/* picked up today */}
                    <div className="bg-card border border-border/80 rounded-3xl p-6 relative overflow-hidden shadow-sm">
                      <div className="flex justify-between items-start">
                        <div className="space-y-1 text-right">
                          <span className="text-xs text-muted-foreground font-bold">مستلمة خارج المحل اليوم</span>
                          <h4 className="text-2xl font-black text-foreground font-mono">{dailyData.pickedUpToday} بدلة</h4>
                        </div>
                        <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-400 shadow-inner">
                          <UserCheck className="w-5 h-5" />
                        </div>
                      </div>
                    </div>

                    {/* returned today */}
                    <div className="bg-card border border-border/80 rounded-3xl p-6 relative overflow-hidden shadow-sm">
                      <div className="flex justify-between items-start">
                        <div className="space-y-1 text-right">
                          <span className="text-xs text-muted-foreground font-bold">المرتجعة اليوم للمحل</span>
                          <h4 className="text-2xl font-black text-foreground font-mono">{dailyData.returnedToday} بدلة</h4>
                        </div>
                        <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-400 shadow-inner">
                          <CheckCircle className="w-5 h-5" />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Secondary stats */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="bg-card border border-border rounded-3xl p-6 space-y-4">
                      <h4 className="text-sm font-black text-foreground border-b border-border/40 pb-2">الحالة اللحظية للمستودع والطلبات</h4>
                      <div className="space-y-3.5 text-xs font-semibold">
                        <div className="flex justify-between items-center">
                          <span className="text-muted-foreground">حجوزات تحت التجهيز (Active)</span>
                          <span className="font-extrabold text-foreground bg-primary/10 text-primary px-2.5 py-0.5 rounded-full">{dailyData.currentlyActive}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-muted-foreground">حجوزات بالخارج (PickedUp)</span>
                          <span className="font-extrabold text-foreground bg-amber-500/10 text-amber-400 px-2.5 py-0.5 rounded-full">{dailyData.currentlyPickedUp}</span>
                        </div>
                        <div className="flex justify-between items-center text-red-400">
                          <span className="font-bold">حجوزات متأخرة في الإرجاع (Overdue)</span>
                          <span className="font-extrabold bg-red-500/10 px-2.5 py-0.5 rounded-full flex items-center gap-1">
                            <AlertTriangle className="w-3.5 h-3.5" />
                            <span>{dailyData.overdueCount}</span>
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="bg-card border border-border rounded-3xl p-6 space-y-4">
                      <h4 className="text-sm font-black text-foreground border-b border-border/40 pb-2">تفاصيل مالية معلقة اليوم</h4>
                      <div className="space-y-3.5 text-xs font-semibold">
                        <div className="flex justify-between items-center">
                          <span className="text-muted-foreground">الإيرادات المعلقة الكلية (Active+PickedUp)</span>
                          <span className="font-extrabold text-foreground font-mono">{dailyData.pendingRevenue} ج.م</span>
                        </div>
                        <div className="flex justify-between items-center text-emerald-400">
                          <span>تعويضات تلف تم استلامها اليوم</span>
                          <span className="font-extrabold font-mono">+{dailyData.damageFeesCollected} ج.م</span>
                        </div>
                        <div className="flex justify-between items-center text-red-400/90">
                          <span>حجوزات تم إلغاؤها اليوم</span>
                          <span className="font-extrabold">{dailyData.cancelledToday} حجز</span>
                        </div>
                      </div>
                    </div>

                    <div className="bg-card border border-border rounded-3xl p-6 flex flex-col justify-center items-center text-center space-y-2">
                      <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary shadow-inner">
                        <Info className="w-6 h-6" />
                      </div>
                      <h5 className="text-sm font-bold text-foreground">تقرير يومي ديناميكي</h5>
                      <p className="text-xs text-muted-foreground leading-relaxed max-w-[240px]">
                        يعتمد هذا التقرير على تواريخ العمليات الفعلية (استلام، إرجاع، دفع) المسجلة داخل النظام باليوم المختار.
                      </p>
                    </div>
                  </div>
                </>
              ) : (
                <div className="text-center py-12 text-muted-foreground">لا توجد بيانات متاحة لهذا التاريخ</div>
              )}
            </div>
          )}

          {/* Subtab Contents: Weekly */}
          {periodicSubTab === "weekly" && (
            <div className="space-y-6">
              {/* Date Filter */}
              <div className="bg-card border border-border/85 rounded-3xl p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-2.5">
                  <Calendar className="w-5 h-5 text-muted-foreground" />
                  <span className="text-sm font-bold text-foreground">تاريخ بداية الأسبوع (السبت):</span>
                </div>
                <div className="flex gap-2 w-full sm:w-auto">
                  <input
                    type="date"
                    value={selectedWeekStart}
                    onChange={(e) => setSelectedWeekStart(e.target.value)}
                    className="px-4 h-11 rounded-xl bg-background border border-border text-foreground font-semibold outline-none focus:ring-2 focus:ring-primary text-sm transition-all flex-1 sm:flex-none"
                  />
                  <button
                    disabled={exporting[0]}
                    onClick={() => {
                      const range = getWeekRange(selectedWeekStart);
                      handleExport(0, range.from, range.to);
                    }}
                    className="flex items-center gap-2 px-4 h-11 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs md:text-sm transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed shrink-0"
                  >
                    {exporting[0] ? <Activity className="w-4 h-4 animate-spin" /> : <FileSpreadsheet className="w-4 h-4" />}
                    <span>تصدير الأسبوع (Excel)</span>
                  </button>
                </div>
              </div>

              {weeklyLoading ? (
                <div className="flex justify-center py-12"><Activity className="w-8 h-8 text-primary animate-spin" /></div>
              ) : weeklyData ? (
                <>
                  {/* Top Stats */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="bg-card border border-border rounded-3xl p-5 text-right">
                      <span className="text-xs text-muted-foreground block mb-1">إجمالي الحجوزات بالأسبوع</span>
                      <h4 className="text-2xl font-black text-foreground font-mono">{weeklyData.totalBookings} حجز</h4>
                    </div>
                    <div className="bg-card border border-border rounded-3xl p-5 text-right">
                      <span className="text-xs text-muted-foreground block mb-1">إجمالي إيرادات الأسبوع (المدفوع)</span>
                      <h4 className="text-2xl font-black text-emerald-400 font-mono">{weeklyData.totalRevenue} ج.م</h4>
                    </div>
                    <div className="bg-card border border-border rounded-3xl p-5 text-right">
                      <span className="text-xs text-muted-foreground block mb-1">اليوم الأكثر طلباً ورواجاً</span>
                      <h4 className="text-2xl font-black text-primary">{weeklyData.busiestDay || "غير محدد"}</h4>
                    </div>
                  </div>

                  {/* Daily breakdown list */}
                  <div className="bg-card border border-border rounded-3xl p-6">
                    <h3 className="text-base font-black text-foreground mb-4 border-b border-border/40 pb-2">التفصيل اليومي للأسبوع</h3>
                    
                    {/* SVG mini chart representation */}
                    <div className="flex h-48 items-end gap-3 sm:gap-6 border-b border-border/60 pb-2 pt-6 px-4">
                      {weeklyData.dailyBreakdown.map((day, idx) => {
                        const maxVal = Math.max(...weeklyData.dailyBreakdown.map(d => d.bookingsCount), 1);
                        const pct = (day.bookingsCount / maxVal) * 80 + 10; // offset between 10% and 90%
                        return (
                          <div key={idx} className="flex-1 flex flex-col items-center group relative">
                            {/* Hover tooltip */}
                            <div className="absolute bottom-full mb-2 bg-popover text-popover-foreground text-[10px] font-bold py-1 px-2.5 rounded-lg border border-border shadow-md opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10">
                              {day.bookingsCount} حجز ({day.revenue} ج.م)
                            </div>
                            <div 
                              className="w-full sm:w-10 bg-primary/25 group-hover:bg-primary rounded-t-lg transition-all duration-300" 
                              style={{ height: `${pct}%` }} 
                            />
                            <span className="text-[10px] text-muted-foreground font-bold mt-2 truncate w-full text-center">{day.dayName}</span>
                          </div>
                        );
                      })}
                    </div>

                    <div className="overflow-x-auto mt-6">
                      <table className="w-full text-right text-xs font-semibold">
                        <thead>
                          <tr className="border-b border-border/60 text-muted-foreground">
                            <th className="py-2.5 px-3">اليوم</th>
                            <th className="py-2.5 px-3">التاريخ</th>
                            <th className="py-2.5 px-3">عدد الحجوزات</th>
                            <th className="py-2.5 px-3 text-left">الإيرادات المحصلة</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-border/30">
                          {weeklyData.dailyBreakdown.map((day, idx) => (
                            <tr key={idx} className="hover:bg-accent/25 transition-colors">
                              <td className="py-3 px-3 font-bold text-foreground">{day.dayName}</td>
                              <td className="py-3 px-3 font-mono text-muted-foreground">{new Date(day.date).toLocaleDateString("ar-EG-u-nu-latn")}</td>
                              <td className="py-3 px-3">{day.bookingsCount} حجز</td>
                              <td className="py-3 px-3 text-left font-bold text-emerald-400 font-mono">{day.revenue} ج.م</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </>
              ) : (
                <div className="text-center py-12 text-muted-foreground">لا توجد بيانات أسبوعية متاحة</div>
              )}
            </div>
          )}

          {/* Subtab Contents: Monthly */}
          {periodicSubTab === "monthly" && (
            <div className="space-y-6">
              {/* Date Filter */}
              <div className="bg-card border border-border/85 rounded-3xl p-5 flex flex-wrap gap-4 items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <Calendar className="w-5 h-5 text-muted-foreground" />
                  <span className="text-sm font-bold text-foreground">الشهر والستة المستهدفة:</span>
                </div>
                <div className="flex flex-wrap gap-2 w-full sm:w-auto items-center">
                  <select
                    value={selectedMonth}
                    onChange={(e) => setSelectedMonth(Number(e.target.value))}
                    className="px-4 h-11 rounded-xl bg-background border border-border text-foreground font-semibold outline-none focus:ring-2 focus:ring-primary text-sm transition-all"
                  >
                    {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => (
                      <option key={m} value={m}>الشهر {m}</option>
                    ))}
                  </select>
                  <select
                    value={selectedYear}
                    onChange={(e) => setSelectedYear(Number(e.target.value))}
                    className="px-4 h-11 rounded-xl bg-background border border-border text-foreground font-semibold outline-none focus:ring-2 focus:ring-primary text-sm transition-all"
                  >
                    {[currentYear, currentYear - 1, currentYear - 2].map((y) => (
                      <option key={y} value={y}>{y}</option>
                    ))}
                  </select>
                  <button
                    disabled={exporting[0]}
                    onClick={() => {
                      const range = getMonthRange(selectedYear, selectedMonth);
                      handleExport(0, range.from, range.to);
                    }}
                    className="flex items-center gap-2 px-4 h-11 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs md:text-sm transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed shrink-0"
                  >
                    {exporting[0] ? <Activity className="w-4 h-4 animate-spin" /> : <FileSpreadsheet className="w-4 h-4" />}
                    <span>تصدير تفاصيل الحجوزات (Excel)</span>
                  </button>
                  <button
                    disabled={exporting[1]}
                    onClick={() => {
                      const range = getMonthRange(selectedYear, selectedMonth);
                      handleExport(1, range.from, range.to);
                    }}
                    className="flex items-center gap-2 px-4 h-11 rounded-xl border border-emerald-600 hover:bg-emerald-600/10 text-emerald-400 font-bold text-xs md:text-sm transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed shrink-0"
                  >
                    {exporting[1] ? <Activity className="w-4 h-4 animate-spin" /> : <FileSpreadsheet className="w-4 h-4" />}
                    <span>ملخص الإيراد الشهري</span>
                  </button>
                </div>
              </div>

              {monthlyLoading ? (
                <div className="flex justify-center py-12"><Activity className="w-8 h-8 text-primary animate-spin" /></div>
              ) : monthlyData ? (
                <>
                  {/* Monthly Stats Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="bg-card border border-border rounded-3xl p-5 text-right">
                      <span className="text-xs text-muted-foreground block mb-1">إجمالي الحجوزات</span>
                      <h4 className="text-2xl font-black text-foreground font-mono">{monthlyData.totalBookings} حجز</h4>
                      <span className="text-[10px] text-muted-foreground block mt-1">
                        تغير الحجوزات: <span className={cn("font-bold font-mono", monthlyData.bookingsChangePercent >= 0 ? "text-emerald-400" : "text-red-400")}>
                          {monthlyData.bookingsChangePercent >= 0 ? "+" : ""}{monthlyData.bookingsChangePercent}%
                        </span>
                      </span>
                    </div>

                    <div className="bg-card border border-border rounded-3xl p-5 text-right">
                      <span className="text-xs text-muted-foreground block mb-1">إجمالي إيراد الصافي (Net)</span>
                      <h4 className="text-2xl font-black text-emerald-400 font-mono">{monthlyData.netRevenue} ج.م</h4>
                      <span className="text-[10px] text-muted-foreground block mt-1">
                        تغير الإيرادات: <span className={cn("font-bold font-mono", monthlyData.revenueChangePercent >= 0 ? "text-emerald-400" : "text-red-400")}>
                          {monthlyData.revenueChangePercent >= 0 ? "+" : ""}{monthlyData.revenueChangePercent.toFixed(1)}%
                        </span>
                      </span>
                    </div>

                    <div className="bg-card border border-border rounded-3xl p-5 text-right">
                      <span className="text-xs text-muted-foreground block mb-1">المبلغ المحصل فعلاً</span>
                      <h4 className="text-2xl font-black text-foreground font-mono">{monthlyData.actualCollected} ج.م</h4>
                      <span className="text-[10px] text-muted-foreground block mt-1">المتبقي المطلوب: {monthlyData.outstandingBalance} ج.م</span>
                    </div>

                    <div className="bg-card border border-border rounded-3xl p-5 text-right">
                      <span className="text-xs text-muted-foreground block mb-1">خصومات منحت للعملاء</span>
                      <h4 className="text-2xl font-black text-amber-400 font-mono">{monthlyData.totalDiscountsGiven} ج.م</h4>
                      <span className="text-[10px] text-muted-foreground block mt-1">المقاس الأكثر رواجاً: {monthlyData.topSuitSize || "لا يوجد"}</span>
                    </div>
                  </div>

                  {/* Breakdown details */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-card border border-border rounded-3xl p-6">
                      <h4 className="text-sm font-black text-foreground border-b border-border/40 pb-2 mb-4">حالة الحجوزات لهذا الشهر</h4>
                      <div className="space-y-4">
                        <div>
                          <div className="flex justify-between items-center text-xs font-bold text-muted-foreground mb-1.5">
                            <span>تحت التجهيز (Active)</span>
                            <span className="text-foreground">{monthlyData.activeBookings} حجز</span>
                          </div>
                          <ProgressBar value={monthlyData.activeBookings} max={monthlyData.totalBookings} className="bg-primary" />
                        </div>
                        <div>
                          <div className="flex justify-between items-center text-xs font-bold text-muted-foreground mb-1.5">
                            <span>خارج مع العميل (PickedUp)</span>
                            <span className="text-foreground">{monthlyData.pickedUpBookings} حجز</span>
                          </div>
                          <ProgressBar value={monthlyData.pickedUpBookings} max={monthlyData.totalBookings} className="bg-amber-500" />
                        </div>
                        <div>
                          <div className="flex justify-between items-center text-xs font-bold text-muted-foreground mb-1.5">
                            <span>مرتجع ومكتمل (Returned)</span>
                            <span className="text-foreground">{monthlyData.returnedBookings} حجز</span>
                          </div>
                          <ProgressBar value={monthlyData.returnedBookings} max={monthlyData.totalBookings} className="bg-emerald-500" />
                        </div>
                        <div>
                          <div className="flex justify-between items-center text-xs font-bold text-muted-foreground mb-1.5">
                            <span>حجوزات ملغاة (Cancelled)</span>
                            <span className="text-foreground">{monthlyData.cancelledBookings} حجز</span>
                          </div>
                          <ProgressBar value={monthlyData.cancelledBookings} max={monthlyData.totalBookings} className="bg-red-500" />
                        </div>
                      </div>
                    </div>

                    <div className="bg-card border border-border rounded-3xl p-6 space-y-4">
                      <h4 className="text-sm font-black text-foreground border-b border-border/40 pb-2">التفاصيل المالية المتكاملة</h4>
                      <div className="space-y-3.5 text-xs font-semibold">
                        <div className="flex justify-between items-center">
                          <span className="text-muted-foreground">الإيرادات الإجمالية قبل الخصم (Gross)</span>
                          <span className="font-extrabold text-foreground font-mono">{monthlyData.grossRevenue} ج.م</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-muted-foreground">الصافي بعد الخصومات (Net)</span>
                          <span className="font-extrabold text-emerald-400 font-mono">{monthlyData.netRevenue} ج.م</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-muted-foreground">ودائع تأمين محتجزة بالخزنة</span>
                          <span className="font-extrabold text-foreground font-mono">{monthlyData.totalDepositsHeld} ج.م</span>
                        </div>
                        <div className="flex justify-between items-center text-emerald-400">
                          <span>تعويضات تلف تم استلامها</span>
                          <span className="font-extrabold font-mono">+{monthlyData.totalDamageFees}.00 ج.م</span>
                        </div>
                        <div className="flex justify-between items-center text-primary">
                          <span>عملاء جدد انضموا هذا الشهر</span>
                          <span className="font-extrabold">+{monthlyData.newCustomers} عميل</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </>
              ) : (
                <div className="text-center py-12 text-muted-foreground">لا توجد بيانات شهرية متاحة</div>
              )}
            </div>
          )}

          {/* Subtab Contents: Annual */}
          {periodicSubTab === "annual" && (
            <div className="space-y-6">
              {/* Date Filter */}
              <div className="bg-card border border-border/85 rounded-3xl p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-2.5">
                  <Calendar className="w-5 h-5 text-muted-foreground" />
                  <span className="text-sm font-bold text-foreground">السنة المستهدفة:</span>
                </div>
                <div className="flex flex-wrap gap-2 w-full sm:w-auto">
                  <select
                    value={selectedAnnualYear}
                    onChange={(e) => setSelectedAnnualYear(Number(e.target.value))}
                    className="px-4 h-11 rounded-xl bg-background border border-border text-foreground font-semibold outline-none focus:ring-2 focus:ring-primary text-sm transition-all flex-1 sm:flex-none"
                  >
                    {[currentYear, currentYear - 1, currentYear - 2].map((y) => (
                      <option key={y} value={y}>{y}</option>
                    ))}
                  </select>
                  <button
                    disabled={exporting[0]}
                    onClick={() => {
                      const range = getYearRange(selectedAnnualYear);
                      handleExport(0, range.from, range.to);
                    }}
                    className="flex items-center gap-2 px-4 h-11 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs md:text-sm transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed shrink-0"
                  >
                    {exporting[0] ? <Activity className="w-4 h-4 animate-spin" /> : <FileSpreadsheet className="w-4 h-4" />}
                    <span>تصدير تفاصيل الحجوزات (Excel)</span>
                  </button>
                  <button
                    disabled={exporting[1]}
                    onClick={() => {
                      const range = getYearRange(selectedAnnualYear);
                      handleExport(1, range.from, range.to);
                    }}
                    className="flex items-center gap-2 px-4 h-11 rounded-xl border border-emerald-600 hover:bg-emerald-600/10 text-emerald-400 font-bold text-xs md:text-sm transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed shrink-0"
                  >
                    {exporting[1] ? <Activity className="w-4 h-4 animate-spin" /> : <FileSpreadsheet className="w-4 h-4" />}
                    <span>ملخص الإيراد السنوي</span>
                  </button>
                </div>
              </div>

              {annualLoading ? (
                <div className="flex justify-center py-12"><Activity className="w-8 h-8 text-primary animate-spin" /></div>
              ) : annualData ? (
                <>
                  {/* Top Stats Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="bg-card border border-border rounded-3xl p-5 text-right">
                      <span className="text-xs text-muted-foreground block mb-1">إجمالي الحجوزات السنوية</span>
                      <h4 className="text-2xl font-black text-foreground font-mono">{annualData.totalBookings} حجز</h4>
                    </div>

                    <div className="bg-card border border-border rounded-3xl p-5 text-right">
                      <span className="text-xs text-muted-foreground block mb-1">إجمالي الإيرادات السنوية</span>
                      <h4 className="text-2xl font-black text-emerald-400 font-mono">{annualData.totalRevenue} ج.م</h4>
                    </div>

                    <div className="bg-card border border-border rounded-3xl p-5 text-right">
                      <span className="text-xs text-muted-foreground block mb-1">معدل النمو السنوي (YoY)</span>
                      <h4 className="text-2xl font-black text-primary font-mono">
                        {annualData.yearOverYearGrowthPercent >= 0 ? "+" : ""}{annualData.yearOverYearGrowthPercent.toFixed(1)}%
                      </h4>
                    </div>

                    <div className="bg-card border border-border rounded-3xl p-5 text-right">
                      <span className="text-xs text-muted-foreground block mb-1">بدل مرتجعة متضررة (Damaged)</span>
                      <h4 className="text-2xl font-black text-red-400 font-mono">{annualData.totalDamagedSuits} تلف</h4>
                    </div>
                  </div>

                  {/* Peak months cards */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="bg-card border border-border rounded-3xl p-5 text-right">
                      <span className="text-xs text-muted-foreground block mb-1">أعلى الشهور إيراداً (الذروة)</span>
                      <h4 className="text-lg font-black text-emerald-400">{annualData.peakMonth || "غير محدد"}</h4>
                    </div>
                    <div className="bg-card border border-border rounded-3xl p-5 text-right">
                      <span className="text-xs text-muted-foreground block mb-1">أقل الشهور نشاطاً</span>
                      <h4 className="text-lg font-black text-muted-foreground">{annualData.slowestMonth || "غير محدد"}</h4>
                    </div>
                    <div className="bg-card border border-border rounded-3xl p-5 text-right">
                      <span className="text-xs text-muted-foreground block mb-1">إجمالي عملاء جدد هذا العام</span>
                      <h4 className="text-lg font-black text-primary">+{annualData.totalNewCustomers} عميل</h4>
                    </div>
                  </div>

                  {/* Monthly breakdown table */}
                  <div className="bg-card border border-border rounded-3xl p-6">
                    <h3 className="text-base font-black text-foreground mb-4 border-b border-border/40 pb-2">التفصيل الشهري للسنة</h3>
                    <div className="overflow-x-auto">
                      <table className="w-full text-right text-xs font-semibold">
                        <thead>
                          <tr className="border-b border-border/60 text-muted-foreground">
                            <th className="py-2.5 px-3">الشهر</th>
                            <th className="py-2.5 px-3">عدد الحجوزات</th>
                            <th className="py-2.5 px-3">عملاء جدد</th>
                            <th className="py-2.5 px-3 text-left">الإيرادات المحصلة</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-border/30">
                          {annualData.monthlyBreakdown.map((m, idx) => (
                            <tr key={idx} className="hover:bg-accent/25 transition-colors">
                              <td className="py-3 px-3 font-bold text-foreground">{m.monthName}</td>
                              <td className="py-3 px-3">{m.bookingsCount} حجز</td>
                              <td className="py-3 px-3">+{m.newCustomers} عميل</td>
                              <td className="py-3 px-3 text-left font-bold text-emerald-400 font-mono">{m.revenue} ج.م</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </>
              ) : (
                <div className="text-center py-12 text-muted-foreground">لا توجد تقارير سنوية متاحة</div>
              )}
            </div>
          )}
        </div>
      )}

      {/* ─── TAB 2: FINANCE AND OUTSTANDING DUES ─── */}
      {activeTab === "finance" && (
        <div className="space-y-6">
          {/* Filters Range */}
          <div className="bg-card border border-border/85 rounded-3xl p-5 flex flex-wrap gap-4 items-center justify-between">
            <div className="flex items-center gap-2.5">
              <Calendar className="w-5 h-5 text-muted-foreground" />
              <span className="text-sm font-bold text-foreground">تحديد الفترة المالية المستهدفة:</span>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <div className="flex items-center gap-2 text-xs font-bold text-muted-foreground">
                <span>من:</span>
                <input
                  type="date"
                  value={revenueFrom}
                  onChange={(e) => setRevenueFrom(e.target.value)}
                  className="px-3 h-10 rounded-xl bg-background border border-border text-foreground font-semibold outline-none text-xs transition-all"
                />
                <span>إلى:</span>
                <input
                  type="date"
                  value={revenueTo}
                  onChange={(e) => setRevenueTo(e.target.value)}
                  className="px-3 h-10 rounded-xl bg-background border border-border text-foreground font-semibold outline-none text-xs transition-all"
                />
              </div>
              <button
                disabled={exporting[0]}
                onClick={() => handleExport(0, revenueFrom, revenueTo)}
                className="flex items-center gap-2 px-4 h-10 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed shrink-0"
              >
                {exporting[0] ? <Activity className="w-4 h-4 animate-spin" /> : <FileSpreadsheet className="w-4 h-4" />}
                <span>تصدير الحجوزات (Excel)</span>
              </button>
              <button
                disabled={exporting[2]}
                onClick={() => handleExport(2, revenueFrom, revenueTo)}
                className="flex items-center gap-2 px-4 h-10 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed shrink-0"
              >
                {exporting[2] ? <Activity className="w-4 h-4 animate-spin" /> : <FileSpreadsheet className="w-4 h-4" />}
                <span>تصدير الديون (Excel)</span>
              </button>
              <button
                disabled={exporting[5]}
                onClick={() => handleExport(5, revenueFrom, revenueTo)}
                className="flex items-center gap-2 px-4 h-10 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed shrink-0"
              >
                {exporting[5] ? <Activity className="w-4 h-4 animate-spin" /> : <FileSpreadsheet className="w-4 h-4" />}
                <span>تصدير الحسابات الموحد (Excel)</span>
              </button>
            </div>
          </div>

          {revenueLoading ? (
            <div className="flex justify-center py-12"><Activity className="w-8 h-8 text-primary animate-spin" /></div>
          ) : revenueBreakdown ? (
            <div className="space-y-6">

              {/* ══ Accounting basis notice ══ */}
              <div className="bg-blue-500/5 border border-blue-500/20 rounded-2xl px-5 py-3.5 flex items-start gap-3" dir="rtl">
                <Info className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
                <p className="text-[11px] text-muted-foreground leading-relaxed">
                  <span className="font-black text-blue-400">ملاحظة محاسبية مهمة: </span>
                  هذه الصفحة تعرض نظامَين محاسبيَّين مختلفَين في نفس الوقت.
                  <span className="text-foreground font-bold"> الإيراد المتوقع والمستحقات</span> مبنيَّان على تاريخ إنشاء الحجز،
                  بينما <span className="text-foreground font-bold">دخل الخزينة الفعلي</span> مبني على تاريخ حركة الأموال (استلام / إرجاع / إلغاء).
                  لذلك الأرقام <span className="font-black text-blue-400">لا تُجمع مع بعض</span> وهذا طبيعي وصحيح تماماً.
                </p>
              </div>

              {/* ══ TWO SEPARATE PANELS ══ */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">

                {/* ─── Panel A: Accrual (booking-date based) ─── */}
                <div className="bg-card border border-border rounded-3xl overflow-hidden" dir="rtl">
                  {/* Panel header */}
                  <div className="flex items-center justify-between px-5 py-3 bg-primary/5 border-b border-border/60">
                    <div className="flex items-center gap-2">
                      <FileSpreadsheet className="w-4 h-4 text-primary" />
                      <span className="text-xs font-black text-foreground">الإيراد المتوقع (Accrual)</span>
                    </div>
                    <span className="text-[10px] font-black px-2.5 py-1 rounded-full bg-primary/10 text-primary border border-primary/20">
                      أساس: تاريخ إنشاء الحجز
                    </span>
                  </div>

                  <div className="p-5 space-y-0">
                    {/* Gross */}
                    <div className="flex justify-between items-start py-3 border-b border-border/30">
                      <div>
                        <p className="text-xs font-black text-foreground">الإيراد الإجمالي (Gross)</p>
                        <p className="text-[10px] text-muted-foreground mt-0.5">مجموع قيمة كل الحجوزات المسجّلة في الفترة بدون خصومات</p>
                      </div>
                      <span className="font-black text-foreground font-mono text-sm shrink-0 mr-4">
                        {revenueBreakdown.grossRevenue.toLocaleString("ar-EG-u-nu-latn", { minimumFractionDigits: 3 })} د.ك
                      </span>
                    </div>

                    {/* Discounts */}
                    <div className="flex justify-between items-start py-3 border-b border-border/30">
                      <div>
                        <p className="text-xs font-black text-amber-400">— الخصومات الممنوحة</p>
                        <p className="text-[10px] text-muted-foreground mt-0.5">
                          على {revenueBreakdown.bookingsWithDiscount} حجز
                          {revenueBreakdown.totalBookings > 0 && ` (${((revenueBreakdown.bookingsWithDiscount / revenueBreakdown.totalBookings) * 100).toFixed(0)}% من الإجمالي)`}
                        </p>
                      </div>
                      <span className="font-black text-amber-400 font-mono text-sm shrink-0 mr-4">
                        -{revenueBreakdown.totalDiscounts.toLocaleString("ar-EG-u-nu-latn", { minimumFractionDigits: 3 })} د.ك
                      </span>
                    </div>

                    {/* Net */}
                    <div className="flex justify-between items-start py-3 border-b border-border/30 bg-primary/4 rounded-lg px-2 my-1">
                      <div>
                        <p className="text-xs font-black text-primary">= صافي الإيراد المتوقع (Net)</p>
                        <p className="text-[10px] text-muted-foreground mt-0.5">ما يستحقه المحل نظرياً على كل الحجوزات المسجّلة</p>
                      </div>
                      <span className="font-black text-primary font-mono text-base shrink-0 mr-4">
                        {revenueBreakdown.netRevenue.toLocaleString("ar-EG-u-nu-latn", { minimumFractionDigits: 3 })} د.ك
                      </span>
                    </div>

                    {/* Outstanding */}
                    <div className="flex justify-between items-start py-3 mt-1">
                      <div>
                        <p className="text-xs font-black text-amber-400">⏳ منه: لا يزال في ذمة العملاء</p>
                        <p className="text-[10px] text-muted-foreground mt-0.5">
                          فقط الحجوزات النشطة والخارجة — سيُحصَّل عند الإرجاع
                        </p>
                        <p className="text-[10px] text-blue-400/80 mt-1 font-semibold">
                          ⚠ هذا الرقم لا يُقارَن بـ"دخل الخزينة" (نظامان مختلفان)
                        </p>
                      </div>
                      <span className="font-black text-amber-400 font-mono text-base shrink-0 mr-4">
                        {revenueBreakdown.outstandingBalance.toLocaleString("ar-EG-u-nu-latn", { minimumFractionDigits: 3 })} د.ك
                      </span>
                    </div>
                  </div>

                  {/* Panel footer: avg */}
                  <div className="px-5 py-3 border-t border-border/40 bg-muted/10 flex items-center justify-between">
                    <span className="text-[10px] text-muted-foreground font-semibold">متوسط قيمة الحجز</span>
                    <span className="text-xs font-black text-foreground font-mono">
                      {revenueBreakdown.averageBookingValue.toLocaleString("ar-EG-u-nu-latn", { minimumFractionDigits: 3 })} د.ك
                      <span className="text-muted-foreground font-normal mr-1">/ {revenueBreakdown.totalBookings} حجز</span>
                    </span>
                  </div>
                </div>

                {/* ─── Panel B: Cash Flow (event-date based) ─── */}
                <div className="bg-card border border-emerald-500/25 rounded-3xl overflow-hidden" dir="rtl">
                  {/* Panel header */}
                  <div className="flex items-center justify-between px-5 py-3 bg-emerald-500/5 border-b border-emerald-500/20">
                    <div className="flex items-center gap-2">
                      <DollarSign className="w-4 h-4 text-emerald-400" />
                      <span className="text-xs font-black text-foreground">التدفق النقدي الفعلي (Cash Flow)</span>
                    </div>
                    <span className="text-[10px] font-black px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                      أساس: تاريخ حركة الأموال
                    </span>
                  </div>

                  <div className="p-5 space-y-0">
                    {/* Deposits */}
                    <div className="flex justify-between items-start py-3 border-b border-border/30">
                      <div>
                        <p className="text-xs font-black text-foreground">+ تأمينات استُلمت في الفترة</p>
                        <p className="text-[10px] text-muted-foreground mt-0.5">مبالغ تأمين دُفعت وقت إنشاء الحجز (CreatedAt)</p>
                      </div>
                      <span className="text-[10px] text-muted-foreground font-mono shrink-0 mr-4 mt-1">تشمل ↑</span>
                    </div>

                    {/* Rental payments */}
                    <div className="flex justify-between items-start py-3 border-b border-border/30">
                      <div>
                        <p className="text-xs font-black text-foreground">+ مدفوعات عند الاستلام</p>
                        <p className="text-[10px] text-muted-foreground mt-0.5">مبالغ دُفعت وقت استلام البدلة (PickedUpAt)</p>
                      </div>
                      <span className="text-[10px] text-muted-foreground font-mono shrink-0 mr-4 mt-1">تشمل ↑</span>
                    </div>

                    {revenueBreakdown.totalDamageFees > 0 && (
                      <div className="flex justify-between items-start py-3 border-b border-border/30">
                        <div>
                          <p className="text-xs font-black text-foreground">+ تعويضات التلف المحصّلة</p>
                          <p className="text-[10px] text-muted-foreground mt-0.5">من التأمين + مدفوعات إضافية (ReturnedAt)</p>
                        </div>
                        <span className="font-bold text-emerald-400 font-mono text-sm shrink-0 mr-4">
                          +{revenueBreakdown.totalDamageFees.toLocaleString("ar-EG-u-nu-latn", { minimumFractionDigits: 3 })} د.ك
                        </span>
                      </div>
                    )}

                    {revenueBreakdown.totalDeductions > 0 && (
                      <div className="flex justify-between items-start py-3 border-b border-border/30">
                        <div>
                          <p className="text-xs font-black text-foreground">+ غرامات إلغاء مُستقطعة</p>
                          <p className="text-[10px] text-muted-foreground mt-0.5">اقتُطعت من التأمين عند الإلغاء (CancelledAt)</p>
                        </div>
                        <span className="font-bold text-orange-400 font-mono text-sm shrink-0 mr-4">
                          +{revenueBreakdown.totalDeductions.toLocaleString("ar-EG-u-nu-latn", { minimumFractionDigits: 3 })} د.ك
                        </span>
                      </div>
                    )}

                    <div className="flex justify-between items-start py-3 border-b border-border/30">
                      <div>
                        <p className="text-xs font-black text-red-400">— مردودات للعملاء</p>
                        <p className="text-[10px] text-muted-foreground mt-0.5">تأمين رُدَّ عند الإرجاع أو الإلغاء بدون خصم</p>
                      </div>
                      <span className="text-[10px] text-muted-foreground font-mono shrink-0 mr-4 mt-1">مطروح ↑</span>
                    </div>

                    {/* Net Collected = result */}
                    <div className="flex justify-between items-start py-3 bg-emerald-500/8 rounded-xl px-3 mt-2">
                      <div>
                        <p className="text-xs font-black text-emerald-400">✅ صافي دخل الخزينة الفعلي</p>
                        <p className="text-[10px] text-muted-foreground mt-0.5">
                          المبلغ الحقيقي الذي وصل يدك في هذه الفترة
                        </p>
                        <p className="text-[10px] text-blue-400/80 mt-1 font-semibold">
                          ⚠ لا يُقارَن بـ"الإيراد المتوقع" (نظامان مختلفان)
                        </p>
                      </div>
                      <span className="font-black text-emerald-400 font-mono text-xl shrink-0 mr-4">
                        {revenueBreakdown.actualCollected.toLocaleString("ar-EG-u-nu-latn", { minimumFractionDigits: 3 })}
                        <span className="text-sm mr-1">د.ك</span>
                      </span>
                    </div>
                  </div>

                  {/* Panel footer: collection rate vs GROSS (not net, to avoid confusion) */}
                  <div className="px-5 py-4 border-t border-emerald-500/20 bg-emerald-500/5 space-y-2">
                    <div className="flex justify-between text-[10px] font-black">
                      <span className="text-muted-foreground">نسبة ما تُحصِّله من إجمالي الحجوزات:</span>
                      <span className="text-emerald-400">
                        {((revenueBreakdown.actualCollected / (revenueBreakdown.grossRevenue || 1)) * 100).toFixed(1)}%
                      </span>
                    </div>
                    <ProgressBar
                      value={revenueBreakdown.actualCollected}
                      max={revenueBreakdown.grossRevenue}
                      className="bg-emerald-500"
                    />
                    <p className="text-[10px] text-muted-foreground">
                      النسبة ستزيد تدريجياً مع اكتمال الحجوزات النشطة وتسديد المبالغ المتبقية.
                    </p>
                  </div>
                </div>
              </div>

              {/* ══ Pending Payments List ══ */}
              <div className="bg-card border border-border rounded-3xl p-6" dir="rtl">
                <div className="flex items-center justify-between border-b border-border/80 pb-4 mb-4">
                  <div>
                    <h3 className="text-base font-black text-foreground">الحجوزات التي تحتوي على ديون / مستحقات معلقة</h3>
                    <p className="text-xs text-muted-foreground font-semibold mt-0.5">مرتبة من الأكبر رصيداً متبقياً إلى الأقل</p>
                  </div>
                  {pendingPayments && (
                    <span className="bg-amber-500/10 text-amber-400 text-xs font-black px-3 py-1 rounded-xl">
                      {pendingPayments.totalCount} حجز معلّق
                    </span>
                  )}
                </div>

                {pendingLoading ? (
                  <div className="flex justify-center py-6"><Activity className="w-6 h-6 text-primary animate-spin" /></div>
                ) : pendingPayments && pendingPayments.items.length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="w-full text-right text-xs font-semibold">
                      <thead>
                        <tr className="border-b border-border/60 text-muted-foreground">
                          <th className="py-2.5 px-3">كود الحجز</th>
                          <th className="py-2.5 px-3">الزبون</th>
                          <th className="py-2.5 px-3">الحالة</th>
                          <th className="py-2.5 px-3">تاريخ الإرجاع المتوقع</th>
                          <th className="py-2.5 px-3">أيام الاستحقاق</th>
                          <th className="py-2.5 px-3 text-left">المبلغ المتبقي</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border/40">
                        {pendingPayments.items.map((item) => {
                          const isOverdue = item.daysUntilDue < 0;
                          const isDueSoon = item.daysUntilDue >= 0 && item.daysUntilDue <= 3;
                          return (
                            <tr key={item.bookingId} className="hover:bg-accent/30 transition-colors">
                              <td className="py-3 px-3 font-black text-primary">{item.bookingCode}</td>
                              <td className="py-3 px-3">
                                <div>
                                  <p className="font-bold text-foreground">{item.customerName}</p>
                                  <p className="text-[10px] text-muted-foreground">{item.customerPhone}</p>
                                </div>
                              </td>
                              <td className="py-3 px-3">
                                <span className={cn(
                                  "text-[10px] font-black px-2 py-0.5 rounded-full",
                                  item.status === "PickedUp"
                                    ? "bg-blue-500/10 text-blue-400"
                                    : "bg-emerald-500/10 text-emerald-400"
                                )}>
                                  {item.status === "PickedUp" ? "خارجة" : "محجوزة"}
                                </span>
                              </td>
                              <td className="py-3 px-3 text-muted-foreground">
                                {new Date(item.toDate).toLocaleDateString("ar-EG-u-nu-latn", { day: "2-digit", month: "short", year: "numeric" })}
                              </td>
                              <td className="py-3 px-3">
                                <span className={cn(
                                  "text-[10px] font-black px-2 py-0.5 rounded-full",
                                  isOverdue ? "bg-red-500/10 text-red-400" : isDueSoon ? "bg-amber-500/10 text-amber-400" : "bg-muted/50 text-muted-foreground"
                                )}>
                                  {isOverdue ? `متأخر ${Math.abs(item.daysUntilDue)} يوم` : item.daysUntilDue === 0 ? "اليوم" : `${item.daysUntilDue} يوم`}
                                </span>
                              </td>
                              <td className="py-3 px-3 text-left font-black text-red-400 font-mono">
                                {item.remainingAmount.toLocaleString("ar-EG-u-nu-latn", { minimumFractionDigits: 3 })} د.ك
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="text-center py-6 text-muted-foreground">لا توجد أي حجوزات بديون معلقة حالياً ✓</div>
                )}
              </div>
            </div>

          ) : null}

        </div>
      )}


      {/* ─── TAB 3: INV & COMPARTMENTS ─── */}
      {activeTab === "inventory" && (
        <div className="space-y-6">
          {/* Suit Sizes Rankings & Availability Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Suit size rankings (2/3 width) */}
            <div className="bg-card border border-border rounded-3xl p-6 lg:col-span-2 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border/40 pb-3">
                <div>
                  <h3 className="text-base font-black text-foreground">ترتيب المقاسات الأكثر طلباً</h3>
                  <p className="text-xs text-muted-foreground mt-0.5">ترتيب تنازلي مبني على حجوزات المقاس بالفترة المحددة</p>
                </div>
                <div className="flex flex-wrap items-center gap-3">
                  {/* Dates range */}
                  <div className="flex items-center gap-1 text-[10px] font-bold text-muted-foreground">
                    <span>من:</span>
                    <input
                      type="date"
                      value={suitSizesFrom}
                      onChange={(e) => setSuitSizesFrom(e.target.value)}
                      className="px-2 h-8 rounded-lg bg-background border border-border text-foreground outline-none text-[10px]"
                    />
                    <span>إلى:</span>
                    <input
                      type="date"
                      value={suitSizesTo}
                      onChange={(e) => setSuitSizesTo(e.target.value)}
                      className="px-2 h-8 rounded-lg bg-background border border-border text-foreground outline-none text-[10px]"
                    />
                  </div>
                  <button
                    disabled={exporting[3]}
                    onClick={() => handleExport(3)}
                    className="flex items-center gap-1.5 px-3 h-8 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[10px] transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed shrink-0"
                  >
                    {exporting[3] ? <Activity className="w-3 h-3 animate-spin" /> : <FileSpreadsheet className="w-3 h-3" />}
                    <span>تصدير المخزون</span>
                  </button>
                </div>
              </div>

              {suitSizesRankLoading ? (
                <div className="flex justify-center py-6"><Activity className="w-6 h-6 text-primary animate-spin" /></div>
              ) : suitSizesRanking && suitSizesRanking.rankings.length > 0 ? (
                <div className="space-y-4">
                  {/* Top Stats */}
                  <div className="flex justify-between gap-4 bg-muted/20 border border-border/30 rounded-2xl p-4 text-xs font-bold">
                    <div>
                      <span className="text-muted-foreground block mb-0.5">المقاس الأكثر طلباً 🏆</span>
                      <span className="text-sm font-black text-primary">{suitSizesRanking.mostDemanded}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground block mb-0.5">المقاس الأقل طلباً</span>
                      <span className="text-sm font-black text-foreground">{suitSizesRanking.leastDemanded}</span>
                    </div>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full text-right text-xs font-semibold">
                      <thead>
                        <tr className="border-b border-border/60 text-muted-foreground">
                          <th className="py-2 px-3">الترتيب</th>
                          <th className="py-2 px-3">المقاس</th>
                          <th className="py-2 px-3">عدد الحجوزات</th>
                          <th className="py-2 px-3">قيد الاستخدام الآن</th>
                          <th className="py-2 px-3">نسبة الاستخدام</th>
                          <th className="py-2 px-3 text-left">الإيرادات المحصلة</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border/30">
                        {suitSizesRanking.rankings.map((stat, idx) => (
                          <tr key={idx} className="hover:bg-accent/25 transition-colors">
                            <td className="py-2.5 px-3">
                              <span className={cn(
                                "w-5 h-5 rounded-full flex items-center justify-center font-bold text-[10px] text-background",
                                stat.rank === 1 ? "bg-amber-400" : stat.rank === 2 ? "bg-slate-400" : stat.rank === 3 ? "bg-amber-700" : "bg-muted text-muted-foreground"
                              )}>
                                {stat.rank}
                              </span>
                            </td>
                            <td className="py-2.5 px-3 font-bold text-foreground">
                              {stat.size}
                            </td>
                            <td className="py-2.5 px-3 font-mono">{stat.totalBookings}</td>
                            <td className="py-2.5 px-3 font-mono text-muted-foreground">{stat.activeNow} بدلة</td>
                            <td className="py-2.5 px-3">
                              <div className="flex items-center gap-2">
                                <span className="font-mono text-[10px] w-8">{stat.utilizationRate.toFixed(1)}%</span>
                                <div className="w-16">
                                  <ProgressBar value={stat.utilizationRate} className="bg-primary" />
                                </div>
                              </div>
                            </td>
                            <td className="py-2.5 px-3 text-left font-black text-emerald-400 font-mono">
                              {stat.revenueGenerated} ج.م
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              ) : (
                <div className="text-center py-12 text-muted-foreground">لا توجد بيانات متاحة لفترة التصفية المحددة</div>
              )}
            </div>

            {/* Suit size availability (1/3 width) */}
            <div className="bg-card border border-border rounded-3xl p-6 space-y-4">
              <div className="border-b border-border/40 pb-3">
                <h3 className="text-base font-black text-foreground">حالة توافر مقاسات البدل بالمعرض</h3>
                <p className="text-xs text-muted-foreground mt-0.5">الحالة الحالية للمخزون والتنبيهات المتاحة</p>
              </div>

              {suitSizesAvailLoading ? (
                <div className="flex justify-center py-6"><Activity className="w-6 h-6 text-primary animate-spin" /></div>
              ) : suitSizesAvailability && suitSizesAvailability.sizes.length > 0 ? (
                <div className="space-y-4 overflow-y-auto max-h-[360px] pr-1">
                  {suitSizesAvailability.sizes.map((stat, idx) => (
                    <div key={idx} className="bg-accent/20 border border-border/30 rounded-2xl p-4 flex items-center justify-between gap-3 text-xs">
                      <div className="space-y-1">
                        <span className="font-extrabold text-sm text-foreground block">مقاس {stat.size}</span>
                        <div className="flex gap-3 text-[10px] font-bold text-muted-foreground">
                          <span>إجمالي: <strong className="text-foreground">{stat.totalHangers}</strong></span>
                          <span>بالخارج/مستلم: <strong className="text-foreground">{stat.bookedNow}</strong></span>
                        </div>
                      </div>
                      <div className="text-left space-y-1.5 shrink-0">
                        <span className={cn(
                          "text-[9px] font-black px-2 py-0.5 rounded-full border",
                          stat.stockStatus === "Low" ? "bg-red-500/10 border-red-500/30 text-red-400" :
                          stat.stockStatus === "Normal" ? "bg-amber-500/10 border-amber-500/30 text-amber-400" :
                          "bg-emerald-500/10 border-emerald-500/30 text-emerald-400"
                        )}>
                          {stat.stockStatus === "Low" ? "مخزون منخفض 🚨" : stat.stockStatus === "Normal" ? "مستغل" : "متوفر بكثرة"}
                        </span>
                        <span className="text-[10px] font-extrabold text-foreground block">متاح: {stat.available} شماعة</span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 text-muted-foreground">لا توجد بيانات متاحة</div>
              )}
            </div>
          </div>

          {/* Partitions Performance & Hangers Utilization */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Partitions Performance */}
            <div className="bg-card border border-border rounded-3xl p-6 space-y-4">
              <div className="border-b border-border/40 pb-3">
                <h3 className="text-base font-black text-foreground">أداء الأقسام (Partitions Performance)</h3>
                <p className="text-xs text-muted-foreground mt-0.5">مقارنة حجم الحجوزات ونسب الإيراد المحصلة لكل قسم</p>
              </div>

              {partitionsPerfLoading ? (
                <div className="flex justify-center py-6"><Activity className="w-6 h-6 text-primary animate-spin" /></div>
              ) : partitionsPerformance && partitionsPerformance.rankings.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full text-right text-xs font-semibold">
                    <thead>
                      <tr className="border-b border-border/60 text-muted-foreground">
                        <th className="py-2.5 px-3">الترتيب</th>
                        <th className="py-2.5 px-3">القسم</th>
                        <th className="py-2.5 px-3">عدد الحجوزات</th>
                        <th className="py-2.5 px-3">نسبة الإشغال الكلية</th>
                        <th className="py-2.5 px-3 text-left">صافي الإيراد</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border/30">
                      {partitionsPerformance.rankings.map((stat, idx) => (
                        <tr key={idx} className="hover:bg-accent/25 transition-colors">
                          <td className="py-3 px-3">
                            <span className="font-extrabold text-foreground bg-accent/60 px-2 py-0.5 rounded">{stat.rank}#</span>
                          </td>
                          <td className="py-3 px-3 font-extrabold text-foreground">{stat.partitionName}</td>
                          <td className="py-3 px-3">{stat.totalBookings} حجز</td>
                          <td className="py-3 px-3">
                            <div className="flex items-center gap-2">
                              <span className="font-mono text-[10px] w-8">{stat.utilizationRate.toFixed(1)}%</span>
                              <div className="w-16">
                                <ProgressBar value={stat.utilizationRate} className="bg-primary" />
                              </div>
                            </div>
                          </td>
                          <td className="py-3 px-3 text-left font-black text-emerald-400 font-mono">
                            {stat.totalRevenue} ج.م
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center py-12 text-muted-foreground">لا توجد إحصائيات متوفرة</div>
              )}
            </div>

            {/* Hangers utilization */}
            <div className="bg-card border border-border rounded-3xl p-6 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border/40 pb-3">
                <div>
                  <h3 className="text-base font-black text-foreground">إحصائيات استخدام الشماعات (Hangers)</h3>
                  <p className="text-xs text-muted-foreground mt-0.5">الشماعات الأكثر تشغيلاً وحجزاً داخل المحل</p>
                </div>
                {/* Partition filter */}
                <select
                  value={selectedPartitionId}
                  onChange={(e) => setSelectedPartitionId(e.target.value)}
                  className="px-3 h-9 rounded-lg bg-background border border-border text-foreground font-semibold outline-none text-xs"
                >
                  <option value="all">كل الأقسام</option>
                  {partitionsList?.items.map((p) => (
                    <option key={p.id} value={p.id}>{p.name}</option>
                  ))}
                </select>
              </div>

              {hangersUtilLoading ? (
                <div className="flex justify-center py-6"><Activity className="w-6 h-6 text-primary animate-spin" /></div>
              ) : hangersUtilization && hangersUtilization.rankings.length > 0 ? (
                <div className="overflow-x-auto max-h-[300px] overflow-y-auto pr-1">
                  <table className="w-full text-right text-xs font-semibold">
                    <thead>
                      <tr className="border-b border-border/60 text-muted-foreground">
                        <th className="py-2.5 px-3">الترتيب</th>
                        <th className="py-2.5 px-3">الشماعة والترتيب</th>
                        <th className="py-2.5 px-3">مرات الحجز</th>
                        <th className="py-2.5 px-3">نسبة التشغيل</th>
                        <th className="py-2.5 px-3 text-left">الإيراد المولد</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border/30">
                      {hangersUtilization.rankings.map((stat, idx) => (
                        <tr key={idx} className="hover:bg-accent/25 transition-colors">
                          <td className="py-2.5 px-3 text-muted-foreground">{stat.rank}</td>
                          <td className="py-2.5 px-3">
                            <div className="flex flex-col">
                              <span className="text-foreground font-extrabold">شماعة #{stat.hangerNumber}</span>
                              <span className="text-[9px] text-muted-foreground">قسم: {stat.partitionName}</span>
                            </div>
                          </td>
                          <td className="py-2.5 px-3 font-mono">{stat.totalBookings} مرات</td>
                          <td className="py-2.5 px-3 font-mono text-muted-foreground">{stat.utilizationRate.toFixed(1)}%</td>
                          <td className="py-2.5 px-3 text-left font-black text-emerald-400 font-mono">
                            {stat.revenueGenerated} ج.م
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center py-12 text-muted-foreground">لا توجد بيانات متاحة</div>
              )}
            </div>
          </div>

          {/* Most Requested Suits - البدلة الأكثر طلباً */}
          <div className="bg-card border border-border rounded-3xl p-6 space-y-4">
            <div className="border-b border-border/40 pb-3">
              <h3 className="text-base font-black text-foreground">البدل الأكثر طلباً وتأجيراً بالمعرض</h3>
              <p className="text-xs text-muted-foreground mt-0.5">ترتيب البدلات (القسم + الشماعة + المقاس) الأكثر طلباً مبني على بيانات الحجوزات</p>
            </div>

            {mostRequestedSuitsLoading ? (
              <div className="flex justify-center py-6"><Activity className="w-6 h-6 text-primary animate-spin" /></div>
            ) : mostRequestedSuits && mostRequestedSuits.items.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-right text-xs font-semibold">
                  <thead>
                    <tr className="border-b border-border/60 text-muted-foreground">
                      <th className="py-2.5 px-3">الترتيب</th>
                      <th className="py-2.5 px-3">القسم</th>
                      <th className="py-2.5 px-3">رقم الشماعة</th>
                      <th className="py-2.5 px-3">المقاس</th>
                      <th className="py-2.5 px-3">إجمالي الحجوزات</th>
                      <th className="py-2.5 px-3">الحجوزات المكتملة</th>
                      <th className="py-2.5 px-3">الحجوزات الملغاة</th>
                      <th className="py-2.5 px-3">آخر حجز</th>
                      <th className="py-2.5 px-3 text-left">الإيرادات</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/30">
                    {mostRequestedSuits.items.map((stat, idx) => (
                      <tr key={idx} className="hover:bg-accent/25 transition-colors">
                        <td className="py-3 px-3">
                          <span className={cn(
                            "w-5 h-5 rounded-full flex items-center justify-center font-bold text-[10px] text-background",
                            stat.rank === 1 ? "bg-amber-400" : stat.rank === 2 ? "bg-slate-400" : stat.rank === 3 ? "bg-amber-700" : "bg-muted text-muted-foreground"
                          )}>
                            {stat.rank}
                          </span>
                        </td>
                        <td className="py-3 px-3 font-extrabold text-foreground">{stat.partitionName}</td>
                        <td className="py-3 px-3">
                          <span className="font-mono text-muted-foreground bg-accent/60 px-2 py-0.5 rounded">
                            شماعة #{stat.hangerNumber}
                          </span>
                        </td>
                        <td className="py-3 px-3 font-bold text-foreground">مقاس {stat.suitSize}</td>
                        <td className="py-3 px-3 font-mono text-foreground">{stat.totalBookings} حجز</td>
                        <td className="py-3 px-3 font-mono text-emerald-500">{stat.completedBookings} مكتمل</td>
                        <td className="py-3 px-3 font-mono text-red-400">{stat.cancelledBookings} ملغي</td>
                        <td className="py-3 px-3 text-muted-foreground font-mono">
                          {stat.lastBookedAt ? new Date(stat.lastBookedAt).toLocaleDateString("ar-EG-u-nu-latn") : "-"}
                        </td>
                        <td className="py-3 px-3 text-left font-black text-emerald-400 font-mono">
                          {stat.revenueGenerated} ج.م
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-12 text-muted-foreground">لا توجد بيانات متاحة لفترة التصفية المحددة</div>
            )}
          </div>
        </div>
      )}

      {/* ─── TAB 4: CUSTOMERS & RISK TRENDS ─── */}
      {activeTab === "behavior" && (
        <div className="space-y-6">
          {/* Filters Range */}
          <div className="bg-card border border-border/85 rounded-3xl p-5 flex flex-wrap gap-4 items-center justify-between">
            <div className="flex items-center gap-2.5">
              <Calendar className="w-5 h-5 text-muted-foreground" />
              <span className="text-sm font-bold text-foreground">تحديد فترة تحليل السلوك والمخاطر:</span>
            </div>
            <div className="flex items-center gap-2 text-xs font-bold text-muted-foreground">
              <span>من:</span>
              <input
                type="date"
                value={behaviorFrom}
                onChange={(e) => setBehaviorFrom(e.target.value)}
                className="px-3 h-10 rounded-xl bg-background border border-border text-foreground font-semibold outline-none text-xs transition-all"
              />
              <span>إلى:</span>
              <input
                type="date"
                value={behaviorTo}
                onChange={(e) => setBehaviorTo(e.target.value)}
                className="px-3 h-10 rounded-xl bg-background border border-border text-foreground font-semibold outline-none text-xs transition-all"
              />
            </div>
          </div>

          {/* Customer retention & VIP statistics */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Customer Retention Rates (2/3 width) */}
            <div className="bg-card border border-border rounded-3xl p-6 lg:col-span-2 space-y-4">
              <div className="border-b border-border/40 pb-3">
                <h3 className="text-base font-black text-foreground">معدل الاحتفاظ بالزبائن وعائدات الفئات</h3>
                <p className="text-xs text-muted-foreground mt-0.5">تقسيم قاعدة العملاء حسب تكرار الحجز ومقدار الإيرادات المحدثة</p>
              </div>

              {retentionLoading ? (
                <div className="flex justify-center py-6"><Activity className="w-6 h-6 text-primary animate-spin" /></div>
              ) : customerRetention ? (
                <div className="space-y-6">
                  {/* Top summary stats */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 bg-muted/20 border border-border/30 rounded-2xl p-4 text-xs font-bold text-right">
                    <div>
                      <span className="text-muted-foreground block mb-0.5">إجمالي العملاء المسجلين</span>
                      <span className="text-sm font-black text-foreground">{customerRetention.totalCustomers} عميل</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground block mb-0.5">نسبة الاحتفاظ بالعملاء</span>
                      <span className="text-sm font-black text-emerald-400">{customerRetention.retentionRate.toFixed(1)}%</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground block mb-0.5">العملاء الدائمين (Returning)</span>
                      <span className="text-sm font-black text-primary">{customerRetention.returningCustomers} عميل</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground block mb-0.5">حجزوا لمرة واحدة فقط</span>
                      <span className="text-sm font-black text-foreground">{customerRetention.oneTimeCustomers} عميل</span>
                    </div>
                  </div>

                  {/* Customer Classifications segments */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
                    <div className="bg-card border border-border rounded-2xl p-4 space-y-1">
                      <span className="text-[10px] font-black text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-full">🏆 كبار الزبائن VIP</span>
                      <h4 className="text-xl font-black text-foreground font-mono">{customerRetention.vipCount}</h4>
                      <p className="text-[9px] text-muted-foreground leading-none">3+ حجوزات وإيراد عالٍ</p>
                    </div>

                    <div className="bg-card border border-border rounded-2xl p-4 space-y-1">
                      <span className="text-[10px] font-black text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full">العملاء النشطون Regular</span>
                      <h4 className="text-xl font-black text-foreground font-mono">{customerRetention.regularCount}</h4>
                      <p className="text-[9px] text-muted-foreground leading-none">مستقر بنظام حجز طبيعي</p>
                    </div>

                    <div className="bg-card border border-border rounded-2xl p-4 space-y-1">
                      <span className="text-[10px] font-black text-red-400 bg-red-500/10 px-2 py-0.5 rounded-full">معرض للإلغاء AtRisk</span>
                      <h4 className="text-xl font-black text-foreground font-mono">{customerRetention.atRiskCount}</h4>
                      <p className="text-[9px] text-muted-foreground leading-none">نسبة إلغاء حجوزات ≥ 50%</p>
                    </div>

                    <div className="bg-card border border-border rounded-2xl p-4 space-y-1">
                      <span className="text-[10px] font-black text-primary bg-primary/10 px-2 py-0.5 rounded-full">عملاء جدد New</span>
                      <h4 className="text-xl font-black text-foreground font-mono">{customerRetention.newCount}</h4>
                      <p className="text-[9px] text-muted-foreground leading-none">سجلوا 1-2 حجز مؤخراً</p>
                    </div>
                  </div>

                  {/* Tier breakdown table */}
                  <div className="overflow-x-auto pt-2">
                    <table className="w-full text-right text-xs font-semibold">
                      <thead>
                        <tr className="border-b border-border/60 text-muted-foreground">
                          <th className="py-2.5 px-3">التصنيف</th>
                          <th className="py-2.5 px-3">عدد العملاء</th>
                          <th className="py-2.5 px-3">النسبة المئوية</th>
                          <th className="py-2.5 px-3 text-left">متوسط الإيرادات للعميل</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border/30">
                        {customerRetention.tierBreakdown.map((t, idx) => (
                          <tr key={idx} className="hover:bg-accent/25 transition-colors">
                            <td className="py-3 px-3 font-bold text-foreground">{t.tier}</td>
                            <td className="py-3 px-3 font-mono">{t.count} عميل</td>
                            <td className="py-3 px-3 font-mono text-muted-foreground">{t.percentage.toFixed(1)}%</td>
                            <td className="py-3 px-3 text-left font-bold text-emerald-400 font-mono">
                              {t.avgRevenue.toFixed(1)} ج.م
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              ) : null}
            </div>

            {/* Accessory Preferences (1/3 width) */}
            <div className="bg-card border border-border rounded-3xl p-6 space-y-4">
              <div className="border-b border-border/40 pb-3">
                <h3 className="text-base font-black text-foreground">تفضيلات الإكسسوارات</h3>
                <p className="text-xs text-muted-foreground mt-0.5">الألوان الأكثر طلباً وطلبيات المقاسات</p>
              </div>

              {accessoriesLoading ? (
                <div className="flex justify-center py-6"><Activity className="w-6 h-6 text-primary animate-spin" /></div>
              ) : accessoriesData ? (
                <div className="space-y-6 overflow-y-auto max-h-[380px] pr-1">
                  {/* Gravata preferences */}
                  <div className="space-y-2">
                    <span className="text-xs font-bold text-foreground flex items-center justify-start gap-1">
                      <Sliders className="w-3.5 h-3.5 text-primary" />
                      <span>الألوان الأكثر طلباً للجرافة / الكرافتة</span>
                    </span>
                    <div className="space-y-1.5">
                      {accessoriesData.gravataColors.slice(0, 3).map((c, idx) => (
                        <div key={idx} className="bg-accent/20 border border-border/30 rounded-xl p-2.5 flex justify-between items-center text-[10px] font-bold">
                          <span className="text-foreground">{c.colorName}</span>
                          <span className="text-muted-foreground font-mono">{c.count} حجز ({c.percentage.toFixed(1)}%)</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Vest preferences */}
                  <div className="space-y-2 border-t border-border/40 pt-4">
                    <span className="text-xs font-bold text-foreground flex items-center justify-start gap-1">
                      <Sliders className="w-3.5 h-3.5 text-amber-400" />
                      <span>الألوان الأكثر طلباً للصدرية / الفست</span>
                    </span>
                    <div className="space-y-1.5">
                      {accessoriesData.vestColors.slice(0, 3).map((c, idx) => (
                        <div key={idx} className="bg-accent/20 border border-border/30 rounded-xl p-2.5 flex justify-between items-center text-[10px] font-bold">
                          <span className="text-foreground">{c.colorName}</span>
                          <span className="text-muted-foreground font-mono">{c.count} حجز ({c.percentage.toFixed(1)}%)</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Shirt sizes preferences */}
                  <div className="space-y-2 border-t border-border/40 pt-4">
                    <span className="text-xs font-bold text-foreground flex items-center justify-start gap-1">
                      <Sliders className="w-3.5 h-3.5 text-blue-400" />
                      <span>الأحجام الأكثر طلباً للقمصان</span>
                    </span>
                    <div className="space-y-1.5">
                      {accessoriesData.shirtSizes.slice(0, 3).map((c, idx) => (
                        <div key={idx} className="bg-accent/20 border border-border/30 rounded-xl p-2.5 flex justify-between items-center text-[10px] font-bold">
                          <span className="text-foreground">{c.sizeName}</span>
                          <span className="text-muted-foreground font-mono">{c.count} حجز ({c.percentage.toFixed(1)}%)</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ) : null}
            </div>
          </div>

          {/* Risk Report & Peak Booking Times */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Risk analytics (damaged suits and cancellations) */}
            <div className="bg-card border border-border rounded-3xl p-6 space-y-4">
              <div className="border-b border-border/40 pb-3">
                <h3 className="text-base font-black text-foreground">تقرير المخاطر والأضرار (Suit Damage & Risks)</h3>
                <p className="text-xs text-muted-foreground mt-0.5">تفاصيل البدل المتضررة والإلغاءات خلال الأشهر السابقة</p>
              </div>

              {riskLoading ? (
                <div className="flex justify-center py-6"><Activity className="w-6 h-6 text-primary animate-spin" /></div>
              ) : riskReport ? (
                <div className="space-y-6">
                  {/* Summary Stats */}
                  <div className="grid grid-cols-3 gap-4 bg-muted/20 border border-border/30 rounded-2xl p-4 text-xs font-bold text-right">
                    <div>
                      <span className="text-muted-foreground block mb-0.5">البدل التالفة المسجلة</span>
                      <span className="text-sm font-black text-red-400 font-mono">{riskReport.totalDamagedBookings} بدلة</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground block mb-0.5">إجمالي غرامات التلف</span>
                      <span className="text-sm font-black text-emerald-400 font-mono">{riskReport.totalDamageFeesCollected} ج.م</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground block mb-0.5">معدل الإلغاء الكلي</span>
                      <span className="text-sm font-black text-foreground font-mono">{riskReport.overallCancellationRate.toFixed(1)}%</span>
                    </div>
                  </div>

                  {/* Monthly Damage Snapshots */}
                  <div className="space-y-4">
                    <h4 className="text-xs font-black text-foreground flex items-center justify-start gap-1">
                      <AlertTriangle className="w-3.5 h-3.5 text-red-400" />
                      <span>الحوادث التاريخية للتلف المجمع شهرياً</span>
                    </h4>
                    <div className="space-y-2 max-h-[160px] overflow-y-auto pr-1">
                      {riskReport.damageByMonth.map((m, idx) => (
                        <div key={idx} className="bg-accent/20 border border-border/30 rounded-xl p-3 flex justify-between items-center text-xs font-semibold">
                          <div>
                            <span className="text-foreground font-extrabold">{m.monthName} {m.year}</span>
                            <span className="text-[10px] text-muted-foreground block">تلفيات مسجلة: {m.count} قطع</span>
                          </div>
                          <span className="font-mono font-black text-red-400">+{m.amount} ج.م تعويضات</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ) : null}
            </div>

            {/* Peak Times */}
            <div className="bg-card border border-border rounded-3xl p-6 space-y-4">
              <div className="border-b border-border/40 pb-3">
                <h3 className="text-base font-black text-foreground">أوقات الذروة وأيام الحجوزات الأكثر رواجاً</h3>
                <p className="text-xs text-muted-foreground mt-0.5">تتبع أوقات ذروة أداء الحجوزات أسبوعياً وشهرياً</p>
              </div>

              {peakTimesLoading ? (
                <div className="flex justify-center py-6"><Activity className="w-6 h-6 text-primary animate-spin" /></div>
              ) : peakTimesData ? (
                <div className="space-y-6">
                  {/* Peak parameters card */}
                  <div className="grid grid-cols-2 gap-4 bg-muted/20 border border-border/30 rounded-2xl p-4 text-xs font-bold text-right">
                    <div>
                      <span className="text-muted-foreground block mb-0.5">يوم الأسبوع الأكثر طلباً</span>
                      <span className="text-sm font-black text-primary">{peakTimesData.busiestDayOfWeek}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground block mb-0.5">أكثر الشهور رواجاً</span>
                      <span className="text-sm font-black text-foreground">{peakTimesData.busiestMonth}</span>
                    </div>
                  </div>

                  {/* Weekday distribution */}
                  <div className="space-y-3">
                    <h4 className="text-xs font-black text-foreground">توزيع الحجوزات أسبوعياً</h4>
                    <div className="space-y-2.5">
                      {peakTimesData.byDayOfWeek.slice(0, 3).map((day, idx) => (
                        <div key={idx} className="space-y-1">
                          <div className="flex justify-between text-[10px] font-bold text-muted-foreground">
                            <span>{day.dayName}</span>
                            <span className="text-foreground">{day.bookingsCount} حجز ({day.percentage.toFixed(1)}%)</span>
                          </div>
                          <ProgressBar value={day.percentage} max={100} className="bg-primary" />
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ) : null}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
