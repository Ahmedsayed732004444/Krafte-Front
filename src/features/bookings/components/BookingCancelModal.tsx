import React from "react";
import { Modal } from "./Modal";
import { Loader2, Check } from "lucide-react";
import type { BookingResponse } from "../types/bookings";

interface BookingCancelModalProps {
  booking: BookingResponse;
  cancelDeduction: number;
  setCancelDeduction: (val: number) => void;
  cancelReason: string;
  setCancelReason: (val: string) => void;
  onConfirm: () => void;
  onClose: () => void;
  isPending: boolean;
}

export const BookingCancelModal: React.FC<BookingCancelModalProps> = ({
  booking,
  cancelDeduction,
  setCancelDeduction,
  cancelReason,
  setCancelReason,
  onConfirm,
  onClose,
  isPending
}) => {
  return (
    <Modal title="إلغاء الحجز وتسوية التأمين" onClose={onClose}>
      <div className="space-y-4 pt-2 text-right" dir="rtl">
        <div>
          <span className="text-xs text-muted-foreground block mb-1 font-bold">مبلغ التأمين المدفوع سابقاً</span>
          <span className="font-bold text-foreground">{(booking.depositAmount || 0).toLocaleString("ar-EG-u-nu-latn", { minimumFractionDigits: 3 })} د.ك</span>
        </div>

        <div>
          <label className="block text-xs font-semibold text-muted-foreground mb-1.5">(Deduction Amount) المبلغ المخصوم من التأمين *</label>
          <input
            type="number"
            step="0.001"
            value={cancelDeduction}
            onChange={e => setCancelDeduction(Number(e.target.value))}
            className="w-full h-11 px-4 rounded-xl bg-background border border-border text-foreground font-bold outline-none focus:ring-2 focus:ring-primary text-sm transition-all text-right font-mono"
          />
        </div>

        <div>
          <span className="text-xs text-muted-foreground block mb-1 font-bold">(Refund Amount) المبلغ المسترجع للزبون</span>
          <span className="font-bold text-emerald-400 text-lg font-mono">
            {Math.max(0, (booking.depositAmount || 0) - cancelDeduction).toLocaleString("ar-EG-u-nu-latn", { minimumFractionDigits: 3 })} د.ك
          </span>
        </div>

        <div>
          <label className="block text-xs font-semibold text-muted-foreground mb-1.5">(Cancellation Reason) سبب الإلغاء</label>
          <input
            type="text"
            value={cancelReason}
            onChange={e => setCancelReason(e.target.value)}
            placeholder="مثال: الزبون اتراجع عن الحجز"
            className="w-full h-11 px-4 rounded-xl bg-background border border-border text-foreground outline-none focus:ring-2 focus:ring-primary text-sm transition-all text-right font-semibold"
          />
        </div>

        <button
          onClick={onConfirm}
          disabled={isPending}
          className="w-full h-11 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold flex items-center justify-center gap-2 transition-all disabled:opacity-60 cursor-pointer text-xs"
        >
          {isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />} تأكيد إلغاء الحجز
        </button>
      </div>
    </Modal>
  );
};
