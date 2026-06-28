import { useNavigate, useLocation } from "react-router-dom";
import { useCreateBooking } from "../hooks/useBookings";
import { BookingForm } from "../components/BookingForm";
import { ArrowRight } from "lucide-react";
import type { CreateBookingRequest } from "../types/bookings";

export default function CreateBookingPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const state = location.state as { partitionId?: string; hangerId?: string } | null;

  const createM = useCreateBooking();

  const handleSubmit = async (d: any) => {
    const req: CreateBookingRequest = {
      customerPhone: d.customerPhone,
      customerName: d.customerName || undefined,
      partitionId: d.partitionId,
      hangerId: d.hangerId,
      suitSize: d.suitSize,
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
      trouserWaistSize: d.trouserWaistSize || null,
      trouserLength: d.trouserLength || null,
      vestColor: d.vestColor || null,
      notes: d.notes,
    };

    try {
      await createM.mutateAsync(req);
      navigate("/bookings");
    } catch {
      // Error handled by hook toast
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto px-4 sm:px-6">
      {/* Header */}
      <div className="flex items-center justify-between gap-4 pb-4">
        {/* Left Arrow Button */}
        <button
          onClick={() => navigate("/bookings")}
          className="w-12 h-12 rounded-full bg-card border border-border/80 flex items-center justify-center text-muted-foreground hover:text-foreground transition-all hover:bg-accent hover:border-primary/30 cursor-pointer shrink-0"
        >
          <ArrowRight className="w-5 h-5" />
        </button>

        {/* Centered Title */}
        <div className="text-center space-y-1 flex-1">
          <h1 className="text-2xl md:text-3xl font-black text-foreground tracking-tight">إنشاء حجز جديد</h1>
          <p className="text-muted-foreground text-xs md:text-sm font-medium">قم بتعبئة نموذج الحجز الخاص بالزبون ومواصفات البدلة</p>
        </div>

        {/* Right Arrow Button */}
        <button
          onClick={() => navigate("/bookings")}
          className="w-12 h-12 rounded-full bg-card border border-border/80 flex items-center justify-center text-muted-foreground hover:text-foreground transition-all hover:bg-accent hover:border-primary/30 cursor-pointer shrink-0"
        >
          {/* Note: In RTL layout, ArrowRight or ArrowLeft can act as back/forward. Providing both matches screenshot. */}
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
