import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  useGetBookingById,
  useReturnBooking,
  useCancelBooking,
  useDeleteBooking,
  useUpdateBooking,
  usePickupBooking,
} from "../hooks/useBookings";
import { toast } from "sonner";
import {
  ArrowRight, Calendar, User, CreditCard,
  Layers, Notebook, Clock, Trash2, Check, Loader2, ShieldAlert,
  AlertTriangle, CheckCircle2, Pencil, Phone, ArrowDown, ArrowUp,
  Shirt, SlidersHorizontal, UserCheck, XCircle, Wind
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  GRAVATA_COLORS,
  SHIRT_COLORS,
  SHIRT_SIZES,
  TROUSER_COLORS,
  VEST_COLORS
} from "../components/BookingForm";
import { BookingCancelModal } from "../components/BookingCancelModal";
import { BookingEditModal } from "../components/BookingEditModal";
import { BookingPickupModal } from "../components/BookingPickupModal";
import { BookingReturnModal } from "../components/BookingReturnModal";

const STATUS_LABELS: Record<string, string> = {
  Active: "تحت التجهيز",
  PickedUp: "خارج مع الزبون",
  Returned: "مرتجع ومكتمل",
  Cancelled: "ملغي",
};


const STATUS_CLASSES: Record<string, string> = {
  Active: "bg-amber-500/10 border-amber-500/30 text-amber-300",
  PickedUp: "bg-emerald-500/10 border-emerald-500/30 text-emerald-300",
  Returned: "bg-blue-500/10 border-blue-500/30 text-blue-300",
  Cancelled: "bg-red-500/10 border-red-500/30 text-red-300",
};

export default function BookingDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const { data: booking, isLoading, error } = useGetBookingById(id ?? "");
  const returnBookingM = useReturnBooking();
  const cancelBookingM = useCancelBooking();
  const deleteM = useDeleteBooking();
  const updateM = useUpdateBooking();
  const pickupM = usePickupBooking();

  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancelDeduction, setCancelDeduction] = useState(0);
  const [cancelReason, setCancelReason] = useState("");

  const [showEditModal, setShowEditModal] = useState(false);
  const [editFromDate, setEditFromDate] = useState("");
  const [editToDate, setEditToDate] = useState("");
  const [editTotalAmount, setEditTotalAmount] = useState(0);
  const [editHasDiscount, setEditHasDiscount] = useState(false);
  const [editDiscountPercentage, setEditDiscountPercentage] = useState<number | null>(null);
  const [editDepositPaid, setEditDepositPaid] = useState(false);
  const [editDepositAmount, setEditDepositAmount] = useState(0);
  const [editIdTaken, setEditIdTaken] = useState(false);
  const [editNotes, setEditNotes] = useState("");

  const [showPickupModal, setShowPickupModal] = useState(false);
  const [pickupPaidAmount, setPickupPaidAmount] = useState(0);
  const [pickupIdTaken, setPickupIdTaken] = useState(false);

  const [showReturnModal, setShowReturnModal] = useState(false);
  const [returnIsDamaged, setReturnIsDamaged] = useState(false);
  const [returnDamageAmount, setReturnDamageAmount] = useState(0);
  const [returnDamageNotes, setReturnDamageNotes] = useState("");

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <Loader2 className="w-10 h-10 text-primary animate-spin" />
        <p className="text-muted-foreground text-sm font-semibold">جاري تحميل تفاصيل الحجز...</p>
      </div>
    );
  }

  if (error || !booking) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4 max-w-md mx-auto text-center">
        <div className="w-16 h-16 rounded-2xl bg-destructive/10 border border-destructive/20 flex items-center justify-center">
          <ShieldAlert className="w-8 h-8 text-destructive" />
        </div>
        <h3 className="text-xl font-bold text-foreground">الحجز غير موجود</h3>
        <p className="text-muted-foreground text-sm">عذراً، لم نتمكن من العثور على تفاصيل الحجز المطلوبة أو حدث خطأ أثناء الاتصال بالخادم.</p>
        <button
          onClick={() => navigate("/bookings")}
          className="flex items-center gap-2 px-5 h-11 rounded-xl bg-accent border border-border text-foreground hover:bg-accent/85 font-bold transition-all text-sm mt-2"
        >
          <ArrowRight className="w-4 h-4 ml-1" /> العودة لقائمة الحجوزات
        </button>
      </div>
    );
  }

  const handleConfirmCancel = async () => {
    try {
      await cancelBookingM.mutateAsync({
        id: booking.id,
        body: {
          deductionAmount: cancelDeduction,
          cancellationReason: cancelReason || null
        }
      });
      setShowCancelModal(false);
    } catch {
      // Error handled by mutation toast
    }
  };

  const handleConfirmReturn = async () => {
    try {
      await returnBookingM.mutateAsync({
        id: booking.id,
        body: {
          isDamaged: returnIsDamaged,
          damageAmount: returnIsDamaged ? returnDamageAmount : null,
          damageNotes: returnIsDamaged ? returnDamageNotes : null,
        }
      });
      setShowReturnModal(false);
    } catch {
      // Error handled by mutation
    }
  };

  const handleConfirmEdit = async () => {
    try {
      await updateM.mutateAsync({
        id: booking!.id,
        body: {
          fromDate: new Date(editFromDate).toISOString(),
          toDate: new Date(editToDate).toISOString(),
          totalAmount: editTotalAmount,
          discountPercentage: editHasDiscount ? editDiscountPercentage : null,
          depositPaid: editDepositPaid,
          depositAmount: editDepositAmount,
          idTaken: editIdTaken,
          notes: editNotes || undefined,
        }
      });
      setShowEditModal(false);
    } catch {
      // Error handled by mutation
    }
  };

  const handleConfirmPickup = async () => {
    if (pickupPaidAmount > booking!.totalAmount) {
      toast.error("المبلغ المدفوع لا يمكن أن يكون أكبر من إجمالي الحجز");
      return;
    }
    try {
      await pickupM.mutateAsync({
        id: booking!.id,
        body: {
          paidAmount: pickupPaidAmount,
          idTaken: pickupIdTaken
        }
      });
      setShowPickupModal(false);
    } catch {
      // Error handled by mutation
    }
  };

  const handleDelete = async () => {
    if (confirm("هل تريد حذف هذا الحجز نهائياً؟")) {
      try {
        await deleteM.mutateAsync(booking!.id);
        navigate("/bookings");
      } catch {
        // Error handled by mutation toast
      }
    }
  };

  return (
    <div className="space-y-6 text-right font-sans" dir="rtl">
      {/* 1. Elegant Hero Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-5 border-b border-border/80">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate("/bookings")}
            className="w-10 h-10 rounded-xl bg-card border border-border flex items-center justify-center text-muted-foreground hover:text-foreground transition-all hover:bg-accent shrink-0 cursor-pointer"
          >
            <ArrowRight className="w-5 h-5 ml-0.5" />
          </button>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-black text-foreground font-mono tracking-tight">#{booking.code}</h1>
            <span className={cn("px-3.5 py-1.5 rounded-full border text-xs font-black shadow-sm flex items-center gap-1.5", STATUS_CLASSES[booking.status])}>
              {booking.status === "Active" && <Clock className="w-4 h-4" />}
              {booking.status === "PickedUp" && <UserCheck className="w-4 h-4" />}
              {booking.status === "Returned" && <CheckCircle2 className="w-4 h-4" />}
              {booking.status === "Cancelled" && <XCircle className="w-4 h-4" />}
              <span>{STATUS_LABELS[booking.status]}</span>
            </span>
          </div>
        </div>

        {/* Action Buttons Row */}
        <div className="flex flex-wrap items-center gap-2.5">
          {booking.status === "Active" && (
            <button
              onClick={() => {
                setPickupPaidAmount(booking.remainingAmount);
                setPickupIdTaken(booking.idTaken);
                setShowPickupModal(true);
              }}
              disabled={pickupM.isPending}
              className="flex items-center justify-center gap-2 px-5 h-11 rounded-xl bg-primary text-primary-foreground font-bold text-sm transition-all cursor-pointer shadow-md hover:bg-primary/95"
            >
              {pickupM.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />} تسليم البدلة (Pickup)
            </button>
          )}

          {booking.status === "PickedUp" && (
            <button
              onClick={() => {
                setReturnIsDamaged(false);
                setReturnDamageAmount(0);
                setReturnDamageNotes("");
                setShowReturnModal(true);
              }}
              disabled={returnBookingM.isPending}
              className="flex items-center justify-center gap-2 px-5 h-11 rounded-xl bg-card border border-border text-foreground hover:bg-accent font-bold text-sm transition-all cursor-pointer"
            >
              {returnBookingM.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />} إرجاع البدلة
            </button>
          )}

          {(booking.status === "Active" || booking.status === "PickedUp") && (
            <button
              onClick={() => {
                setCancelDeduction(0);
                setCancelReason("");
                setShowCancelModal(true);
              }}
              disabled={cancelBookingM.isPending}
              className="flex items-center justify-center gap-2 px-5 h-11 rounded-xl bg-card border border-border text-foreground hover:bg-accent font-bold text-sm transition-all cursor-pointer"
            >
              {cancelBookingM.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Clock className="w-4 h-4" />} إلغاء الحجز
            </button>
          )}

          <button
            onClick={() => {
              if (booking) {
                setEditFromDate(booking.fromDate.split("T")[0]);
                setEditToDate(booking.toDate.split("T")[0]);
                setEditTotalAmount(booking.totalAmount);
                setEditHasDiscount(booking.discountPercentage != null);
                setEditDiscountPercentage(booking.discountPercentage || 0);
                setEditDepositPaid(booking.depositPaid);
                setEditDepositAmount(booking.depositAmount || 0);
                setEditIdTaken(booking.idTaken);
                setEditNotes(booking.notes || "");
                setShowEditModal(true);
              }
            }}
            disabled={updateM.isPending}
            className="flex items-center justify-center gap-2 px-5 h-11 rounded-xl bg-primary text-primary-foreground font-bold text-sm transition-all cursor-pointer shadow-md hover:bg-primary/95"
            title="تعديل بيانات الحجز"
          >
            <Pencil className="w-4.5 h-4.5" />
            <span>تعديل</span>
          </button>

          <button
            onClick={handleDelete}
            disabled={deleteM.isPending}
            className="w-11 h-11 rounded-xl bg-card border border-destructive/30 hover:bg-destructive/10 text-destructive flex items-center justify-center transition-all cursor-pointer"
            title="حذف الحجز"
          >
            {deleteM.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4.5 h-4.5" />}
          </button>
        </div>
      </div>

      {/* 2. Visual Booking Lifecycle Stepper */}
      <div className="bg-card border border-border/80 rounded-3xl p-6 shadow-sm space-y-6 text-right">
        <div className="flex items-center justify-between border-b border-border/40 pb-3">
          <h3 className="text-sm font-black text-foreground flex items-center gap-2">
            <Clock className="w-5 h-5 text-primary" />
            <span>مسار وتدفق حالة الحجز</span>
          </h3>
          <span className="text-[10px] text-muted-foreground font-bold">مخطط زمني تفاعلي لتسهيل المتابعة</span>
        </div>

        <div className="relative flex flex-col md:flex-row items-center justify-between gap-6 md:gap-0 pt-4 px-4">
          {/* Connecting Lines (Desktop only) */}
          <div className="absolute top-[35px] left-12 right-12 h-1 bg-border/40 hidden md:block z-0">
            <div 
              className={cn(
                "h-full bg-primary transition-all duration-500 absolute right-0",
                booking.status === "PickedUp" && "w-1/2",
                booking.status === "Returned" && "w-full",
                booking.status === "Cancelled" && "w-0"
              )} 
            />
          </div>

          {/* Step 1: Active (نشط) */}
          <div className="flex flex-col items-center text-center relative z-10 w-full md:w-1/3">
            <div className={cn(
              "w-12 h-12 rounded-full border-2 flex items-center justify-center font-bold text-sm transition-all duration-300",
              booking.status === "Active" || booking.status === "PickedUp" || booking.status === "Returned"
                ? "bg-primary border-primary text-primary-foreground shadow-md shadow-primary/25"
                : "bg-background border-border text-muted-foreground"
            )}>
              {booking.status === "PickedUp" || booking.status === "Returned" ? <Check className="w-5 h-5" /> : "1"}
            </div>
            <span className={cn("text-xs font-black mt-2", (booking.status === "Active" || booking.status === "PickedUp" || booking.status === "Returned") ? "text-primary" : "text-muted-foreground")}>نشط</span>
            <span className="text-[9px] text-muted-foreground mt-0.5 max-w-[130px]">تم دفع التأمين والبدلة تحت التجهيز</span>
          </div>

          {/* Step 2: PickedUp (تم الاستلام) */}
          <div className={cn(
            "flex flex-col items-center text-center relative z-10 w-full md:w-1/3",
            booking.status === "Cancelled" && "opacity-40"
          )}>
            <div className={cn(
              "w-12 h-12 rounded-full border-2 flex items-center justify-center font-bold text-sm transition-all duration-300",
              booking.status === "PickedUp" || booking.status === "Returned"
                ? "bg-amber-500 border-amber-500 text-white shadow-md shadow-amber-500/25"
                : "bg-background border-border text-muted-foreground"
            )}>
              {booking.status === "Returned" ? <Check className="w-5 h-5" /> : "2"}
            </div>
            <span className={cn("text-xs font-black mt-2", (booking.status === "PickedUp" || booking.status === "Returned") ? "text-amber-500" : "text-muted-foreground")}>تم الاستلام</span>
            <span className="text-[9px] text-muted-foreground mt-0.5 max-w-[130px]">استلم الزبون البدلة والبطاقة وصُفيت الدفعة</span>
          </div>

          {/* Step 3: Returned (مكتمل) */}
          <div className={cn(
            "flex flex-col items-center text-center relative z-10 w-full md:w-1/3",
            booking.status === "Cancelled" && "opacity-40"
          )}>
            <div className={cn(
              "w-12 h-12 rounded-full border-2 flex items-center justify-center font-bold text-sm transition-all duration-300",
              booking.status === "Returned"
                ? "bg-emerald-500 border-emerald-500 text-white shadow-md shadow-emerald-500/25"
                : "bg-background border-border text-muted-foreground"
            )}>
              {booking.status === "Returned" ? <Check className="w-5 h-5" /> : "3"}
            </div>
            <span className={cn("text-xs font-black mt-2", booking.status === "Returned" ? "text-emerald-500" : "text-muted-foreground")}>مكتمل</span>
            <span className="text-[9px] text-muted-foreground mt-0.5 max-w-[130px]">أُرجعت البدلة وصُفي مبلغ التأمين بالكامل</span>
          </div>

          {/* Step 4: Cancelled (ملغي) */}
          {booking.status === "Cancelled" && (
            <div className="flex flex-col items-center text-center relative z-10 w-full md:w-1/3">
              <div className="w-12 h-12 rounded-full border-2 bg-red-500 border-red-500 text-white shadow-md shadow-red-500/25 flex items-center justify-center font-bold text-sm animate-pulse">
                <XCircle className="w-5 h-5" />
              </div>
              <span className="text-xs font-black mt-2 text-red-500">ملغي</span>
              <span className="text-[9px] text-red-400 mt-0.5 max-w-[130px]">تم إلغاء الحجز واسترجاع التأمين أو استقطاعه</span>
            </div>
          )}
        </div>

        {/* Stepper Prompt Panel */}
        <div className="bg-muted/15 border border-border/30 rounded-2xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-4 text-xs font-bold">
          <div className="text-foreground">
            {booking.status === "Active" && (
              <p className="flex items-center gap-1.5 text-blue-400">
                <Clock className="w-4.5 h-4.5" />
                <span>الخطوة التالية المتاحة: لتسليم البدلة للزبون وتفعيل خيار الاستلام للزبون, اضغط على زر "تسليم الحجز الآن".</span>
              </p>
            )}
            {booking.status === "PickedUp" && (
              <p className="flex items-center gap-1.5 text-amber-500">
                <UserCheck className="w-4.5 h-4.5" />
                <span>الخطوة التالية المتاحة: لإرجاع البدلة وتصفية حسابات التلفيات والتأمين، اضغط على زر "إرجاع البدلة الآن".</span>
              </p>
            )}
            {booking.status === "Returned" && (
              <p className="flex items-center gap-1.5 text-emerald-500">
                <CheckCircle2 className="w-4.5 h-4.5" />
                <span>مكتمل: هذا الحجز منتهي ومقفل بالكامل ✓ تم استلام البدلة والضمانات وتصفية الحساب.</span>
              </p>
            )}
            {booking.status === "Cancelled" && (
              <p className="flex items-center gap-1.5 text-red-400">
                <AlertTriangle className="w-4.5 h-4.5 animate-pulse" />
                <span>ملغي: تم إلغاء هذا الحجز بنجاح. سبب الإلغاء: {booking.cancellationReason || "لم يذكر سبب"}.</span>
              </p>
            )}
          </div>
          
          <div className="flex items-center gap-2 shrink-0">
            {booking.status === "Active" && (
              <button
                type="button"
                onClick={() => {
                  setPickupPaidAmount(booking.remainingAmount);
                  setPickupIdTaken(booking.idTaken);
                  setShowPickupModal(true);
                }}
                className="px-4 h-9 rounded-xl bg-primary hover:bg-primary/95 text-primary-foreground font-bold text-[10px] shadow transition-all cursor-pointer"
              >
                تسليم الحجز الآن
              </button>
            )}
            {booking.status === "PickedUp" && (
              <button
                type="button"
                onClick={() => {
                  setReturnIsDamaged(false);
                  setReturnDamageAmount(0);
                  setReturnDamageNotes("");
                  setShowReturnModal(true);
                }}
                className="px-4 h-9 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[10px] shadow transition-all cursor-pointer"
              >
                إرجاع البدلة الآن
              </button>
            )}
            {booking.status === "Active" && (
              <button
                type="button"
                onClick={() => {
                  setCancelDeduction(0);
                  setCancelReason("");
                  setShowCancelModal(true);
                }}
                className="px-4 h-9 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 hover:bg-red-500/20 font-bold text-[10px] transition-all cursor-pointer"
              >
                إلغاء الحجز
              </button>
            )}
          </div>
        </div>
      </div>

      {/* 3. Four Compact KPI Financial Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-card border border-border/80 rounded-2xl p-5 text-right shadow-sm flex flex-col justify-between h-20">
          <span className="text-[10px] text-muted-foreground font-bold">الإجمالي المطلوب</span>
          <span className="text-lg font-black text-foreground font-mono">{booking.totalAmount.toLocaleString("ar-EG-u-nu-latn", { minimumFractionDigits: 0, maximumFractionDigits: 3 })} د.ك</span>
        </div>
        <div className="bg-card border border-border/80 rounded-2xl p-5 text-right shadow-sm flex flex-col justify-between h-20">
          <span className="text-[10px] text-muted-foreground font-bold">المبلغ المدفوع</span>
          <span className="text-lg font-black text-emerald-400 font-mono">{booking.paidAmount.toLocaleString("ar-EG-u-nu-latn", { minimumFractionDigits: 0, maximumFractionDigits: 3 })} د.ك</span>
        </div>
        <div className="bg-card border border-border/80 rounded-2xl p-5 text-right shadow-sm flex flex-col justify-between h-20">
          <span className="text-[10px] text-muted-foreground font-bold">المتبقي للدفع</span>
          {booking.remainingAmount === 0 ? (
            <span className="text-base font-black text-emerald-400">خالص ✓</span>
          ) : (
            <span className="text-lg font-black text-red-400 font-mono">{booking.remainingAmount.toLocaleString("ar-EG-u-nu-latn", { minimumFractionDigits: 0, maximumFractionDigits: 3 })} د.ك</span>
          )}
        </div>
        <div className="bg-card border border-border/80 rounded-2xl p-5 text-right shadow-sm flex flex-col justify-between h-20">
          <span className="text-[10px] text-muted-foreground font-bold">قيمة التأمين</span>
          <span className="text-lg font-black text-primary font-mono">{(booking.depositAmount || 0).toLocaleString("ar-EG-u-nu-latn", { minimumFractionDigits: 0, maximumFractionDigits: 3 })} د.ك</span>
        </div>
      </div>

      {/* 4. Main Content 2-Column Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Right Column: Customer Details & Suit specs */}
        <div className="space-y-6">
          
          {/* Customer Details Card */}
          <div className="bg-card border border-border rounded-3xl p-6 relative overflow-hidden shadow-sm">
            <div className="flex items-center justify-between border-b border-border/40 pb-4 mb-4">
              <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
                <User className="w-5 h-5 text-primary" />
                <span>بيانات الزبون</span>
              </h3>
            </div>
            
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <User className="w-4.5 h-4.5 text-primary shrink-0" />
                <div className="flex flex-col text-right">
                  <span className="text-[10px] text-muted-foreground font-bold">الاسم الكامل</span>
                  <span className="text-sm font-bold text-foreground">{booking.customer.customerName || "عميل غير مسجل"}</span>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <Phone className="w-4.5 h-4.5 text-primary shrink-0" />
                <div className="flex flex-col text-right">
                  <span className="text-[10px] text-muted-foreground font-bold">رقم الهاتف الجوال</span>
                  <span className="text-sm font-black text-foreground font-mono">{booking.customer.phone}</span>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <CreditCard className="w-4.5 h-4.5 text-primary shrink-0" />
                <div className="flex flex-col text-right">
                  <span className="text-[10px] text-muted-foreground font-bold">ضمان البطاقة الشخصية</span>
                  <span className={cn("text-xs font-black", booking.idTaken ? "text-emerald-400" : "text-amber-400")}>
                    {booking.idTaken ? "تم استلام البطاقة الشخصية كضمان" : "لم يتم استلام البطاقة بعد"}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Suit Details Card (With beautiful chips) */}
          <div className="bg-card border border-border rounded-3xl p-6 relative overflow-hidden shadow-sm">
            <div className="flex items-center justify-between border-b border-border/40 pb-4 mb-4">
              <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
                <Shirt className="w-5 h-5 text-primary" />
                <span>تفاصيل البدلة والمواصفات</span>
              </h3>
            </div>

            <div className="flex flex-wrap gap-2.5">
              <div className="flex items-center gap-2 bg-muted/40 border border-border/40 px-3 py-2 rounded-xl text-xs font-bold text-foreground">
                <Layers className="w-4 h-4 text-primary shrink-0" />
                <span>القسم: {booking.partitionName}</span>
              </div>
              
              <div className="flex items-center gap-2 bg-muted/40 border border-border/40 px-3 py-2 rounded-xl text-xs font-bold text-foreground">
                <User className="w-4 h-4 text-primary shrink-0" />
                <span>الشماعة: A-{booking.hangerNumber}</span>
              </div>
              
              <div className="flex items-center gap-2 bg-muted/40 border border-border/40 px-3 py-2 rounded-xl text-xs font-bold text-foreground font-mono">
                <SlidersHorizontal className="w-4 h-4 text-primary shrink-0" />
                <span>مقاس البدلة: {booking.suitSize}</span>
              </div>

              {booking.gravataColor && (
                <div className="flex items-center gap-2 bg-muted/40 border border-border/40 px-3 py-2 rounded-xl text-xs font-bold text-foreground">
                  <Wind className="w-4 h-4 text-primary shrink-0" />
                  <span>الجرافة: {GRAVATA_COLORS[booking.gravataColor as keyof typeof GRAVATA_COLORS]}</span>
                </div>
              )}

              {booking.shirtColor && (
                <div className="flex items-center gap-2 bg-muted/40 border border-border/40 px-3 py-2 rounded-xl text-xs font-bold text-foreground">
                  <Shirt className="w-4 h-4 text-primary shrink-0" />
                  <span>القميص: {SHIRT_COLORS[booking.shirtColor as keyof typeof SHIRT_COLORS]} {booking.shirtSize ? `(مقاس ${SHIRT_SIZES[booking.shirtSize as keyof typeof SHIRT_SIZES]})` : ""}</span>
                </div>
              )}

              {booking.trouserColor && (
                <div className="flex items-center gap-2 bg-muted/40 border border-border/40 px-3 py-2 rounded-xl text-xs font-bold text-foreground">
                  <Shirt className="w-4 h-4 rotate-90 text-primary shrink-0" />
                  <span>البنطلون: {TROUSER_COLORS[booking.trouserColor as keyof typeof TROUSER_COLORS]} {` (خصر: ${booking.trouserWaistSize || "-"}، طول: ${booking.trouserLength || "-"})`}</span>
                </div>
              )}

              {booking.vestColor && (
                <div className="flex items-center gap-2 bg-muted/40 border border-border/40 px-3 py-2 rounded-xl text-xs font-bold text-foreground">
                  <Shirt className="w-4 h-4 text-primary shrink-0" style={{ clipPath: "polygon(10% 0%, 90% 0%, 90% 100%, 10% 100%)" }} />
                  <span>السديري: {VEST_COLORS[booking.vestColor as keyof typeof VEST_COLORS]}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Left Column: Rental Schedule & Billing Summary */}
        <div className="space-y-6">
          
          {/* Rental Timeline Card */}
          <div className="bg-card border border-border rounded-3xl p-6 relative overflow-hidden shadow-sm">
            <div className="flex items-center justify-between border-b border-border/40 pb-4 mb-5">
              <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
                <Calendar className="w-5 h-5 text-primary" />
                <span>جدول الاستلام والإرجاع</span>
              </h3>
            </div>

            {/* Vertical timeline details */}
            <div className="relative pl-1 pr-6 space-y-6 border-r border-primary/20 mr-4 text-right">
              {/* Pickup node */}
              <div className="relative">
                <div className="absolute -right-9 top-0.5 w-6 h-6 rounded-full bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shadow-sm">
                  <ArrowDown className="w-3.5 h-3.5" />
                </div>
                <div className="flex flex-col">
                  <span className="text-[10px] text-emerald-400 font-extrabold mb-1">تاريخ الاستلام (تفصيل المقاسات)</span>
                  <span className="text-sm font-bold text-foreground">
                    {new Date(booking.fromDate).toLocaleDateString("ar-EG-u-nu-latn", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
                  </span>
                  <span className="text-xs text-muted-foreground font-mono mt-0.5">
                    {new Date(booking.fromDate).toLocaleTimeString("ar-EG-u-nu-latn", { hour: "2-digit", minute: "2-digit" })}
                  </span>
                </div>
              </div>

              {/* Return node */}
              <div className="relative pt-2">
                <div className="absolute -right-9 top-2.5 w-6 h-6 rounded-full bg-red-500/20 border border-red-500/30 flex items-center justify-center text-red-400 shadow-sm">
                  <ArrowUp className="w-3.5 h-3.5" />
                </div>
                <div className="flex flex-col">
                  <span className="text-[10px] text-red-400/90 font-extrabold mb-1">تاريخ الإرجاع المتوقع للمحل</span>
                  <span className="text-sm font-bold text-foreground">
                    {new Date(booking.toDate).toLocaleDateString("ar-EG-u-nu-latn", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
                  </span>
                  <span className="text-xs text-muted-foreground font-mono mt-0.5">
                    {new Date(booking.toDate).toLocaleTimeString("ar-EG-u-nu-latn", { hour: "2-digit", minute: "2-digit" })}
                  </span>
                </div>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-border/40 text-xs text-muted-foreground font-bold flex justify-between items-center px-1">
              <span>مدة الإيجار الإجمالية:</span>
              <span className="text-foreground text-xs font-black bg-primary/5 border border-primary/10 px-3.5 py-1 rounded-xl">{booking.rentalDays} أيام</span>
            </div>
          </div>

          {/* Financial Invoice Details Card */}
          <div className="bg-card border border-border rounded-3xl p-6 relative overflow-hidden shadow-sm">
            <div className="flex items-center justify-between border-b border-border/40 pb-4 mb-4">
              <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-primary" />
                <span>التفاصيل المالية والفوترة</span>
              </h3>
            </div>

            <div className="space-y-3.5 text-xs font-bold">
              <div className="flex justify-between items-center py-0.5">
                <span className="text-muted-foreground">الإجمالي المطلوب قبل الخصم</span>
                <span className={cn("font-extrabold text-foreground font-mono", booking.discountPercentage && "line-through text-muted-foreground")}>
                  {booking.totalAmount.toLocaleString("ar-EG-u-nu-latn", { minimumFractionDigits: 0, maximumFractionDigits: 3 })} د.ك
                </span>
              </div>

              {booking.discountPercentage && (
                <>
                  <div className="flex justify-between items-center py-0.5 text-emerald-400">
                    <span>خصم الحجز المطبق ({booking.discountPercentage}%)</span>
                    <span className="font-extrabold font-mono">-{booking.discountAmount.toLocaleString("ar-EG-u-nu-latn", { minimumFractionDigits: 0, maximumFractionDigits: 3 })} د.ك</span>
                  </div>

                  <div className="flex justify-between items-center py-0.5">
                    <span className="text-muted-foreground">الصافي بعد الخصم</span>
                    <span className="font-black text-foreground font-mono">{booking.finalAmount.toLocaleString("ar-EG-u-nu-latn", { minimumFractionDigits: 0, maximumFractionDigits: 3 })} د.ك</span>
                  </div>
                </>
              )}

              <div className="flex justify-between items-center py-0.5">
                <span className="text-muted-foreground">المبلغ المستلم (العربون والمدفوعات)</span>
                <span className="font-extrabold text-foreground font-mono">{booking.paidAmount.toLocaleString("ar-EG-u-nu-latn", { minimumFractionDigits: 0, maximumFractionDigits: 3 })} د.ك</span>
              </div>

              <div className="flex justify-between items-center py-0.5">
                <span className="text-muted-foreground">قيمة العربون / تأمين البدلة</span>
                <span className="font-extrabold text-foreground font-mono">{(booking.depositAmount || 0).toLocaleString("ar-EG-u-nu-latn", { minimumFractionDigits: 0, maximumFractionDigits: 3 })} د.ك</span>
              </div>

              <div className="border-t border-border/40 pt-3 flex justify-between items-center">
                <span className="text-sm font-black text-foreground">المتبقي المطلوب استلامه</span>
                {booking.remainingAmount === 0 ? (
                  <span className="text-sm font-black text-emerald-400">خالص ✓</span>
                ) : (
                  <span className="text-lg font-black text-red-400 font-mono">{booking.remainingAmount.toLocaleString("ar-EG-u-nu-latn", { minimumFractionDigits: 0, maximumFractionDigits: 3 })} د.ك</span>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 5. Notes Card (Bottom Section) */}
      {booking.notes && (
        <div className="bg-card border border-border rounded-3xl p-6 relative overflow-hidden shadow-sm">
          <div className="flex items-center justify-between border-b border-border/40 pb-4 mb-4">
            <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
              <Notebook className="w-5 h-5 text-primary" />
              <span>ملاحظات إضافية وشروط خاصة</span>
            </h3>
          </div>
          <p className="text-xs text-foreground/80 leading-relaxed whitespace-pre-wrap">{booking.notes}</p>
        </div>
      )}

      {/* Cancellation Details Panel */}
      {booking.status === "Cancelled" && (
        <div className="bg-red-500/10 border border-red-500/20 rounded-3xl p-6 space-y-3.5 shadow-inner">
          <div className="flex items-center gap-2 border-b border-red-500/20 pb-2">
            <AlertTriangle className="w-4.5 h-4.5 text-red-400" />
            <h3 className="text-sm font-bold text-red-400">تفاصيل إلغاء الحجز</h3>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs font-semibold">
            <div>
              <span className="text-muted-foreground block mb-0.5">تاريخ الإلغاء</span>
              <span className="text-sm font-bold text-foreground">
                {booking.cancelledAt ? new Date(booking.cancelledAt).toLocaleDateString("ar-EG-u-nu-latn") : "-"}
              </span>
            </div>
            <div>
              <span className="text-muted-foreground block mb-0.5">سبب الإلغاء</span>
              <span className="text-sm font-bold text-foreground">
                {booking.cancellationReason || "لم يذكر"}
              </span>
            </div>
            <div>
              <span className="text-muted-foreground block mb-0.5">الخصم من التأمين</span>
              <span className="text-sm font-black text-red-400 font-mono">
                {(booking.deductionAmount || 0).toLocaleString("ar-EG-u-nu-latn", { minimumFractionDigits: 3 })} د.ك
              </span>
            </div>
            <div>
              <span className="text-muted-foreground block mb-0.5">المسترجع الفعلي</span>
              <span className="text-sm font-black text-emerald-400 font-mono">
                {(booking.refundAmount || 0).toLocaleString("ar-EG-u-nu-latn", { minimumFractionDigits: 3 })} د.ك
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Return & Suit Damage Panel */}
      {booking.status === "Returned" && booking.returnedAt && (
        <div className={cn("border rounded-3xl p-6 space-y-3.5 shadow-sm", booking.isDamaged ? "bg-red-500/10 border-red-500/20" : "bg-emerald-500/10 border-emerald-500/20")}>
          <div className={cn("flex items-center gap-2 border-b pb-2", booking.isDamaged ? "border-red-500/20 text-red-400" : "border-emerald-500/20 text-emerald-400")}>
            {booking.isDamaged ? <ShieldAlert className="w-4.5 h-4.5" /> : <CheckCircle2 className="w-4.5 h-4.5" />}
            <h3 className="text-sm font-bold">تفاصيل إرجاع البدلة</h3>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs font-semibold">
            <div>
              <span className="text-muted-foreground block mb-0.5">تاريخ الإرجاع الفعلي</span>
              <span className="text-sm font-bold text-foreground">
                {new Date(booking.returnedAt).toLocaleDateString("ar-EG-u-nu-latn", { weekday: "long", year: "numeric", month: "short", day: "numeric" })}
              </span>
            </div>
            <div>
              <span className="text-muted-foreground block mb-0.5">حالة البدلة المستلمة</span>
              <span className={cn("text-[10px] font-black px-2.5 py-0.5 rounded-full border shrink-0", booking.isDamaged ? "bg-red-500/10 border-red-500/30 text-red-400" : "bg-emerald-500/10 border-emerald-500/30 text-emerald-400")}>
                {booking.isDamaged ? "يوجد تلف" : "رجعت سليمة"}
              </span>
            </div>
            {booking.isDamaged && (
              <>
                <div>
                  <span className="text-muted-foreground block mb-0.5">غرامة تعويض التلف</span>
                  <span className="text-sm font-black text-red-400 font-mono">{(booking.damageAmount || 0).toLocaleString("ar-EG-u-nu-latn", { minimumFractionDigits: 3 })} د.ك</span>
                </div>
                <div>
                  <span className="text-muted-foreground block mb-0.5">المسترجع الفعلي للزبون</span>
                  <span className="text-sm font-black text-emerald-400 font-mono">{(booking.damageDepositRefund || 0).toLocaleString("ar-EG-u-nu-latn", { minimumFractionDigits: 3 })} د.ك</span>
                </div>
              </>
            )}
          </div>
          {booking.isDamaged && booking.extraDamageOwed && booking.extraDamageOwed > 0 && (
            <div className="bg-red-500/20 border border-red-500/30 rounded-xl p-4 text-xs font-bold text-red-400 mt-2 flex items-center justify-between font-mono">
              <span>المبلغ الإضافي المستحق للدفع من العميل (الفرق):</span>
              <span className="text-sm font-black">{booking.extraDamageOwed.toLocaleString("ar-EG-u-nu-latn", { minimumFractionDigits: 3 })} د.ك</span>
            </div>
          )}
          {booking.isDamaged && booking.damageNotes && (
            <div className="bg-background/40 border border-border/40 rounded-xl p-4 text-xs font-semibold text-foreground/80 mt-2">
              <span className="text-muted-foreground block mb-1">ملاحظات التلف:</span>
              <p className="whitespace-pre-wrap">{booking.damageNotes}</p>
            </div>
          )}
        </div>
      )}

      {/* Cancel Modal */}
      {showCancelModal && (
        <BookingCancelModal
          booking={booking}
          cancelDeduction={cancelDeduction}
          setCancelDeduction={setCancelDeduction}
          cancelReason={cancelReason}
          setCancelReason={setCancelReason}
          onConfirm={handleConfirmCancel}
          onClose={() => setShowCancelModal(false)}
          isPending={cancelBookingM.isPending}
        />
      )}

      {/* Edit Modal */}
      {showEditModal && (
        <BookingEditModal
          editFromDate={editFromDate}
          setEditFromDate={setEditFromDate}
          editToDate={editToDate}
          setEditToDate={setEditToDate}
          editTotalAmount={editTotalAmount}
          setEditTotalAmount={setEditTotalAmount}
          editDepositAmount={editDepositAmount}
          setEditDepositAmount={setEditDepositAmount}
          editHasDiscount={editHasDiscount}
          setEditHasDiscount={setEditHasDiscount}
          editDiscountPercentage={editDiscountPercentage}
          setEditDiscountPercentage={setEditDiscountPercentage}
          editDepositPaid={editDepositPaid}
          setEditDepositPaid={setEditDepositPaid}
          editIdTaken={editIdTaken}
          setEditIdTaken={setEditIdTaken}
          editNotes={editNotes}
          setEditNotes={setEditNotes}
          onConfirm={handleConfirmEdit}
          onClose={() => setShowEditModal(false)}
          isPending={updateM.isPending}
        />
      )}

      {/* Pickup Modal */}
      {showPickupModal && (
        <BookingPickupModal
          booking={booking}
          pickupPaidAmount={pickupPaidAmount}
          setPickupPaidAmount={setPickupPaidAmount}
          pickupIdTaken={pickupIdTaken}
          setPickupIdTaken={setPickupIdTaken}
          onConfirm={handleConfirmPickup}
          onClose={() => setShowPickupModal(false)}
          isPending={pickupM.isPending}
        />
      )}

      {/* Return Modal */}
      {showReturnModal && (
        <BookingReturnModal
          booking={booking}
          returnIsDamaged={returnIsDamaged}
          setReturnIsDamaged={setReturnIsDamaged}
          returnDamageAmount={returnDamageAmount}
          setReturnDamageAmount={setReturnDamageAmount}
          returnDamageNotes={returnDamageNotes}
          setReturnDamageNotes={setReturnDamageNotes}
          onConfirm={handleConfirmReturn}
          onClose={() => setShowReturnModal(false)}
          isPending={returnBookingM.isPending}
        />
      )}
    </div>
  );
}
