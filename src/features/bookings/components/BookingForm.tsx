import { useState, useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate } from "react-router-dom";
import {
  Check,
  Loader2,
  User,
  Calendar,
  Shirt,
  Phone,
  CreditCard,
  Wind,
  Layers,
} from "lucide-react";
import { useGetPartitions } from "@/features/partitions/hooks/usePartitions";
import { cn } from "@/lib/utils";

export const GRAVATA_COLORS = {
  Red: "أحمر", Blue: "أزرق", Green: "أخضر", Black: "أسود",
  White: "أبيض", Yellow: "أصفر", Purple: "بنفسجي", Orange: "برتقالي"
};

export const SHIRT_COLORS = { White: "أبيض", Black: "أسود" };
export const SHIRT_SIZES = { Size55: "55", Size56: "56", Size57: "57", Size58: "58", Size59: "59", Size60: "60" };
export const TROUSER_COLORS = { Black: "أسود", White: "أبيض", Gray: "رمادي", Navy: "كحلي", Brown: "بني", Beige: "بيج", Burgundy: "نبيذي" };
export const VEST_COLORS = { ...TROUSER_COLORS, Green: "أخضر", Blue: "أزرق" };

export const SUIT_SIZES = [42, 44, 46, 48, 50, 52, 54, 56];

const optionalNumber = z.preprocess(
  (val) => (val === "" || val === null || val === undefined || (typeof val === "number" && isNaN(val))) ? undefined : Number(val),
  z.number().optional()
) as z.ZodType<number | undefined, any, any>;

const nullableNumber = z.preprocess(
  (val) => (val === "" || val === null || val === undefined || (typeof val === "number" && isNaN(val))) ? null : Number(val),
  z.number().nullable().optional()
) as z.ZodType<number | null | undefined, any, any>;

export const bookingFormSchema = z.object({
  customerPhone: z.string().min(1, "رقم هاتف العميل مطلوب"),
  customerName: z.string().optional(),
  partitionId: z.string().min(1, "القسم مطلوب"),
  hangerId: z.string().min(1, "الشماعة مطلوبة"),
  suitSize: z.number({ message: "المقاس مطلوب" }),
  fromDate: z.string().min(1, "تاريخ الاستلام مطلوب"),
  toDate: z.string().min(1, "تاريخ الإرجاع مطلوب"),
  totalAmount: z.number({ message: "المبلغ الإجمالي مطلوب" }).min(0),
  discountAmount: optionalNumber,
  hasDiscount: z.boolean(),
  discountPercentage: nullableNumber,
  depositPaid: z.boolean(),
  depositAmount: optionalNumber,
  idTaken: z.boolean(),
  gravataColor: z.string().optional().nullable(),
  shirtColor: z.string().optional().nullable(),
  shirtSize: z.string().optional().nullable(),
  trouserColor: z.string().optional().nullable(),
  trouserWaistSize: nullableNumber,
  trouserLength: nullableNumber,
  vestColor: z.string().optional().nullable(),
  notes: z.string().optional(),
});

export type BookingFormData = z.infer<typeof bookingFormSchema>;

interface FormProps {
  onSubmit: (data: BookingFormData) => void;
  loading: boolean;
  defaultPartitionId?: string;
  defaultHangerId?: string;
}

export const BookingForm = ({
  onSubmit,
  loading,
  defaultPartitionId,
  defaultHangerId
}: FormProps) => {
  const navigate = useNavigate();
  const { data: partitionsData } = useGetPartitions({ pageSize: 50 });
  const partitions = partitionsData?.items ?? [];

  // Accessory Toggle states ordered by user selection sequence
  const [activeAccessoriesOrder, setActiveAccessoriesOrder] = useState<string[]>([]);
  const hasGravata = activeAccessoriesOrder.includes("gravata");
  const hasShirt = activeAccessoriesOrder.includes("shirt");
  const hasTrouser = activeAccessoriesOrder.includes("trouser");
  const hasVest = activeAccessoriesOrder.includes("vest");

  const toggleAccessory = (name: string) => {
    setActiveAccessoriesOrder((prev) => {
      if (prev.includes(name)) {
        return prev.filter((item) => item !== name);
      } else {
        return [...prev, name];
      }
    });
  };

  const { register, handleSubmit, control, watch, setValue, formState: { errors } } = useForm<BookingFormData>({
    resolver: zodResolver(bookingFormSchema),
    defaultValues: {
      customerPhone: "",
      customerName: "",
      partitionId: defaultPartitionId ?? "",
      hangerId: defaultHangerId ?? "",
      suitSize: 42,
      fromDate: "",
      toDate: "",
      totalAmount: undefined,
      discountAmount: undefined,
      hasDiscount: false,
      discountPercentage: null,
      depositPaid: false,
      depositAmount: undefined,
      idTaken: false,
      gravataColor: "",
      shirtColor: "",
      shirtSize: "",
      trouserColor: "",
      trouserWaistSize: null,
      trouserLength: null,
      vestColor: "",
      notes: "",
    }
  });

  const selectedPartitionId = watch("partitionId");
  const selectedPartition = partitions.find(p => p.id === selectedPartitionId);
  const availableHangers = selectedPartition?.hangers ?? [];

  // Live bill summary calculations
  const watchTotalAmount = watch("totalAmount") || 0;
  const watchDiscountAmount = watch("discountAmount") || 0;
  const watchDepositAmount = watch("depositAmount") || 0;
  const remainingAmount = Math.max(0, watchTotalAmount - watchDiscountAmount - watchDepositAmount);

  // Sync depositPaid checkbox if depositAmount > 0
  useEffect(() => {
    setValue("depositPaid", watchDepositAmount > 0);
  }, [watchDepositAmount, setValue]);

  const onSubmitForm = (data: BookingFormData) => {
    // Clean fields if toggle is inactive
    const payload = { ...data };
    if (!hasGravata) payload.gravataColor = null;
    if (!hasShirt) {
      payload.shirtColor = null;
      payload.shirtSize = null;
    }
    if (!hasTrouser) {
      payload.trouserColor = null;
      payload.trouserWaistSize = null;
      payload.trouserLength = null;
    }
    if (!hasVest) {
      payload.vestColor = null;
    }

    const total = payload.totalAmount || 0;
    const discAmt = payload.discountAmount || 0;
    const hasDisc = discAmt > 0;

    onSubmit({
      ...payload,
      hasDiscount: hasDisc,
      discountPercentage: hasDisc ? Math.round((discAmt / total) * 100) : null
    });
  };

  return (
    <form onSubmit={handleSubmit(onSubmitForm)} className="grid grid-cols-1 lg:grid-cols-3 gap-6 text-right" dir="rtl">
      {/* Right Column: Multi-Card Input Form */}
      <div className="lg:col-span-2 space-y-6">
        
        {/* Card 1: Customer Details */}
        <div className="bg-card border border-border/80 rounded-3xl p-6 space-y-4 shadow-sm">
          <h3 className="text-sm md:text-base font-bold text-foreground flex items-center justify-start gap-2 border-b border-border/40 pb-2.5">
            <User className="w-5 h-5 text-primary" />
            <span>بيانات العميل</span>
          </h3>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-muted-foreground mb-1.5">رقم الهاتف *</label>
              <div className="relative">
                <input
                  {...register("customerPhone")}
                  placeholder="مثال: 965 0000 0000"
                  className="w-full h-12 pr-4 pl-10 rounded-xl bg-background border border-border/85 text-foreground placeholder-muted-foreground outline-none focus:ring-2 focus:ring-primary focus:border-primary text-sm font-semibold transition-all text-right"
                />
                <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/60" />
              </div>
              {errors.customerPhone && <p className="text-red-400 text-xs mt-1">{errors.customerPhone.message}</p>}
            </div>
            
            <div>
              <label className="block text-xs font-semibold text-muted-foreground mb-1.5">اسم العميل *</label>
              <div className="relative">
                <input
                  {...register("customerName")}
                  placeholder="أدخل اسم العميل"
                  className="w-full h-12 pr-4 pl-10 rounded-xl bg-background border border-border/85 text-foreground placeholder-muted-foreground outline-none focus:ring-2 focus:ring-primary focus:border-primary text-sm font-semibold transition-all text-right"
                />
                <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/60" />
              </div>
            </div>
          </div>
        </div>

        {/* Card 2: Suit Location & Compartment */}
        <div className="bg-card border border-border/80 rounded-3xl p-6 space-y-4 shadow-sm">
          <h3 className="text-sm md:text-base font-bold text-foreground flex items-center justify-start gap-2 border-b border-border/40 pb-2.5">
            <Layers className="w-5 h-5 text-primary" />
            <span>موقع البدلة والتفاصيل</span>
          </h3>
          
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-muted-foreground mb-1.5">القسم *</label>
              <select {...register("partitionId")} className="w-full h-12 px-4 rounded-xl bg-background border border-border/85 text-foreground outline-none focus:ring-2 focus:ring-primary focus:border-primary text-sm font-semibold transition-all text-right">
                <option value="">اختر القسم</option>
                {partitions.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
              </select>
              {errors.partitionId && <p className="text-red-400 text-xs mt-1">{errors.partitionId.message}</p>}
            </div>

            <div>
              <label className="block text-xs font-semibold text-muted-foreground mb-1.5">رقم الشماعة *</label>
              <select {...register("hangerId")} disabled={!selectedPartitionId} className="w-full h-12 px-4 rounded-xl bg-background border border-border/85 text-foreground outline-none focus:ring-2 focus:ring-primary focus:border-primary text-sm font-semibold transition-all text-right disabled:opacity-50">
                <option value="">اختر الشماعة</option>
                {availableHangers.map(h => <option key={h.id} value={h.id}>A-{h.number}</option>)}
              </select>
              {errors.hangerId && <p className="text-red-400 text-xs mt-1">{errors.hangerId.message}</p>}
            </div>

            <div>
              <label className="block text-xs font-semibold text-muted-foreground mb-1.5">المقاس *</label>
              <Controller
                control={control}
                name="suitSize"
                render={({ field }) => (
                  <select value={field.value} onChange={e => field.onChange(Number(e.target.value))} className="w-full h-12 px-4 rounded-xl bg-background border border-border/85 text-foreground outline-none focus:ring-2 focus:ring-primary focus:border-primary text-sm font-semibold transition-all text-right">
                    {SUIT_SIZES.map(sz => <option key={sz} value={sz}>مقاس {sz}</option>)}
                  </select>
                )}
              />
            </div>
          </div>
        </div>

        {/* Card 3: Rental Period & Financials */}
        <div className="bg-card border border-border/80 rounded-3xl p-6 space-y-4 shadow-sm">
          <h3 className="text-sm md:text-base font-bold text-foreground flex items-center justify-start gap-2 border-b border-border/40 pb-2.5">
            <Calendar className="w-5 h-5 text-primary" />
            <span>فترة الإيجار والمالية</span>
          </h3>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-muted-foreground mb-1.5">تاريخ الاستلام *</label>
              <input
                type="date"
                {...register("fromDate")}
                onFocus={(e) => (e.target as HTMLInputElement).showPicker?.()}
                onClick={(e) => (e.target as HTMLInputElement).showPicker?.()}
                className="w-full h-12 px-4 rounded-xl bg-background border border-border/85 text-foreground outline-none focus:ring-2 focus:ring-primary text-sm font-semibold transition-all text-right cursor-pointer"
              />
              {errors.fromDate && <p className="text-red-400 text-xs mt-1">{errors.fromDate.message}</p>}
            </div>
            <div>
              <label className="block text-xs font-semibold text-muted-foreground mb-1.5">تاريخ الإرجاع *</label>
              <input
                type="date"
                {...register("toDate")}
                onFocus={(e) => (e.target as HTMLInputElement).showPicker?.()}
                onClick={(e) => (e.target as HTMLInputElement).showPicker?.()}
                className="w-full h-12 px-4 rounded-xl bg-background border border-border/85 text-foreground outline-none focus:ring-2 focus:ring-primary text-sm font-semibold transition-all text-right cursor-pointer"
              />
              {errors.toDate && <p className="text-red-400 text-xs mt-1">{errors.toDate.message}</p>}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
            <div>
              <label className="block text-xs font-semibold text-muted-foreground mb-1.5">الإجمالي المطلوب</label>
              <input
                type="number"
                step="0.001"
                {...register("totalAmount", { valueAsNumber: true })}
                onFocus={(e) => e.target.select()}
                placeholder="0.000"
                className="w-full h-12 px-4 rounded-xl bg-background border border-border/85 text-foreground outline-none focus:ring-2 focus:ring-primary text-sm font-bold transition-all text-right font-mono"
              />
              {errors.totalAmount && <p className="text-red-400 text-xs mt-1">{errors.totalAmount.message}</p>}
            </div>
            <div>
              <label className="block text-xs font-semibold text-muted-foreground mb-1.5">العربون المدفوع</label>
              <input
                type="number"
                step="0.001"
                {...register("depositAmount", { valueAsNumber: true })}
                onFocus={(e) => e.target.select()}
                placeholder="0.000"
                className="w-full h-12 px-4 rounded-xl bg-background border border-border/85 text-foreground outline-none focus:ring-2 focus:ring-primary text-sm font-bold transition-all text-right font-mono"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-muted-foreground mb-1.5">الخصم</label>
              <input
                type="number"
                step="0.001"
                {...register("discountAmount", { valueAsNumber: true })}
                onFocus={(e) => e.target.select()}
                placeholder="0.000"
                className="w-full h-12 px-4 rounded-xl bg-background border border-border/85 text-foreground outline-none focus:ring-2 focus:ring-primary text-sm font-bold transition-all text-right font-mono"
              />
            </div>
          </div>

          <div className="flex items-center gap-2.5 py-1">
            <label className="flex items-center gap-2.5 cursor-pointer select-none text-xs font-bold text-muted-foreground hover:text-foreground transition-colors">
              <input type="checkbox" {...register("idTaken")} className="w-4 h-4 rounded border-border bg-background text-primary focus:ring-primary focus:ring-offset-background" />
              <span>أخذ البطاقة الشخصية للعميل كضمان؟</span>
            </label>
          </div>
        </div>

        {/* Card 4: Accessories Attached */}
        <div className="bg-card border border-border/80 rounded-3xl p-6 space-y-4 shadow-sm">
          <h3 className="text-sm md:text-base font-bold text-foreground flex items-center justify-start gap-2 border-b border-border/40 pb-2.5">
            <Shirt className="w-5 h-5 text-primary" />
            <span>الإكسسوارات المرفقة</span>
          </h3>
          
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {/* Cravat toggle */}
            <button
              type="button"
              onClick={() => toggleAccessory("gravata")}
              className={cn(
                "h-24 rounded-2xl border flex flex-col items-center justify-center gap-2.5 transition-all cursor-pointer font-bold text-xs select-none",
                hasGravata
                  ? "border-primary bg-primary/5 text-primary shadow-sm"
                  : "border-border bg-background text-muted-foreground hover:bg-accent/40"
              )}
            >
              <Wind className="w-6 h-6" />
              <span>جرافاتا</span>
            </button>

            {/* Shirt toggle */}
            <button
              type="button"
              onClick={() => toggleAccessory("shirt")}
              className={cn(
                "h-24 rounded-2xl border flex flex-col items-center justify-center gap-2.5 transition-all cursor-pointer font-bold text-xs select-none",
                hasShirt
                  ? "border-primary bg-primary/5 text-primary shadow-sm"
                  : "border-border bg-background text-muted-foreground hover:bg-accent/40"
              )}
            >
              <Shirt className="w-6 h-6" />
              <span>قميص</span>
            </button>

            {/* Trouser toggle */}
            <button
              type="button"
              onClick={() => toggleAccessory("trouser")}
              className={cn(
                "h-24 rounded-2xl border flex flex-col items-center justify-center gap-2.5 transition-all cursor-pointer font-bold text-xs select-none",
                hasTrouser
                  ? "border-primary bg-primary/5 text-primary shadow-sm"
                  : "border-border bg-background text-muted-foreground hover:bg-accent/40"
              )}
            >
              <Shirt className="w-6 h-6 rotate-90" />
              <span>بنطلون</span>
            </button>

            {/* Vest toggle */}
            <button
              type="button"
              onClick={() => toggleAccessory("vest")}
              className={cn(
                "h-24 rounded-2xl border flex flex-col items-center justify-center gap-2.5 transition-all cursor-pointer font-bold text-xs select-none",
                hasVest
                  ? "border-primary bg-primary/5 text-primary shadow-sm"
                  : "border-border bg-background text-muted-foreground hover:bg-accent/40"
              )}
            >
              <Shirt className="w-6 h-6" style={{ clipPath: "polygon(10% 0%, 90% 0%, 90% 100%, 10% 100%)" }} />
              <span>سديري</span>
            </button>
          </div>

          {/* Sub options grouped by accessory - dynamically ordered */}
          {activeAccessoriesOrder.length > 0 && (
            <div className="pt-4 border-t border-border/30 space-y-4 animate-in fade-in duration-200">
              {activeAccessoriesOrder.map((name) => {
                if (name === "gravata") {
                  return (
                    <div key="gravata" className="bg-muted/10 border border-border/50 rounded-2xl p-4 space-y-3">
                      <div className="flex items-center gap-2 text-xs font-bold text-primary">
                        <Wind className="w-4 h-4 text-primary" />
                        <span>خصائص الجرافاتا</span>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-[10px] font-semibold text-muted-foreground mb-1">لون الكرافتة / الجرافة</label>
                          <select {...register("gravataColor")} className="w-full h-11 px-4 rounded-xl bg-background border border-border/85 text-foreground outline-none focus:ring-2 focus:ring-primary text-xs font-semibold text-right">
                            <option value="">لا يوجد</option>
                            {Object.entries(GRAVATA_COLORS).map(([val, label]) => <option key={val} value={val}>{label}</option>)}
                          </select>
                        </div>
                      </div>
                    </div>
                  );
                }

                if (name === "shirt") {
                  return (
                    <div key="shirt" className="bg-muted/10 border border-border/50 rounded-2xl p-4 space-y-3">
                      <div className="flex items-center gap-2 text-xs font-bold text-primary">
                        <Shirt className="w-4 h-4 text-primary" />
                        <span>خصائص القميص</span>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-[10px] font-semibold text-muted-foreground mb-1">لون القميص</label>
                          <select {...register("shirtColor")} className="w-full h-11 px-4 rounded-xl bg-background border border-border/85 text-foreground outline-none focus:ring-2 focus:ring-primary text-xs font-semibold text-right">
                            <option value="">لا يوجد</option>
                            {Object.entries(SHIRT_COLORS).map(([val, label]) => <option key={val} value={val}>{label}</option>)}
                          </select>
                        </div>
                        <div>
                          <label className="block text-[10px] font-semibold text-muted-foreground mb-1">مقاس القميص</label>
                          <select {...register("shirtSize")} className="w-full h-11 px-4 rounded-xl bg-background border border-border/85 text-foreground outline-none focus:ring-2 focus:ring-primary text-xs font-semibold text-right">
                            <option value="">لا يوجد</option>
                            {Object.entries(SHIRT_SIZES).map(([val, label]) => <option key={val} value={val}>مقاس {label}</option>)}
                          </select>
                        </div>
                      </div>
                    </div>
                  );
                }

                if (name === "trouser") {
                  return (
                    <div key="trouser" className="bg-muted/10 border border-border/50 rounded-2xl p-4 space-y-3">
                      <div className="flex items-center gap-2 text-xs font-bold text-primary">
                        <Shirt className="w-4 h-4 rotate-90 text-primary" />
                        <span>خصائص البنطلون</span>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div>
                          <label className="block text-[10px] font-semibold text-muted-foreground mb-1">لون البنطلون</label>
                          <select {...register("trouserColor")} className="w-full h-11 px-4 rounded-xl bg-background border border-border/85 text-foreground outline-none focus:ring-2 focus:ring-primary text-xs font-semibold text-right">
                            <option value="">لا يوجد</option>
                            {Object.entries(TROUSER_COLORS).map(([val, label]) => <option key={val} value={val}>{label}</option>)}
                          </select>
                        </div>
                        <div>
                          <label className="block text-[10px] font-semibold text-muted-foreground mb-1">خصر البنطلون (Waist)</label>
                          <input
                            type="number"
                            {...register("trouserWaistSize", { valueAsNumber: true })}
                            onFocus={(e) => e.target.select()}
                            placeholder="34"
                            className="w-full h-11 px-3 rounded-xl bg-background border border-border/85 text-foreground outline-none focus:ring-2 focus:ring-primary text-xs font-bold text-center"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] font-semibold text-muted-foreground mb-1">طول البنطلون (Length)</label>
                          <input
                            type="number"
                            {...register("trouserLength", { valueAsNumber: true })}
                            onFocus={(e) => e.target.select()}
                            placeholder="30"
                            className="w-full h-11 px-3 rounded-xl bg-background border border-border/85 text-foreground outline-none focus:ring-2 focus:ring-primary text-xs font-bold text-center"
                          />
                        </div>
                      </div>
                    </div>
                  );
                }

                if (name === "vest") {
                  return (
                    <div key="vest" className="bg-muted/10 border border-border/50 rounded-2xl p-4 space-y-3">
                      <div className="flex items-center gap-2 text-xs font-bold text-primary">
                        <Shirt className="w-4 h-4 text-primary" style={{ clipPath: "polygon(10% 0%, 90% 0%, 90% 100%, 10% 100%)" }} />
                        <span>خصائص السديري (Vest)</span>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-[10px] font-semibold text-muted-foreground mb-1">لون السديري / Vest</label>
                          <select {...register("vestColor")} className="w-full h-11 px-4 rounded-xl bg-background border border-border/85 text-foreground outline-none focus:ring-2 focus:ring-primary text-xs font-semibold text-right">
                            <option value="">لا يوجد</option>
                            {Object.entries(VEST_COLORS).map(([val, label]) => <option key={val} value={val}>{label}</option>)}
                          </select>
                        </div>
                      </div>
                    </div>
                  );
                }

                return null;
              })}
            </div>
          )}
        </div>

        {/* Card 5: Additional Notes */}
        <div className="bg-card border border-border/80 rounded-3xl p-6 space-y-2 shadow-sm">
          <label className="block text-xs font-bold text-foreground">ملاحظات إضافية</label>
          <textarea {...register("notes")} placeholder="أضف أي تفاصيل أو شروط خاصة بالحجز هنا..." rows={3} className="w-full p-4 rounded-xl bg-background border border-border/85 text-foreground placeholder-muted-foreground outline-none focus:ring-2 focus:ring-primary text-sm transition-all resize-none text-right" />
        </div>
      </div>

      {/* Left Column: Bill Summary Card */}
      <div className="space-y-6">
        <div className="bg-card border border-border/80 rounded-3xl p-6 space-y-6 sticky top-6 shadow-sm">
          <h3 className="text-sm md:text-base font-black text-foreground flex items-center justify-start gap-2 border-b border-border/40 pb-3">
            <CreditCard className="w-5 h-5 text-primary" />
            <span>ملخص الفاتورة</span>
          </h3>
          
          <div className="space-y-4 text-xs font-bold">
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">الإجمالي قبل الخصم</span>
              <span className="font-extrabold text-foreground font-mono">{watchTotalAmount.toFixed(3)} د.ك</span>
            </div>
            
            {watchDiscountAmount > 0 && (
              <div className="flex justify-between items-center text-red-400">
                <span>الخصم المطبق</span>
                <span className="font-mono">- {watchDiscountAmount.toFixed(3)} د.ك</span>
              </div>
            )}
            
            {watchDepositAmount > 0 && (
              <div className="flex justify-between items-center text-emerald-400">
                <span>العربون المدفوع</span>
                <span className="font-mono">- {watchDepositAmount.toFixed(3)} د.ك</span>
              </div>
            )}
            
            <div className="bg-primary/5 border border-primary/10 rounded-2xl p-5 flex flex-col items-center justify-center text-center space-y-1 mt-6">
              <span className="text-[10px] text-primary font-black">المبلغ المتبقي للدفع</span>
              <span className="text-3xl font-black text-primary font-mono tracking-tight">
                {remainingAmount.toFixed(3)}
              </span>
              <span className="text-[10px] text-muted-foreground font-bold">د.ك</span>
            </div>
          </div>

          <div className="space-y-2 pt-4">
            <button
              type="submit"
              disabled={loading}
              className="w-full h-12 rounded-xl bg-primary hover:bg-primary/95 text-primary-foreground font-bold text-sm flex items-center justify-center gap-2 transition-all shadow-md shadow-primary/15 cursor-pointer disabled:opacity-50"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
              <span>تأكيد وحفظ الحجز</span>
            </button>
            <button
              type="button"
              onClick={() => navigate("/bookings")}
              className="w-full h-11 rounded-xl bg-accent/40 border border-border text-foreground hover:bg-accent font-semibold text-xs transition-all cursor-pointer"
            >
              <span>إلغاء</span>
            </button>
          </div>
        </div>
      </div>
    </form>
  );
};
