import React, { useState } from "react";
import {
  useGetBookings,
  usePickupBooking,
} from "../hooks/useBookings";
import { cn } from "@/lib/utils";
import {
  Plus, Search, Check, Loader2,
  Phone, UserCheck, ArrowDown, SlidersHorizontal
} from "lucide-react";
import { useGetPartitions } from "@/features/partitions/hooks/usePartitions";
import { toast } from "sonner";
import type { BookingResponse, BookingStatus } from "../types/bookings";
import { bookingService } from "../services/bookingService";
import { extractErrorMessage } from "@/lib/api/client";
import { useNavigate } from "react-router-dom";
import { Modal } from "../components/Modal";
import { analyticsService } from "@/features/analytics/services/analyticsService";

const STATUS_LABELS: Record<BookingStatus, string> = {
  Active: "نشط",
  PickedUp: "تم الاستلام",
  Returned: "مكتمل",
  Cancelled: "ملغي",
};

const statusColors: Record<BookingStatus, string> = {
  Active: "bg-blue-500",
  PickedUp: "bg-amber-500",
  Returned: "bg-emerald-500",
  Cancelled: "bg-red-500",
};

const getArabicDateParts = (dateString: string) => {
  const date = new Date(dateString);
  const day = date.getDate();
  const months = ["يناير", "فبراير", "مارس", "أبريل", "مايو", "يونيو", "يوليو", "أغسطس", "سبتمبر", "أكتوبر", "نوفمبر", "ديسمبر"];
  const month = months[date.getMonth()];
  const hour = date.getHours();
  const min = String(date.getMinutes()).padStart(2, "0");
  const ampm = hour >= 12 ? "م" : "ص";
  const displayHour = hour % 12 || 12;
  const time = `${String(displayHour).padStart(2, "0")}:${min} ${ampm}`;
  return { day, month, time };
};

export default function BookingsPage() {
  const navigate = useNavigate();

  // ── Helpers to read / write filter state from sessionStorage ──────
  const ss = (key: string, fallback: string) =>
    sessionStorage.getItem(`bk_${key}`) ?? fallback;

  const [page, setPage] = useState(() => Number(ss("page", "1")));
  const [pageSize, setPageSize] = useState(() => Number(ss("pageSize", "10")));
  const [search, setSearch] = useState(() => ss("search", ""));
  const [debouncedSearch, setDebouncedSearch] = useState(() => ss("search", ""));
  const [statusFilter, setStatusFilter] = useState<string>(() => ss("status", ""));
  const [showPickup, setShowPickup] = useState(false);

  // Advanced Filters State
  const [showAdvanced, setShowAdvanced] = useState(() => ss("showAdvanced", "false") === "true");
  const [partitionFilter, setPartitionFilter] = useState(() => ss("partition", ""));
  const [hangerFilter, setHangerFilter] = useState(() => ss("hanger", ""));
  const [fromDateFilter, setFromDateFilter] = useState(() => ss("fromDate", ""));
  const [toDateFilter, setToDateFilter] = useState(() => ss("toDate", ""));
  const [isExpiredFilter, setIsExpiredFilter] = useState<string>(() => ss("isExpired", ""));
  const [hasDiscountFilter, setHasDiscountFilter] = useState<string>(() => ss("hasDiscount", ""));
  const [depositPaidFilter, setDepositPaidFilter] = useState<string>(() => ss("depositPaid", ""));
  const [idTakenFilter, setIdTakenFilter] = useState<string>(() => ss("idTaken", ""));
  const [isDamagedFilter, setIsDamagedFilter] = useState<string>(() => ss("isDamaged", ""));
  const [sortColumn, setSortColumn] = useState(() => ss("sortCol", "CreatedAt"));
  const [sortDirection, setSortDirection] = useState<"Asc" | "Desc">(
    () => (ss("sortDir", "Desc") as "Asc" | "Desc")
  );

  // Partitions for select filter
  const { data: partitionsData } = useGetPartitions({ pageSize: 50 });
  const partitions = partitionsData?.items ?? [];

  // Pickup Form State
  const [pickupCode, setPickupCode] = useState("");
  const [pickupSearchError, setPickupSearchError] = useState("");
  const [foundPickupTarget, setFoundPickupTarget] = useState<BookingResponse | null>(null);
  const [pickupPaidAmount, setPickupPaidAmount] = useState<number>(0);
  const [pickupIdTaken, setPickupIdTaken] = useState(false);
  const [pickupSubmitting, setPickupSubmitting] = useState(false);

  React.useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search), 400);
    return () => clearTimeout(t);
  }, [search]);

  // Persist all filter state to sessionStorage whenever any value changes
  React.useEffect(() => {
    sessionStorage.setItem("bk_page", String(page));
    sessionStorage.setItem("bk_pageSize", String(pageSize));
    sessionStorage.setItem("bk_search", search);
    sessionStorage.setItem("bk_status", statusFilter);
    sessionStorage.setItem("bk_showAdvanced", String(showAdvanced));
    sessionStorage.setItem("bk_partition", partitionFilter);
    sessionStorage.setItem("bk_hanger", hangerFilter);
    sessionStorage.setItem("bk_fromDate", fromDateFilter);
    sessionStorage.setItem("bk_toDate", toDateFilter);
    sessionStorage.setItem("bk_isExpired", isExpiredFilter);
    sessionStorage.setItem("bk_hasDiscount", hasDiscountFilter);
    sessionStorage.setItem("bk_depositPaid", depositPaidFilter);
    sessionStorage.setItem("bk_idTaken", idTakenFilter);
    sessionStorage.setItem("bk_isDamaged", isDamagedFilter);
    sessionStorage.setItem("bk_sortCol", sortColumn);
    sessionStorage.setItem("bk_sortDir", sortDirection);
  }, [
    page, pageSize, search, statusFilter, showAdvanced,
    partitionFilter, hangerFilter, fromDateFilter, toDateFilter,
    isExpiredFilter, hasDiscountFilter, depositPaidFilter,
    idTakenFilter, isDamagedFilter, sortColumn, sortDirection
  ]);

  const { data, isLoading, refetch } = useGetBookings({
    pageNumber: page,
    pageSize: pageSize,
    searchValue: debouncedSearch || undefined,
    status: statusFilter || undefined,
    partitionId: partitionFilter || undefined,
    hangerId: hangerFilter || undefined,
    fromDate: fromDateFilter ? new Date(fromDateFilter).toISOString() : undefined,
    toDate: toDateFilter ? new Date(toDateFilter).toISOString() : undefined,
    isExpired: isExpiredFilter === "true" ? true : isExpiredFilter === "false" ? false : undefined,
    hasDiscount: hasDiscountFilter === "true" ? true : hasDiscountFilter === "false" ? false : undefined,
    depositPaid: depositPaidFilter === "true" ? true : depositPaidFilter === "false" ? false : undefined,
    idTaken: idTakenFilter === "true" ? true : idTakenFilter === "false" ? false : undefined,
    isDamaged: isDamagedFilter === "true" ? true : isDamagedFilter === "false" ? false : undefined,
    sortColumn: sortColumn || undefined,
    sortDirection: sortDirection || undefined,
  });

  const pickupM = usePickupBooking();
  const bookingsList = data?.items ?? [];

  // Count statuses of loaded bookings list
  const activeCount = bookingsList.filter(b => b.status === "Active").length;
  const pickedUpCount = bookingsList.filter(b => b.status === "PickedUp").length;
  const returnedCount = bookingsList.filter(b => b.status === "Returned").length;
  const cancelledCount = bookingsList.filter(b => b.status === "Cancelled").length;

  // Search booking by code in Pickup Modal
  const handleSearchPickupCode = async () => {
    if (!pickupCode.trim()) return;
    try {
      setPickupSearchError("");
      setFoundPickupTarget(null);
      const found = await bookingService.getByCode(pickupCode.trim());
      if (found.status !== "Active") {
        setPickupSearchError("الحجز يجب أن يكون نشطاً ليتم تسليمه.");
        return;
      }
      setFoundPickupTarget(found);
      setPickupPaidAmount(found.remainingAmount);
      setPickupIdTaken(found.idTaken);
    } catch (err) {
      const errMsg = extractErrorMessage(err);
      setPickupSearchError(errMsg || "حدث خطأ أثناء البحث عن الكود");
    }
  };

  const handleConfirmPickup = async () => {
    if (!foundPickupTarget) return;
    if (pickupPaidAmount > foundPickupTarget.totalAmount) {
      toast.error("المبلغ المدفوع لا يمكن أن يكون أكبر من إجمالي الحجز");
      return;
    }
    setPickupSubmitting(true);
    try {
      await pickupM.mutateAsync({
        id: foundPickupTarget.id,
        body: {
          paidAmount: pickupPaidAmount,
          idTaken: pickupIdTaken
        }
      });
      setShowPickup(false);
      setPickupCode("");
      setFoundPickupTarget(null);
      refetch();
    } finally {
      setPickupSubmitting(false);
    }
  };

  const [exporting, setExporting] = useState(false);

  const handleExport = async () => {
    setExporting(true);
    try {
      const from = fromDateFilter || undefined;
      const to = toDateFilter || undefined;
      const blob = await analyticsService.exportExcel(0, from, to);
      const suffix = from || to ? `_${from ?? ""}_${to ?? ""}` : `_${new Date().toISOString().split("T")[0]}`;
      const fileName = `سجل-الحجوزات${suffix}.xlsx`;

      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", fileName);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      toast.success("تم تصدير سجل الحجوزات بنجاح ✓");
    } catch (err) {
      console.error("Export failed", err);
      toast.error("فشل تصدير سجل الحجوزات");
    } finally {
      setExporting(false);
    }
  };

  return (
    <div className="space-y-6 text-right font-sans" dir="rtl">
      {/* Title Header Row */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border/40 pb-5">
        <div>
          <h1 className="text-2xl font-black text-foreground tracking-tight">الحجوزات</h1>
          <p className="text-muted-foreground text-xs mt-1 font-semibold">إدارة ومتابعة جميع حجوزات البدلات</p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => navigate("/bookings/create")}
            className="flex items-center justify-center gap-2 px-4 h-11 rounded-xl bg-primary hover:bg-primary/95 text-primary-foreground font-bold text-xs shadow-md transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>حجز جديد</span>
          </button>
          
          <button
            onClick={() => {
              setPickupCode("");
              setFoundPickupTarget(null);
              setPickupSearchError("");
              setShowPickup(true);
            }}
            className="flex items-center justify-center gap-2 px-4 h-11 rounded-xl border border-primary text-primary hover:bg-primary/10 font-bold text-xs transition-all cursor-pointer"
          >
            <UserCheck className="w-4 h-4" />
            <span>تسليم بدلة (Pickup)</span>
          </button>

          <button
            disabled={exporting}
            onClick={handleExport}
            className="flex items-center justify-center gap-2 px-4 h-11 rounded-xl border border-border text-foreground hover:bg-accent font-semibold text-xs transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {exporting ? <Loader2 className="w-4 h-4 animate-spin" /> : <ArrowDown className="w-4 h-4" />}
            <span>تصدير Excel</span>
          </button>
        </div>
      </div>

      {/* Toolbar Filter Inputs Row */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 bg-card/45 border border-border/70 rounded-2xl p-4 shadow-sm">
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <input
            value={search}
            onChange={e => { setSearch(e.target.value); setPage(1); }}
            placeholder="البحث برقم الحجز أو اسم العميل أو الهاتف..."
            className="w-full h-11 pr-4 pl-10 rounded-xl bg-background border border-border text-foreground placeholder-muted-foreground/60 outline-none focus:ring-1 focus:ring-primary text-xs font-semibold transition-all text-right font-mono"
          />
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/50" />
        </div>

        {/* Date period picker */}
        <div className="relative min-w-[170px]">
          <input
            type="date"
            placeholder="نطاق التاريخ"
            value={fromDateFilter}
            onChange={e => { setFromDateFilter(e.target.value); setPage(1); }}
            className="w-full h-11 px-4 rounded-xl bg-background border border-border text-foreground outline-none focus:ring-1 focus:ring-primary text-xs font-bold transition-all text-right cursor-pointer"
          />
        </div>

        <div className="flex items-center gap-2">
          {/* Status select */}
          <select
            value={statusFilter}
            onChange={e => { setStatusFilter(e.target.value); setPage(1); }}
            className="h-11 px-4 rounded-xl bg-background border border-border text-foreground outline-none focus:ring-1 focus:ring-primary text-xs font-bold transition-all min-w-[150px] cursor-pointer text-right"
          >
            <option value="">الحالات</option>
            {Object.entries(STATUS_LABELS).map(([key, label]) => (
              <option key={key} value={key}>{label}</option>
            ))}
          </select>

          {/* Advanced filters button */}
          <button
            onClick={() => setShowAdvanced(!showAdvanced)}
            className={cn(
              "flex items-center justify-center gap-2 px-4 h-11 rounded-xl border text-xs font-bold transition-all cursor-pointer",
              showAdvanced
                ? "bg-primary/10 border-primary/30 text-primary"
                : "bg-background border-border text-muted-foreground hover:text-foreground"
            )}
          >
            <SlidersHorizontal className="w-4 h-4" />
            <span>المزيد من الفلاتر</span>
          </button>

          {/* Reset Filters */}
          <button
            onClick={() => {
              setPartitionFilter("");
              setHangerFilter("");
              setFromDateFilter("");
              setToDateFilter("");
              setIsExpiredFilter("");
              setHasDiscountFilter("");
              setDepositPaidFilter("");
              setIdTakenFilter("");
              setIsDamagedFilter("");
              setSortColumn("CreatedAt");
              setSortDirection("Desc");
              setSearch("");
              setStatusFilter("");
              setPage(1);
              setPageSize(10);
            }}
            className="h-11 px-4 rounded-xl bg-background border border-border text-muted-foreground hover:text-foreground font-bold text-xs transition-all cursor-pointer"
          >
            إعادة تعيين
          </button>
        </div>
      </div>

      {/* Advanced Filters Expandable Grid */}
      {showAdvanced && (
        <div className="bg-card border border-border rounded-2xl p-6 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 shadow-sm animate-in fade-in duration-200">
          <div>
            <label className="block text-[10px] font-bold text-muted-foreground mb-1.5 mr-1">القسم</label>
            <select
              value={partitionFilter}
              onChange={e => { setPartitionFilter(e.target.value); setPage(1); }}
              className="w-full h-11 px-4 rounded-xl bg-background border border-border text-foreground outline-none focus:ring-1 focus:ring-primary text-xs font-semibold text-right cursor-pointer"
            >
              <option value="">الكل</option>
              {partitions.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
            </select>
          </div>

          <div>
            <label className="block text-[10px] font-bold text-muted-foreground mb-1.5 mr-1">رقم الشماعة</label>
            <input
              type="text"
              value={hangerFilter}
              onChange={e => { setHangerFilter(e.target.value); setPage(1); }}
              placeholder="ابحث برقم الشماعة..."
              className="w-full h-11 px-4 rounded-xl bg-background border border-border text-foreground placeholder-muted-foreground/60 outline-none focus:ring-1 focus:ring-primary text-xs font-semibold text-right font-mono"
            />
          </div>

          <div>
            <label className="block text-[10px] font-bold text-muted-foreground mb-1.5 mr-1">إلى تاريخ</label>
            <input
              type="date"
              value={toDateFilter}
              onChange={e => { setToDateFilter(e.target.value); setPage(1); }}
              className="w-full h-11 px-4 rounded-xl bg-background border border-border text-foreground outline-none focus:ring-1 focus:ring-primary text-xs font-semibold text-right cursor-pointer"
            />
          </div>

          <div>
            <label className="block text-[10px] font-bold text-muted-foreground mb-1.5 mr-1">انتهاء الحجز</label>
            <select
              value={isExpiredFilter}
              onChange={e => { setIsExpiredFilter(e.target.value); setPage(1); }}
              className="w-full h-11 px-4 rounded-xl bg-background border border-border text-foreground outline-none focus:ring-1 focus:ring-primary text-xs font-semibold text-right cursor-pointer"
            >
              <option value="">الكل</option>
              <option value="true">منتهية الصلاحية</option>
              <option value="false">سارية الصلاحية</option>
            </select>
          </div>

          <div>
            <label className="block text-[10px] font-bold text-muted-foreground mb-1.5 mr-1">الخصومات</label>
            <select
              value={hasDiscountFilter}
              onChange={e => { setHasDiscountFilter(e.target.value); setPage(1); }}
              className="w-full h-11 px-4 rounded-xl bg-background border border-border text-foreground outline-none focus:ring-1 focus:ring-primary text-xs font-semibold text-right cursor-pointer"
            >
              <option value="">الكل</option>
              <option value="true">يوجد خصم</option>
              <option value="false">بدون خصم</option>
            </select>
          </div>

          <div>
            <label className="block text-[10px] font-bold text-muted-foreground mb-1.5 mr-1">دفع التأمين</label>
            <select
              value={depositPaidFilter}
              onChange={e => { setDepositPaidFilter(e.target.value); setPage(1); }}
              className="w-full h-11 px-4 rounded-xl bg-background border border-border text-foreground outline-none focus:ring-1 focus:ring-primary text-xs font-semibold text-right cursor-pointer"
            >
              <option value="">الكل</option>
              <option value="true">تم الدفع</option>
              <option value="false">لم يدفع</option>
            </select>
          </div>

          <div>
            <label className="block text-[10px] font-bold text-muted-foreground mb-1.5 mr-1">أخذ البطاقة</label>
            <select
              value={idTakenFilter}
              onChange={e => { setIdTakenFilter(e.target.value); setPage(1); }}
              className="w-full h-11 px-4 rounded-xl bg-background border border-border text-foreground outline-none focus:ring-1 focus:ring-primary text-xs font-semibold text-right cursor-pointer"
            >
              <option value="">الكل</option>
              <option value="true">تم أخذ البطاقة</option>
              <option value="false">لم تؤخذ بعد</option>
            </select>
          </div>

          <div>
            <label className="block text-[10px] font-bold text-muted-foreground mb-1.5 mr-1">حالة البدلة (تالفة؟)</label>
            <select
              value={isDamagedFilter}
              onChange={e => { setIsDamagedFilter(e.target.value); setPage(1); }}
              className="w-full h-11 px-4 rounded-xl bg-background border border-border text-foreground outline-none focus:ring-1 focus:ring-primary text-xs font-semibold text-right cursor-pointer"
            >
              <option value="">الكل</option>
              <option value="true">تالفة فقط</option>
              <option value="false">سليمة فقط</option>
            </select>
          </div>

          <div>
            <label className="block text-[10px] font-bold text-muted-foreground mb-1.5 mr-1">الترتيب حسب</label>
            <select
              value={sortColumn}
              onChange={e => { setSortColumn(e.target.value); setPage(1); }}
              className="w-full h-11 px-4 rounded-xl bg-background border border-border text-foreground outline-none focus:ring-1 focus:ring-primary text-xs font-semibold text-right cursor-pointer"
            >
              <option value="CreatedAt">تاريخ الإنشاء</option>
              <option value="TotalAmount">المبلغ الإجمالي</option>
              <option value="FromDate">تاريخ الاستلام</option>
              <option value="ToDate">تاريخ الإرجاع</option>
            </select>
          </div>
        </div>
      )}

      {/* Secondary Status Summaries Row (Image 4) */}
      <div className="flex flex-wrap items-center justify-between gap-4 text-xs font-bold bg-card/65 border border-border/80 rounded-2xl p-4 shadow-sm">
        <div className="text-muted-foreground">
          عرض {bookingsList.length} حجز في الصفحة الحالية
        </div>
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1.5 text-blue-400">
            <span className="w-2 h-2 rounded-full bg-blue-400" />
            <span>{activeCount} نشط</span>
          </span>
          <span className="flex items-center gap-1.5 text-amber-400">
            <span className="w-2 h-2 rounded-full bg-amber-400" />
            <span>{pickedUpCount} تم الاستلام</span>
          </span>
          <span className="flex items-center gap-1.5 text-emerald-400">
            <span className="w-2 h-2 rounded-full bg-emerald-400" />
            <span>{returnedCount} مكتمل</span>
          </span>
          <span className="flex items-center gap-1.5 text-red-400">
            <span className="w-2 h-2 rounded-full bg-red-400" />
            <span>{cancelledCount} ملغي</span>
          </span>
        </div>
      </div>

      {/* Bookings List: Horizontal Card List (Image 4 design) */}
      <div className="grid grid-cols-1 gap-4">
        {isLoading && Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="bg-card border border-border/80 rounded-3xl p-6 h-32 animate-pulse" />
        ))}
        
        {!isLoading && bookingsList.length === 0 && (
          <div className="bg-card border border-border/80 rounded-3xl p-12 text-center text-muted-foreground text-sm shadow-sm">
            لا توجد حجوزات تطابق معايير البحث الحالية.
          </div>
        )}

        {!isLoading && bookingsList.map((b) => {
          const fromParts = getArabicDateParts(b.fromDate);
          const toParts = getArabicDateParts(b.toDate);

          return (
            <div
              key={b.id}
              onClick={() => navigate(`/bookings/${b.id}`)}
              className="bg-card border border-border/80 rounded-3xl p-5 flex flex-col lg:flex-row lg:items-center justify-between gap-6 hover:border-primary/40 transition-all duration-200 shadow-sm relative overflow-hidden text-right"
            >
              {/* Status color indicator Left border (as in screenshot) */}
              <div className={cn("absolute left-0 top-0 bottom-0 w-1.5", statusColors[b.status] || "bg-muted")} />

              {/* Column 1: Status badge & Code */}
              <div className="flex flex-row lg:flex-col items-center lg:items-start justify-between lg:justify-start gap-2 min-w-[130px] pr-2 lg:border-l lg:border-border/40 lg:pl-4">
                <span className={cn(
                  "px-3 py-1 rounded-full border text-xs font-extrabold flex items-center gap-1 shadow-sm",
                  b.status === "Active" && "bg-blue-500/10 border-blue-500/20 text-blue-400",
                  b.status === "PickedUp" && "bg-amber-500/10 border-amber-500/20 text-amber-400",
                  b.status === "Returned" && "bg-emerald-500/10 border-emerald-500/20 text-emerald-400",
                  b.status === "Cancelled" && "bg-red-500/10 border-red-500/20 text-red-400"
                )}>
                  {b.status === "Active" && "نشط"}
                  {b.status === "PickedUp" && "تم الاستلام"}
                  {b.status === "Returned" && "مكتمل"}
                  {b.status === "Cancelled" && "ملغي"}
                </span>
                
                <div className="text-right lg:mt-1.5">
                  <span className="text-lg font-black text-foreground font-mono">#{b.code}</span>
                  {b.isExpired && b.status === "Active" && (
                    <span className="text-[11px] text-red-400 font-extrabold flex items-center gap-0.5 border border-red-500/25 px-2 py-0.5 rounded bg-red-500/5 mt-1 w-fit">
                      <span>⏱️ متأخرة</span>
                    </span>
                  )}
                </div>
              </div>

              {/* Column 2: Customer Avatar & details */}
              <div className="flex items-center gap-3.5 min-w-[200px] justify-start lg:border-l lg:border-border/40 lg:pl-4">
                <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-sm shrink-0 font-serif">
                  {b.customer.customerName ? b.customer.customerName.charAt(0) : "ع"}
                </div>
                <div className="flex flex-col text-right">
                  <span className="text-sm font-black text-foreground">{b.customer.customerName || "عميل غير مسجل"}</span>
                  <div className="flex items-center gap-1.5 text-muted-foreground text-xs font-mono mt-1 justify-start">
                    <Phone className="w-3.5 h-3.5 text-muted-foreground/60" />
                    <span>{b.customer.phone}</span>
                  </div>
                </div>
              </div>

              {/* Column 3: Suit Specs */}
              <div className="flex flex-col items-center justify-center min-w-[120px] lg:border-l lg:border-border/40 lg:pl-4">
                <span className="bg-zinc-950 dark:bg-zinc-900 border border-zinc-800 text-zinc-100 px-4 py-1.5 rounded-2xl text-sm font-black tracking-wider font-mono shadow-md">
                  {b.partitionName}-{b.hangerNumber}
                </span>
                <span className="text-xs text-muted-foreground font-extrabold mt-2">
                  مقاس {b.suitSize}
                </span>
              </div>

              {/* Column 4: Expected Return date */}
              <div className="flex flex-col items-center min-w-[85px] lg:border-l lg:border-border/40 lg:pl-4">
                <span className="text-[11px] text-red-400 font-bold mb-1">إرجاع</span>
                <span className="text-xl font-black text-foreground leading-none">{toParts.day}</span>
                <span className="text-xs text-muted-foreground font-bold mt-1">{toParts.month}</span>
                <span className="text-xs text-muted-foreground/75 mt-0.5">{toParts.time}</span>
              </div>

              {/* Column 5: Pickup Date */}
              <div className="flex flex-col items-center min-w-[85px] lg:border-l lg:border-border/40 lg:pl-4">
                <span className="text-[11px] text-emerald-400 font-bold mb-1">استلام</span>
                <span className="text-xl font-black text-foreground leading-none">{fromParts.day}</span>
                <span className="text-xs text-muted-foreground font-bold mt-1">{fromParts.month}</span>
                <span className="text-xs text-muted-foreground/75 mt-0.5">{fromParts.time}</span>
              </div>

              {/* Column 6: Financial Settlement Grid */}
              <div className="flex items-center gap-5 min-w-[210px] justify-between lg:justify-start lg:border-l lg:border-border/40 lg:pl-4 border-t lg:border-t-0 border-border/30 pt-4 lg:pt-0">
                <div className="flex flex-col items-center w-14">
                  <span className="text-xs text-muted-foreground font-bold mb-1">الإجمالي</span>
                  <span className="text-sm font-bold text-foreground font-mono">{(b.totalAmount).toLocaleString("ar-EG-u-nu-latn", { minimumFractionDigits: 0, maximumFractionDigits: 3 })}</span>
                </div>
                <div className="flex flex-col items-center w-14 font-bold">
                  <span className="text-xs text-muted-foreground font-bold mb-1">النهائي</span>
                  <span className="text-sm text-primary font-mono">{(b.finalAmount).toLocaleString("ar-EG-u-nu-latn", { minimumFractionDigits: 0, maximumFractionDigits: 3 })}</span>
                </div>
                <div className="flex flex-col items-center w-14 font-bold">
                  <span className="text-xs text-muted-foreground font-bold mb-1">المتبقي</span>
                  {b.remainingAmount === 0 ? (
                    <span className="text-sm text-emerald-400 font-black">خالص</span>
                  ) : (
                    <span className="text-sm text-red-400 font-mono">{(b.remainingAmount).toLocaleString("ar-EG-u-nu-latn", { minimumFractionDigits: 0, maximumFractionDigits: 3 })}</span>
                  )}
                </div>
              </div>

              {/* Column 7: Dropdown details trigger button */}
              <div className="flex items-center justify-center pt-2 lg:pt-0">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    navigate(`/bookings/${b.id}`);
                  }}
                  className="w-9 h-9 rounded-full hover:bg-muted flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors cursor-pointer text-base font-bold"
                >
                  ...
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Pagination component */}
      {data && data.totalCount > 0 && (
        <div className="flex items-center justify-between px-6 py-4 border-t border-border/40 bg-muted/5 select-none">
          <div className="text-xs text-muted-foreground font-semibold">
            عرض {((page - 1) * pageSize) + 1} - {Math.min(page * pageSize, data.totalCount)} من {data.totalCount} حجز
          </div>
          
          <div className="flex items-center gap-3">
            <button
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={!data.hasPreviousPage}
              className="w-8 h-8 rounded-lg border border-border flex items-center justify-center text-muted-foreground hover:text-foreground disabled:opacity-40 transition-colors cursor-pointer"
            >
              {"<"}
            </button>
            
            <div className="flex items-center gap-1.5">
              {Array.from({ length: data.totalPages }, (_, i) => i + 1).map(n => (
                <button
                  key={n}
                  onClick={() => setPage(n)}
                  className={cn(
                    "w-8 h-8 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center justify-center",
                    n === page
                      ? "bg-primary text-primary-foreground shadow-sm font-black"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                  )}
                >
                  {n}
                </button>
              ))}
            </div>
            
            <button
              onClick={() => setPage(p => Math.min(data.totalPages, p + 1))}
              disabled={!data.hasNextPage}
              className="w-8 h-8 rounded-lg border border-border flex items-center justify-center text-muted-foreground hover:text-foreground disabled:opacity-40 transition-colors cursor-pointer"
            >
              {">"}
            </button>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground font-bold">لكل صفحة</span>
            <select
              value={pageSize}
              onChange={e => { setPageSize(Number(e.target.value)); setPage(1); }}
              className="h-9 px-2 rounded-lg bg-background border border-border text-foreground text-xs font-bold transition-all cursor-pointer text-right outline-none focus:ring-1 focus:ring-primary"
            >
              <option value="5">5</option>
              <option value="10">10</option>
              <option value="20">20</option>
              <option value="50">50</option>
            </select>
          </div>
        </div>
      )}

      {/* MODAL: PICK UP SUIT */}
      {showPickup && (
        <Modal title="تسليم البدلة للزبون (يوم الفرح)" onClose={() => setShowPickup(false)}>
          <div className="space-y-4 text-right">
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="أدخل كود الحجز (6 أرقام)..."
                value={pickupCode}
                onChange={e => setPickupCode(e.target.value)}
                className="flex-1 h-11 px-4 rounded-xl bg-background border border-border text-foreground outline-none focus:ring-2 focus:ring-primary text-sm font-bold font-mono text-right"
              />
              <button
                onClick={handleSearchPickupCode}
                className="px-5 bg-primary hover:bg-primary/90 text-primary-foreground font-bold rounded-xl text-sm"
              >
                بحث عن الكود
              </button>
            </div>

            {pickupSearchError && <p className="text-red-400 text-xs font-semibold">{pickupSearchError}</p>}

            {foundPickupTarget && (
              <div className="bg-muted/40 border border-border rounded-xl p-5 space-y-4 animate-in fade-in duration-200">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-muted-foreground block text-xs">العميل</span>
                    <span className="font-bold text-foreground">{foundPickupTarget.customer.customerName || "عميل غير مسجل"}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground block text-xs">رقم الهاتف</span>
                    <span className="font-mono font-bold text-foreground">{foundPickupTarget.customer.phone}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground block text-xs">موضع البدلة</span>
                    <span className="font-bold text-foreground">قسم {foundPickupTarget.partitionName} - شماعة {foundPickupTarget.hangerNumber}#</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground block text-xs">إجمالي الحجز</span>
                    <span className="font-bold text-foreground">{foundPickupTarget.totalAmount} د.ك</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground block text-xs">المبلغ المتبقي</span>
                    <span className="font-bold text-amber-400 text-lg">{foundPickupTarget.remainingAmount} د.ك</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground block text-xs">مبلغ التأمين المدفوع سابقاً</span>
                    <span className="font-bold text-foreground">{foundPickupTarget.depositAmount || 0} د.ك</span>
                  </div>
                </div>

                <div className="border-t border-border pt-4">
                  <label className="block text-xs font-semibold text-muted-foreground mb-1.5">المبلغ المدفوع الآن (الباقي) *</label>
                  <input
                    type="number"
                    step="0.01"
                    value={pickupPaidAmount}
                    onChange={e => setPickupPaidAmount(Number(e.target.value))}
                    placeholder="أدخل المبلغ المستلم..."
                    className="w-full h-11 px-4 rounded-xl bg-background border border-border text-foreground font-bold outline-none focus:ring-2 focus:ring-primary text-sm transition-all text-right font-mono"
                  />
                  <p className="text-[10px] text-muted-foreground mt-1 font-semibold">تنبيه: تحديث حالة الحجز إلى PickedUp يسجل استلام البدلة والبطاقة وتسوية الدفعة.</p>
                </div>

                <div className="flex items-center gap-2.5 py-1">
                  <label className="flex items-center gap-2 cursor-pointer select-none text-xs font-bold text-muted-foreground hover:text-foreground transition-colors">
                    <input
                      type="checkbox"
                      checked={pickupIdTaken}
                      disabled={foundPickupTarget.idTaken}
                      onChange={e => setPickupIdTaken(e.target.checked)}
                      className="w-4 h-4 rounded border-border bg-background text-primary focus:ring-primary focus:ring-offset-background"
                    />
                    <span>تم استلام البطاقة الشخصية كضمان</span>
                  </label>
                  {foundPickupTarget.idTaken && (
                    <span className="text-[10px] text-emerald-400 font-extrabold">(تم الاستلام مسبقاً)</span>
                  )}
                </div>

                <button
                  onClick={handleConfirmPickup}
                  disabled={pickupSubmitting}
                  className="w-full h-11 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold flex items-center justify-center gap-2 transition-all disabled:opacity-60 cursor-pointer"
                >
                  {pickupSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />} تأكيد تسليم البدلة ودفع المبلغ
                </button>
              </div>
            )}
          </div>
        </Modal>
      )}
    </div>
  );
}
