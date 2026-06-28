import React from "react";
import { Modal } from "./Modal";
import { Loader2, Check } from "lucide-react";
import type { BookingResponse } from "../types/bookings";

interface BookingPickupModalProps {
  booking: BookingResponse;
  pickupPaidAmount: number;
  setPickupPaidAmount: (val: number) => void;
  pickupIdTaken: boolean;
  setPickupIdTaken: (val: boolean) => void;
  onConfirm: () => void;
  onClose: () => void;
  isPending: boolean;
}

export const BookingPickupModal: React.FC<BookingPickupModalProps> = ({
  booking,
  pickupPaidAmount,
  setPickupPaidAmount,
  pickupIdTaken,
  setPickupIdTaken,
  onConfirm,
  onClose,
  isPending
}) => {
  return (
    <Modal title="تسليم البدلة وتسجيل الدفعة" onClose={onClose}>
      <div className="space-y-4 pt-2 text-right" dir="rtl">
        <div>
          <span className="text-xs text-muted-foreground block mb-1 font-bold">المتبقي من إجمالي الحجز</span>
          <span className="font-bold text-amber-400 text-lg font-mono">
            {booking.remainingAmount.toLocaleString("ar-EG-u-nu-latn", { minimumFractionDigits: 3 })} د.ك
          </span>
        </div>

        <div>
          <label className="block text-xs font-semibold text-muted-foreground mb-1.5">المبلغ المدفوع الآن *</label>
          <input
            type="number"
            step="0.001"
            value={pickupPaidAmount}
            onChange={e => setPickupPaidAmount(Number(e.target.value))}
            className="w-full h-11 px-4 rounded-xl bg-background border border-border text-foreground font-bold outline-none focus:ring-2 focus:ring-primary text-xs transition-all text-right font-mono"
          />
        </div>

        <div className="flex items-center gap-2.5 py-1">
          <label className="flex items-center gap-2 cursor-pointer select-none text-xs font-bold text-muted-foreground hover:text-foreground transition-colors">
            <input
              type="checkbox"
              checked={pickupIdTaken}
              disabled={booking.idTaken}
              onChange={e => setPickupIdTaken(e.target.checked)}
              className="w-4 h-4 rounded border-border bg-background text-primary focus:ring-primary focus:ring-offset-background"
            />
            <span>تم استلام البطاقة الشخصية كضمان</span>
          </label>
          {booking.idTaken && (
            <span className="text-[10px] text-emerald-400 font-extrabold">(تم الاستلام مسبقاً)</span>
          )}
        </div>

        <button
          onClick={onConfirm}
          disabled={isPending}
          className="w-full h-11 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold flex items-center justify-center gap-2 transition-all disabled:opacity-60 cursor-pointer text-xs"
        >
          {isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />} تأكيد الاستلام وتسجيل الدفعة
        </button>
      </div>
    </Modal>
  );
};
