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

export const ACCESSORY_COLORS = {
  Black: "أسود",
  White: "أبيض",
  Gray: "رمادي",
  LightGray: "رمادي فاتح",
  Navy: "كحلي",
  RoyalBlue: "أزرق ملكي",
  SkyBlue: "أزرق سماوي",
  Blue: "أزرق",
  Red: "أحمر",
  Burgundy: "نبيذي",
  Wine: "خمري",
  Rose: "وردي",
  Pink: "بمبي",
  Green: "أخضر",
  DarkGreen: "أخضر غامق",
  Olive: "زيتوني",
  Mint: "نعناعي",
  Brown: "بني",
  Beige: "بيج",
  Camel: "هافان / جملي",
  Champagne: "شامبين",
  Ivory: "أوف وايت",
  Gold: "ذهبي",
  Silver: "فضي",
  Purple: "بنفسجي",
  Lavender: "لافندر",
  Orange: "برتقالي",
  Yellow: "أصفر",
  Turquoise: "تركواز"
};

export const SHIRT_SIZES = {
  Size38: "38",
  Size40: "40",
  Size42: "42",
  Size44: "44",
  Size46: "46",
  Size48: "48",
  Size50: "50",
  Size52: "52",
  Size54: "54",
  Size56: "56"
};

export const ACCESSORY_SIZES = [42, 44, 46, 48, 50, 52, 54, 56, 58, 60, 62, 64];

export const BOW_TIE_TYPES = {
  Classic: "ببيون عادي (ربط باليد)",
  PreTied: "ببيون جاهز (على مطاط/كليب)"
};

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
  eventDate: z.string().min(1, "تاريخ المناسبة مطلوب"),
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
  trouserSize: nullableNumber,
  trouserWaistSize: nullableNumber,
  trouserLength: nullableNumber,
  vestColor: z.string().optional().nullable(),
  vestSize: nullableNumber,
  hasChain: z.boolean(),
  hasBabyFleur: z.boolean(),
  hasCufflinks: z.boolean(),
  bowTieType: z.string().optional().nullable(),
  bowTieColor: z.string().optional().nullable(),
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
  const [activeTab, setActiveTab] = useState<string | null>(null);

  const hasGravata = activeAccessoriesOrder.includes("gravata");
  const hasShirt = activeAccessoriesOrder.includes("shirt");
  const hasTrouser = activeAccessoriesOrder.includes("trouser");
  const hasVest = activeAccessoriesOrder.includes("vest");
  const hasChain = activeAccessoriesOrder.includes("chain");
  const hasBabyFleur = activeAccessoriesOrder.includes("babyFleur");
  const hasCufflinks = activeAccessoriesOrder.includes("cufflinks");
  const hasBowTie = activeAccessoriesOrder.includes("bowTie");

  const toggleAccessory = (name: string) => {
    setActiveAccessoriesOrder((prev) => {
      const isSelected = prev.includes(name);
      let updated: string[];
      if (isSelected) {
        updated = prev.filter((item) => item !== name);
        if (activeTab === name) {
          const remaining = updated.filter(item => ["gravata", "shirt", "trouser", "vest", "bowTie"].includes(item));
          setActiveTab(remaining.length > 0 ? remaining[remaining.length - 1] : null);
        }
      } else {
        updated = [...prev, name];
        if (["gravata", "shirt", "trouser", "vest", "bowTie"].includes(name)) {
          setActiveTab(name);
        }
      }
      return updated;
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
      eventDate: "",
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
      trouserSize: null,
      trouserWaistSize: null,
      trouserLength: null,
      vestColor: "",
      vestSize: null,
      hasChain: false,
      hasBabyFleur: false,
      hasCufflinks: false,
      bowTieType: "",
      bowTieColor: "",
      notes: "",
    }
  });

  const selectedPartitionId = watch("partitionId");
  const selectedHangerId = watch("hangerId");
  const selectedPartition = partitions.find(p => p.id === selectedPartitionId);
  const availableHangers = selectedPartition?.hangers ?? [];
  const selectedHanger = availableHangers.find(h => h.id === selectedHangerId);

  // Auto-fill suitSize when hanger is selected
  useEffect(() => {
    if (selectedHanger?.suitSize != null) {
      setValue("suitSize", selectedHanger.suitSize, { shouldValidate: true });
    }
  }, [selectedHanger, setValue]);

  // Live bill summary calculations
  const watchTotalAmount = watch("totalAmount") || 0;
  const watchDiscountAmount = watch("discountAmount") || 0;
  const watchDepositAmount = watch("depositAmount") || 0;
  const remainingAmount = Math.max(0, watchTotalAmount - watchDiscountAmount - watchDepositAmount);

  // Sync depositPaid checkbox if depositAmount > 0
  useEffect(() => {
    setValue("depositPaid", watchDepositAmount > 0);
  }, [watchDepositAmount, setValue]);

  const watchEventDate = watch("eventDate");

  // Autofill fromDate and toDate based on eventDate
  useEffect(() => {
    if (watchEventDate) {
      const parts = watchEventDate.split("-");
      if (parts.length === 3) {
        const year = Number(parts[0]);
        const month = Number(parts[1]) - 1;
        const day = Number(parts[2]);

        const eventDateObj = new Date(year, month, day);
        if (!isNaN(eventDateObj.getTime())) {
          // 1 day before
          const fromDateObj = new Date(eventDateObj);
          fromDateObj.setDate(eventDateObj.getDate() - 1);
          const fromY = fromDateObj.getFullYear();
          const fromM = String(fromDateObj.getMonth() + 1).padStart(2, "0");
          const fromD = String(fromDateObj.getDate()).padStart(2, "0");
          const fromDateStr = `${fromY}-${fromM}-${fromD}`;

          // 1 day after
          const toDateObj = new Date(eventDateObj);
          toDateObj.setDate(eventDateObj.getDate() + 1);
          const toY = toDateObj.getFullYear();
          const toM = String(toDateObj.getMonth() + 1).padStart(2, "0");
          const toD = String(toDateObj.getDate()).padStart(2, "0");
          const toDateStr = `${toY}-${toM}-${toD}`;

          setValue("fromDate", fromDateStr, { shouldValidate: true });
          setValue("toDate", toDateStr, { shouldValidate: true });
        }
      }
    }
  }, [watchEventDate, setValue]);

  const [syncSizesWithSuit, setSyncSizesWithSuit] = useState(false);
  const [syncVestAndTrouserColor, setSyncVestAndTrouserColor] = useState(false);

  // Watch all form fields to persist draft state
  const formValues = watch();

  // 1. Load draft booking on mount (runs once after first render)
  useEffect(() => {
    const saved = sessionStorage.getItem("draft_booking");
    if (saved) {
      try {
        const data = JSON.parse(saved);
        if (data.activeAccessoriesOrder) setActiveAccessoriesOrder(data.activeAccessoriesOrder);
        if (data.activeTab) setActiveTab(data.activeTab);
        if (data.syncSizesWithSuit !== undefined) setSyncSizesWithSuit(data.syncSizesWithSuit);
        if (data.syncVestAndTrouserColor !== undefined) setSyncVestAndTrouserColor(data.syncVestAndTrouserColor);
        if (data.values) {
          Object.entries(data.values).forEach(([key, val]) => {
            setValue(key as any, val, { shouldValidate: true });
          });
        }
      } catch (e) {
        console.error("Failed to restore draft booking", e);
      }
    }
  }, [setValue]);

  // 2. Persist draft booking on changes
  useEffect(() => {
    sessionStorage.setItem("draft_booking", JSON.stringify({
      activeAccessoriesOrder,
      activeTab,
      syncSizesWithSuit,
      syncVestAndTrouserColor,
      values: formValues
    }));
  }, [formValues, activeAccessoriesOrder, activeTab, syncSizesWithSuit, syncVestAndTrouserColor]);

  const watchSuitSize = watch("suitSize");
  const watchTrouserColor = watch("trouserColor");
  const watchVestColor = watch("vestColor");

  // Sync trouser and vest size with suit size
  useEffect(() => {
    if (syncSizesWithSuit && watchSuitSize) {
      setValue("trouserSize", watchSuitSize, { shouldValidate: true });
      setValue("vestSize", watchSuitSize, { shouldValidate: true });
    }
  }, [syncSizesWithSuit, watchSuitSize, setValue]);

  // Sync vest and trouser color
  useEffect(() => {
    if (syncVestAndTrouserColor) {
      if (watchTrouserColor !== watchVestColor) {
        setValue("vestColor", watchTrouserColor || "", { shouldValidate: true });
      }
    }
  }, [syncVestAndTrouserColor, watchTrouserColor, watchVestColor, setValue]);

  useEffect(() => {
    if (syncVestAndTrouserColor) {
      if (watchVestColor !== watchTrouserColor) {
        setValue("trouserColor", watchVestColor || "", { shouldValidate: true });
      }
    }
  }, [syncVestAndTrouserColor, watchVestColor, watchTrouserColor, setValue]);

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
      payload.trouserSize = null;
      payload.trouserWaistSize = null;
      payload.trouserLength = null;
    }
    if (!hasVest) {
      payload.vestColor = null;
      payload.vestSize = null;
    }
    
    // Override boolean flags from state directly
    payload.hasChain = hasChain;
    payload.hasBabyFleur = hasBabyFleur;
    payload.hasCufflinks = hasCufflinks;
    
    if (!hasBowTie) {
      payload.bowTieType = null;
      payload.bowTieColor = null;
    }

    const total = payload.totalAmount || 0;
    const discAmt = payload.discountAmount || 0;
    const hasDisc = discAmt > 0;

    onSubmit({
      ...payload,
      hasDiscount: hasDisc,
      discountPercentage: hasDisc ? Math.round((discAmt / total) * 100) : null
    });
    sessionStorage.removeItem("draft_booking");
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
                {availableHangers.map(h => <option key={h.id} value={h.id}>{selectedPartition?.name}-{h.number} (مقاس {h.suitSize})</option>)}
              </select>
              {errors.hangerId && <p className="text-red-400 text-xs mt-1">{errors.hangerId.message}</p>}
            </div>

            <div>
              <label className="block text-xs font-semibold text-muted-foreground mb-1.5">مقاس البدلة *</label>
              <Controller
                control={control}
                name="suitSize"
                render={({ field }) => (
                  <select 
                    value={field.value || ""} 
                    onChange={e => field.onChange(Number(e.target.value))} 
                    className="w-full h-12 px-4 rounded-xl bg-background border border-border/85 text-foreground outline-none focus:ring-2 focus:ring-primary focus:border-primary text-sm font-semibold transition-all text-right"
                  >
                    <option value="" disabled>اختر المقاس...</option>
                    {ACCESSORY_SIZES.map(sz => (
                      <option key={sz} value={sz}>
                        مقاس {sz} {selectedHanger?.suitSize === sz ? "(المقاس الافتراضي للشماعة)" : ""}
                      </option>
                    ))}
                  </select>
                )}
              />
              {errors.suitSize && <p className="text-red-400 text-xs mt-1">{errors.suitSize.message}</p>}
            </div>
          </div>
        </div>



        {/* Card 4: Accessories Attached */}
        <div className="bg-card border border-border/80 rounded-3xl p-6 space-y-4 shadow-sm">
          <h3 className="text-sm md:text-base font-bold text-foreground flex items-center justify-start gap-2 border-b border-border/40 pb-2.5">
            <Shirt className="w-5 h-5 text-primary" />
            <span>الإكسسوارات المرفقة</span>
          </h3>

          <div className="flex flex-wrap gap-4 items-center bg-muted/40 border border-border/40 p-3 rounded-2xl text-[10px] sm:text-xs font-bold text-muted-foreground mb-4">
            <span className="text-foreground shrink-0">تسهيل الإدخال السريع:</span>
            <label className="flex items-center gap-2 cursor-pointer select-none hover:text-foreground transition-colors">
              <input 
                type="checkbox" 
                checked={syncSizesWithSuit}
                onChange={e => setSyncSizesWithSuit(e.target.checked)}
                className="w-4 h-4 rounded border-border bg-background text-primary focus:ring-primary focus:ring-offset-background cursor-pointer" 
              />
              <span>البنطلون والصديرية نفس مقاس البدلة (مقاس {watchSuitSize})</span>
            </label>
            <div className="hidden sm:block w-px h-4 bg-border/80" />
            <label className="flex items-center gap-2 cursor-pointer select-none hover:text-foreground transition-colors">
              <input 
                type="checkbox" 
                checked={syncVestAndTrouserColor}
                onChange={e => setSyncVestAndTrouserColor(e.target.checked)}
                className="w-4 h-4 rounded border-border bg-background text-primary focus:ring-primary focus:ring-offset-background cursor-pointer" 
              />
              <span>الصديرية والبنطلون نفس اللون</span>
            </label>
          </div>

          <div className="space-y-4">
            {/* Group 1: Main Accessories (4 buttons) */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {/* Cravat toggle */}
              <button
                type="button"
                onClick={() => {
                  const isSelected = activeAccessoriesOrder.includes("gravata");
                  if (isSelected && activeTab !== "gravata") {
                    setActiveTab("gravata");
                  } else {
                    toggleAccessory("gravata");
                  }
                }}
                className={cn(
                  "h-24 rounded-2xl border flex flex-col items-center justify-center gap-2.5 transition-all cursor-pointer font-bold text-xs select-none relative",
                  activeTab === "gravata"
                    ? "border-primary bg-primary/5 text-primary shadow-sm ring-2 ring-primary/20"
                    : hasGravata
                      ? "border-emerald-500/40 bg-emerald-500/5 text-emerald-600"
                      : "border-border bg-background text-muted-foreground hover:bg-accent/40"
                )}
              >
                {hasGravata && (
                  <span className="absolute top-2 right-2 w-2.5 h-2.5 rounded-full bg-emerald-500" />
                )}
                {activeTab === "gravata" && (
                  <span className="absolute top-2 left-2 text-[8px] bg-primary/25 px-1.5 py-0.5 rounded-md font-black">تعديل</span>
                )}
                <Wind className="w-6 h-6" />
                <span>جرافاتا</span>
              </button>

              {/* Shirt toggle */}
              <button
                type="button"
                onClick={() => {
                  const isSelected = activeAccessoriesOrder.includes("shirt");
                  if (isSelected && activeTab !== "shirt") {
                    setActiveTab("shirt");
                  } else {
                    toggleAccessory("shirt");
                  }
                }}
                className={cn(
                  "h-24 rounded-2xl border flex flex-col items-center justify-center gap-2.5 transition-all cursor-pointer font-bold text-xs select-none relative",
                  activeTab === "shirt"
                    ? "border-primary bg-primary/5 text-primary shadow-sm ring-2 ring-primary/20"
                    : hasShirt
                      ? "border-emerald-500/40 bg-emerald-500/5 text-emerald-600"
                      : "border-border bg-background text-muted-foreground hover:bg-accent/40"
                )}
              >
                {hasShirt && (
                  <span className="absolute top-2 right-2 w-2.5 h-2.5 rounded-full bg-emerald-500" />
                )}
                {activeTab === "shirt" && (
                  <span className="absolute top-2 left-2 text-[8px] bg-primary/25 px-1.5 py-0.5 rounded-md font-black">تعديل</span>
                )}
                <Shirt className="w-6 h-6" />
                <span>قميص</span>
              </button>

              {/* Trouser toggle */}
              <button
                type="button"
                onClick={() => {
                  const isSelected = activeAccessoriesOrder.includes("trouser");
                  if (isSelected && activeTab !== "trouser") {
                    setActiveTab("trouser");
                  } else {
                    toggleAccessory("trouser");
                  }
                }}
                className={cn(
                  "h-24 rounded-2xl border flex flex-col items-center justify-center gap-2.5 transition-all cursor-pointer font-bold text-xs select-none relative",
                  activeTab === "trouser"
                    ? "border-primary bg-primary/5 text-primary shadow-sm ring-2 ring-primary/20"
                    : hasTrouser
                      ? "border-emerald-500/40 bg-emerald-500/5 text-emerald-600"
                      : "border-border bg-background text-muted-foreground hover:bg-accent/40"
                )}
              >
                {hasTrouser && (
                  <span className="absolute top-2 right-2 w-2.5 h-2.5 rounded-full bg-emerald-500" />
                )}
                {activeTab === "trouser" && (
                  <span className="absolute top-2 left-2 text-[8px] bg-primary/25 px-1.5 py-0.5 rounded-md font-black">تعديل</span>
                )}
                <Shirt className="w-6 h-6 rotate-90" />
                <span>بنطلون</span>
              </button>

              {/* Vest toggle */}
              <button
                type="button"
                onClick={() => {
                  const isSelected = activeAccessoriesOrder.includes("vest");
                  if (isSelected && activeTab !== "vest") {
                    setActiveTab("vest");
                  } else {
                    toggleAccessory("vest");
                  }
                }}
                className={cn(
                  "h-24 rounded-2xl border flex flex-col items-center justify-center gap-2.5 transition-all cursor-pointer font-bold text-xs select-none relative",
                  activeTab === "vest"
                    ? "border-primary bg-primary/5 text-primary shadow-sm ring-2 ring-primary/20"
                    : hasVest
                      ? "border-emerald-500/40 bg-emerald-500/5 text-emerald-600"
                      : "border-border bg-background text-muted-foreground hover:bg-accent/40"
                )}
              >
                {hasVest && (
                  <span className="absolute top-2 right-2 w-2.5 h-2.5 rounded-full bg-emerald-500" />
                )}
                {activeTab === "vest" && (
                  <span className="absolute top-2 left-2 text-[8px] bg-primary/25 px-1.5 py-0.5 rounded-md font-black">تعديل</span>
                )}
                <Shirt className="w-6 h-6" style={{ clipPath: "polygon(10% 0%, 90% 0%, 90% 100%, 10% 100%)" }} />
                <span>سديري</span>
              </button>
            </div>

            {/* Sub options for Group 1 (Main Accessories) */}
            {activeAccessoriesOrder.length > 0 && ["gravata", "shirt", "trouser", "vest"].includes(activeTab || "") && (
              <div className="pt-2 space-y-4 animate-in fade-in duration-200">
                {[activeTab].filter((name): name is string => !!name && ["gravata", "shirt", "trouser", "vest"].includes(name) && activeAccessoriesOrder.includes(name)).map((name) => {
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
                              {Object.entries(ACCESSORY_COLORS).map(([val, label]) => <option key={val} value={val}>{label}</option>)}
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
                              {Object.entries(ACCESSORY_COLORS).map(([val, label]) => <option key={val} value={val}>{label}</option>)}
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
                        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                          <div>
                            <label className="block text-[10px] font-semibold text-muted-foreground mb-1">لون البنطلون</label>
                            <select {...register("trouserColor")} className="w-full h-11 px-4 rounded-xl bg-background border border-border/85 text-foreground outline-none focus:ring-2 focus:ring-primary text-xs font-semibold text-right">
                              <option value="">لا يوجد</option>
                              {Object.entries(ACCESSORY_COLORS).map(([val, label]) => <option key={val} value={val}>{label}</option>)}
                            </select>
                          </div>
                          <div>
                            <label className="block text-[10px] font-semibold text-muted-foreground mb-1">مقاس البنطلون</label>
                            <Controller
                              control={control}
                              name="trouserSize"
                              render={({ field }) => (
                                <select value={field.value || ""} onChange={e => field.onChange(e.target.value ? Number(e.target.value) : null)} className="w-full h-11 px-4 rounded-xl bg-background border border-border/85 text-foreground outline-none focus:ring-2 focus:ring-primary text-xs font-semibold text-right">
                                  <option value="">لا يوجد</option>
                                  {ACCESSORY_SIZES.map(sz => <option key={sz} value={sz}>مقاس {sz}</option>)}
                                </select>
                              )}
                            />
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
                              {Object.entries(ACCESSORY_COLORS).map(([val, label]) => <option key={val} value={val}>{label}</option>)}
                            </select>
                          </div>
                          <div>
                            <label className="block text-[10px] font-semibold text-muted-foreground mb-1">مقاس السديري / Vest</label>
                            <Controller
                              control={control}
                              name="vestSize"
                              render={({ field }) => (
                                <select value={field.value || ""} onChange={e => field.onChange(e.target.value ? Number(e.target.value) : null)} className="w-full h-11 px-4 rounded-xl bg-background border border-border/85 text-foreground outline-none focus:ring-2 focus:ring-primary text-xs font-semibold text-right">
                                  <option value="">لا يوجد</option>
                                  {ACCESSORY_SIZES.map(sz => <option key={sz} value={sz}>مقاس {sz}</option>)}
                                </select>
                              )}
                            />
                          </div>
                        </div>
                      </div>
                    );
                  }

                  return null;
                })}
              </div>
            )}

            {/* Group 2: Additional Accessories (4 buttons) */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-2">
              {/* Chain toggle */}
              <button
                type="button"
                onClick={() => toggleAccessory("chain")}
                className={cn(
                  "h-24 rounded-2xl border flex flex-col items-center justify-center gap-2.5 transition-all cursor-pointer font-bold text-xs select-none relative",
                  hasChain
                    ? "border-emerald-500/40 bg-emerald-500/5 text-emerald-600"
                    : "border-border bg-background text-muted-foreground hover:bg-accent/40"
                )}
              >
                {hasChain && (
                  <span className="absolute top-2 right-2 w-2.5 h-2.5 rounded-full bg-emerald-500" />
                )}
                <Layers className="w-6 h-6" />
                <span>سلسلة</span>
              </button>

              {/* Baby Fleur toggle */}
              <button
                type="button"
                onClick={() => toggleAccessory("babyFleur")}
                className={cn(
                  "h-24 rounded-2xl border flex flex-col items-center justify-center gap-2.5 transition-all cursor-pointer font-bold text-xs select-none relative",
                  hasBabyFleur
                    ? "border-emerald-500/40 bg-emerald-500/5 text-emerald-600"
                    : "border-border bg-background text-muted-foreground hover:bg-accent/40"
                )}
              >
                {hasBabyFleur && (
                  <span className="absolute top-2 right-2 w-2.5 h-2.5 rounded-full bg-emerald-500" />
                )}
                <Wind className="w-6 h-6" />
                <span>بابي فلور</span>
              </button>

              {/* Cufflinks toggle */}
              <button
                type="button"
                onClick={() => toggleAccessory("cufflinks")}
                className={cn(
                  "h-24 rounded-2xl border flex flex-col items-center justify-center gap-2.5 transition-all cursor-pointer font-bold text-xs select-none relative",
                  hasCufflinks
                    ? "border-emerald-500/40 bg-emerald-500/5 text-emerald-600"
                    : "border-border bg-background text-muted-foreground hover:bg-accent/40"
                )}
              >
                {hasCufflinks && (
                  <span className="absolute top-2 right-2 w-2.5 h-2.5 rounded-full bg-emerald-500" />
                )}
                <User className="w-6 h-6" />
                <span>كافلين</span>
              </button>

              {/* Bow Tie toggle */}
              <button
                type="button"
                onClick={() => {
                  const isSelected = activeAccessoriesOrder.includes("bowTie");
                  if (isSelected && activeTab !== "bowTie") {
                    setActiveTab("bowTie");
                  } else {
                    toggleAccessory("bowTie");
                  }
                }}
                className={cn(
                  "h-24 rounded-2xl border flex flex-col items-center justify-center gap-2.5 transition-all cursor-pointer font-bold text-xs select-none relative",
                  activeTab === "bowTie"
                    ? "border-primary bg-primary/5 text-primary shadow-sm ring-2 ring-primary/20"
                    : hasBowTie
                      ? "border-emerald-500/40 bg-emerald-500/5 text-emerald-600"
                      : "border-border bg-background text-muted-foreground hover:bg-accent/40"
                )}
              >
                {hasBowTie && (
                  <span className="absolute top-2 right-2 w-2.5 h-2.5 rounded-full bg-emerald-500" />
                )}
                {activeTab === "bowTie" && (
                  <span className="absolute top-2 left-2 text-[8px] bg-primary/25 px-1.5 py-0.5 rounded-md font-black">تعديل</span>
                )}
                <Wind className="w-6 h-6" />
                <span>ببيون</span>
              </button>
            </div>

            {/* Sub options for Group 2 (Additional Accessories) */}
            {activeAccessoriesOrder.length > 0 && ["bowTie"].includes(activeTab || "") && (
              <div className="pt-2 space-y-4 animate-in fade-in duration-200">
                {[activeTab].filter((name): name is string => !!name && ["bowTie"].includes(name) && activeAccessoriesOrder.includes(name)).map((name) => {
                  if (name === "bowTie") {
                    return (
                      <div key="bowTie" className="bg-muted/10 border border-border/50 rounded-2xl p-4 space-y-3">
                        <div className="flex items-center gap-2 text-xs font-bold text-primary">
                          <Wind className="w-4 h-4 text-primary" />
                          <span>خصائص الببيون</span>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-[10px] font-semibold text-muted-foreground mb-1">نوع الببيون</label>
                            <select {...register("bowTieType")} className="w-full h-11 px-4 rounded-xl bg-background border border-border/85 text-foreground outline-none focus:ring-2 focus:ring-primary text-xs font-semibold text-right">
                              <option value="">لا يوجد</option>
                              {Object.entries(BOW_TIE_TYPES).map(([val, label]) => <option key={val} value={val}>{label}</option>)}
                            </select>
                          </div>
                          <div>
                            <label className="block text-[10px] font-semibold text-muted-foreground mb-1">لون الببيون</label>
                            <select {...register("bowTieColor")} className="w-full h-11 px-4 rounded-xl bg-background border border-border/85 text-foreground outline-none focus:ring-2 focus:ring-primary text-xs font-semibold text-right">
                              <option value="">لا يوجد</option>
                              {Object.entries(ACCESSORY_COLORS).map(([val, label]) => <option key={val} value={val}>{label}</option>)}
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
        </div>

        {/* Card 5: Additional Notes */}
        <div className="bg-card border border-border/80 rounded-3xl p-6 space-y-2 shadow-sm">
          <label className="block text-xs font-bold text-foreground">ملاحظات إضافية</label>
          <textarea {...register("notes")} placeholder="أضف أي تفاصيل أو شروط خاصة بالحجز هنا..." rows={3} className="w-full p-4 rounded-xl bg-background border border-border/85 text-foreground placeholder-muted-foreground outline-none focus:ring-2 focus:ring-primary text-sm transition-all resize-none text-right" />
        </div>

        {/* Card 3: Rental Period & Financials */}
        <div className="bg-card border border-border/80 rounded-3xl p-6 space-y-4 shadow-sm">
          <h3 className="text-sm md:text-base font-bold text-foreground flex items-center justify-start gap-2 border-b border-border/40 pb-2.5">
            <Calendar className="w-5 h-5 text-primary" />
            <span>فترة الإيجار والمالية</span>
          </h3>
          
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-muted-foreground mb-1.5">تاريخ المناسبة / الحفل *</label>
              <input
                type="date"
                {...register("eventDate")}
                onFocus={(e) => (e.target as HTMLInputElement).showPicker?.()}
                onClick={(e) => (e.target as HTMLInputElement).showPicker?.()}
                className="w-full h-12 px-4 rounded-xl bg-background border border-border/85 text-foreground outline-none focus:ring-2 focus:ring-primary text-sm font-semibold transition-all text-right cursor-pointer"
              />
              {errors.eventDate && <p className="text-red-400 text-xs mt-1">{errors.eventDate.message}</p>}
            </div>

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
              onClick={() => {
                sessionStorage.removeItem("draft_booking");
                navigate("/bookings");
              }}
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
