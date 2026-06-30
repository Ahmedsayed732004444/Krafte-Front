import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useCreateBooking } from "../hooks/useBookings";
import { BookingForm } from "../components/BookingForm";
import { ArrowRight, Printer, CheckCircle2, ArrowLeft } from "lucide-react";
import type { CreateBookingRequest, BookingResponse } from "../types/bookings";

export default function CreateBookingPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const state = location.state as { partitionId?: string; hangerId?: string } | null;

  const createM = useCreateBooking();

  // Store the newly created booking for receipt printing
  const [createdBooking, setCreatedBooking] = useState<BookingResponse | null>(null);

  const handleSubmit = async (d: any) => {
    const req: CreateBookingRequest = {
      customerPhone: d.customerPhone,
      customerName: d.customerName || undefined,
      partitionId: d.partitionId,
      hangerId: d.hangerId,
      suitSize: d.suitSize,
      eventDate: new Date(d.eventDate).toISOString(),
      fromDate: new Date(d.fromDate).toISOString(),
      toDate: new Date(d.toDate).toISOString(),
      totalAmount: d.totalAmount,
      discountPercentage: d.hasDiscount ? d.discountPercentage : null,
      depositPaid: d.depositPaid,
      depositAmount: d.depositAmount,
      idTaken: d.idTaken,
      gravataColor: d.gravataColor || null,
      shirtColor: d.shirtColor || null,
      shirtSize: d.shirtSize || null,
      trouserColor: d.trouserColor || null,
      trouserSize: d.trouserSize || null,
      trouserWaistSize: d.trouserWaistSize || null,
      trouserLength: d.trouserLength || null,
      vestColor: d.vestColor || null,
      vestSize: d.vestSize || null,
      hasChain: d.hasChain,
      hasBabyFleur: d.hasBabyFleur,
      hasCufflinks: d.hasCufflinks,
      bowTieType: d.bowTieType || null,
      bowTieColor: d.bowTieColor || null,
      notes: d.notes,
    };

    try {
      const result = await createM.mutateAsync(req);
      // Show print confirmation instead of navigating immediately
      setCreatedBooking(result as BookingResponse);
    } catch {
      // Error handled by hook toast
    }
  };

  const handlePrintAndNavigate = () => {
    window.print();
    setTimeout(() => navigate("/bookings"), 500);
  };

  const handleSkipPrint = () => {
    navigate("/bookings");
  };

  // ── After successful creation: show print confirmation screen ──
  if (createdBooking) {
    const b = createdBooking;
    const rentalDays = Math.max(
      Math.round((new Date(b.toDate).getTime() - new Date(b.fromDate).getTime()) / 86400000),
      1
    );

    return (
      <div className="max-w-xl mx-auto px-4 py-10 text-right space-y-6" dir="rtl">
        {/* Success Banner */}
        <div className="flex flex-col items-center text-center gap-3 py-8 bg-emerald-500/10 border border-emerald-500/30 rounded-3xl">
          <div className="w-16 h-16 rounded-full bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center">
            <CheckCircle2 className="w-8 h-8 text-emerald-400" />
          </div>
          <h2 className="text-2xl font-black text-foreground">تم تأكيد الحجز بنجاح!</h2>
          <p className="text-muted-foreground text-sm">
            رقم الحجز: <span className="font-mono font-black text-primary text-base">#{b.code}</span>
          </p>
          <p className="text-muted-foreground text-xs">هل تريد طباعة إيصال الدفع الحراري الآن؟</p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3">
          <button
            onClick={handlePrintAndNavigate}
            className="flex-1 flex items-center justify-center gap-2 px-6 h-12 rounded-xl bg-slate-700 hover:bg-slate-800 text-white font-bold text-sm transition-all cursor-pointer shadow-md"
          >
            <Printer className="w-5 h-5" />
            <span>تأكيد الحجز وطباعة الإيصال</span>
          </button>
          <button
            onClick={handleSkipPrint}
            className="flex-1 flex items-center justify-center gap-2 px-6 h-12 rounded-xl bg-card border border-border hover:bg-accent text-foreground font-bold text-sm transition-all cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>تخطي الطباعة والعودة</span>
          </button>
        </div>

        {/* Hidden Receipt for Printing */}
        <div id="pos-receipt-print-area" className="hidden print:block text-black bg-white" dir="rtl">
          <div className="text-center font-bold text-sm mb-0.5">دار كرافت لتأجير البدل</div>
          <div className="text-center text-[10px] mb-2">العنوان: الفرع الرئيسي | تليفون: 01000000000</div>

          <div className="border-t border-dashed border-black my-1"></div>

          <div className="text-[11px] space-y-0.5">
            <div><strong>رقم الفاتورة:</strong> #{b.code}</div>
            <div><strong>التاريخ:</strong> {new Date().toLocaleString("ar-EG")}</div>
            <div><strong>العميل:</strong> {b.customer.customerName ?? "-"}</div>
            <div><strong>الموبايل:</strong> {b.customer.phone ?? "-"}</div>
          </div>

          <div className="border-t border-dashed border-black my-1"></div>

          <div className="text-[11px] font-bold mb-0.5">تفاصيل الطلب:</div>
          <div className="text-[11px] space-y-0.5">
            <div className="flex justify-between">
              <span>البدلة (المقاس):</span>
              <span>{b.suitSize}</span>
            </div>
            <div className="flex justify-between">
              <span>القسم (البارتشن):</span>
              <span>{b.partitionName ?? "-"}</span>
            </div>
            <div className="flex justify-between">
              <span>رقم الشماعة:</span>
              <span>{b.hangerNumber ?? "-"}</span>
            </div>
            <div className="flex justify-between">
              <span>مدة الإيجار:</span>
              <span>{rentalDays} يوم</span>
            </div>
            <div className="flex justify-between">
              <span>تاريخ الاستلام:</span>
              <span>{new Date(b.fromDate).toLocaleDateString("ar-EG")}</span>
            </div>
            <div className="flex justify-between">
              <span>تاريخ الإرجاع:</span>
              <span>{new Date(b.toDate).toLocaleDateString("ar-EG")}</span>
            </div>
          </div>

          <div className="border-t border-dashed border-black my-1"></div>

          <div className="text-[11px] font-bold mb-0.5">الحساب المالي:</div>
          <div className="text-[11px] space-y-0.5">
            <div className="flex justify-between">
              <span>الإجمالي:</span>
              <span>{b.totalAmount.toFixed(2)} ج.م</span>
            </div>
            {b.discountPercentage !== null && (b.discountPercentage ?? 0) > 0 && (
              <div className="flex justify-between">
                <span>خصم ({b.discountPercentage}%):</span>
                <span>-{b.discountAmount.toFixed(2)} ج.م</span>
              </div>
            )}
            <div className="flex justify-between font-bold border-t border-dotted border-black pt-0.5">
              <span>الصافي المطلوب:</span>
              <span>{b.finalAmount.toFixed(2)} ج.م</span>
            </div>
            <div className="flex justify-between">
              <span>المبلغ المدفوع (مقدم):</span>
              <span>{b.paidAmount.toFixed(2)} ج.م</span>
            </div>
            <div className="flex justify-between">
              <span>مبلغ التأمين (الضمان):</span>
              <span>{(b.depositAmount ?? 0).toFixed(2)} ج.م ({b.depositPaid ? "تم الدفع" : "معلق"})</span>
            </div>
            <div className="flex justify-between font-bold border-t border-black pt-0.5">
              <span>المتبقي المستحق عند الاستلام:</span>
              <span>{b.remainingAmount.toFixed(2)} ج.م</span>
            </div>
          </div>

          <div className="border-t border-dashed border-black my-2"></div>

          <div className="text-[9px] text-center space-y-0.5">
            <div className="font-bold">سياسة الاستلام والإرجاع:</div>
            <div>1. يرجى إرجاع البدلة في الموعد المحدد تجنباً للغرامات اليومية.</div>
            <div>2. التأمين مسترد بالكامل في حال سلامة البدلة وملحقاتها.</div>
            <div className="font-bold pt-1 text-[10px]">شكراً لتعاملكم معنا!</div>
          </div>
        </div>

        <style>{`
          @media print {
            body * { visibility: hidden !important; }
            #pos-receipt-print-area, #pos-receipt-print-area * { visibility: visible !important; }
            #pos-receipt-print-area {
              position: absolute; left: 0; top: 0;
              width: 80mm; padding: 4mm;
              background: white !important; color: black !important;
              font-family: 'Courier New', Courier, monospace;
              direction: rtl; text-align: right;
            }
            @page { size: 80mm auto; margin: 0; }
          }
        `}</style>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto px-4 sm:px-6">
      {/* Header */}
      <div className="flex items-center justify-between gap-4 pb-4">
        <button
          onClick={() => navigate("/bookings")}
          className="w-12 h-12 rounded-full bg-card border border-border/80 flex items-center justify-center text-muted-foreground hover:text-foreground transition-all hover:bg-accent hover:border-primary/30 cursor-pointer shrink-0"
        >
          <ArrowRight className="w-5 h-5" />
        </button>

        <div className="text-center space-y-1 flex-1">
          <h1 className="text-2xl md:text-3xl font-black text-foreground tracking-tight">إنشاء حجز جديد</h1>
          <p className="text-muted-foreground text-xs md:text-sm font-medium">قم بتعبئة نموذج الحجز الخاص بالزبون ومواصفات البدلة</p>
        </div>

        <button
          onClick={() => navigate("/bookings")}
          className="w-12 h-12 rounded-full bg-card border border-border/80 flex items-center justify-center text-muted-foreground hover:text-foreground transition-all hover:bg-accent hover:border-primary/30 cursor-pointer shrink-0"
        >
          <ArrowRight className="w-5 h-5 rotate-180" />
        </button>
      </div>

      {/* Form Container */}
      <div className="bg-card/65 border border-border/80 rounded-3xl p-6 md:p-8 shadow-sm">
        <BookingForm
          loading={createM.isPending}
          defaultPartitionId={state?.partitionId}
          defaultHangerId={state?.hangerId}
          onSubmit={handleSubmit}
        />
      </div>
    </div>
  );
}
