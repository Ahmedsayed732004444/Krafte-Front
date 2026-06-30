import React from "react";
import { Modal } from "./Modal";
import { Loader2, Check } from "lucide-react";

interface BookingEditModalProps {
  editEventDate: string;
  setEditEventDate: (val: string) => void;
  editFromDate: string;
  setEditFromDate: (val: string) => void;
  editToDate: string;
  setEditToDate: (val: string) => void;
  editTotalAmount: number;
  setEditTotalAmount: (val: number) => void;
  editDepositAmount: number;
  setEditDepositAmount: (val: number) => void;
  editHasDiscount: boolean;
  setEditHasDiscount: (val: boolean) => void;
  editDiscountPercentage: number | null;
  setEditDiscountPercentage: (val: number | null) => void;
  editDepositPaid: boolean;
  setEditDepositPaid: (val: boolean) => void;
  editIdTaken: boolean;
  setEditIdTaken: (val: boolean) => void;
  editNotes: string;
  setEditNotes: (val: string) => void;
  onConfirm: () => void;
  onClose: () => void;
  isPending: boolean;
}

export const BookingEditModal: React.FC<BookingEditModalProps> = ({
  editEventDate,
  setEditEventDate,
  editFromDate,
  setEditFromDate,
  editToDate,
  setEditToDate,
  editTotalAmount,
  setEditTotalAmount,
  editDepositAmount,
  setEditDepositAmount,
  editHasDiscount,
  setEditHasDiscount,
  editDiscountPercentage,
  setEditDiscountPercentage,
  editDepositPaid,
  setEditDepositPaid,
  editIdTaken,
  setEditIdTaken,
  editNotes,
  setEditNotes,
  onConfirm,
  onClose,
  isPending
}) => {
  return (
    <Modal title="تعديل بيانات الحجز" onClose={onClose}>
      <div className="space-y-4 pt-2 text-right" dir="rtl">
        <div>
          <label className="block text-xs font-semibold text-muted-foreground mb-1.5">تاريخ المناسبة / الحفل *</label>
          <input
            type="date"
            value={editEventDate}
            onChange={e => setEditEventDate(e.target.value)}
            className="w-full h-11 px-4 rounded-xl bg-background border border-border text-foreground outline-none focus:ring-2 focus:ring-primary text-xs font-semibold transition-all text-right cursor-pointer"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-muted-foreground mb-1.5">تاريخ الاستلام *</label>
            <input
              type="date"
              value={editFromDate}
              onChange={e => setEditFromDate(e.target.value)}
              className="w-full h-11 px-4 rounded-xl bg-background border border-border text-foreground outline-none focus:ring-2 focus:ring-primary text-xs font-semibold transition-all text-right cursor-pointer"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-muted-foreground mb-1.5">تاريخ الإرجاع المتوقع *</label>
            <input
              type="date"
              value={editToDate}
              onChange={e => setEditToDate(e.target.value)}
              className="w-full h-11 px-4 rounded-xl bg-background border border-border text-foreground outline-none focus:ring-2 focus:ring-primary text-xs font-semibold transition-all text-right cursor-pointer"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-muted-foreground mb-1.5">إجمالي التكلفة المطلوب *</label>
          <input
            type="number"
            value={editTotalAmount}
            onChange={e => setEditTotalAmount(Number(e.target.value))}
            className="w-full h-11 px-4 rounded-xl bg-background border border-border text-foreground font-bold outline-none focus:ring-2 focus:ring-primary text-xs transition-all text-right font-mono"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-muted-foreground mb-1.5">مبلغ التأمين</label>
            <input
              type="number"
              value={editDepositAmount}
              onChange={e => setEditDepositAmount(Number(e.target.value))}
              className="w-full h-11 px-4 rounded-xl bg-background border border-border text-foreground font-bold outline-none focus:ring-2 focus:ring-primary text-xs transition-all text-right font-mono"
            />
          </div>
          <div className="flex flex-col gap-2 justify-center">
            <label className="flex items-center gap-2 text-xs font-bold text-foreground cursor-pointer select-none">
              <input
                type="checkbox"
                checked={editHasDiscount}
                onChange={e => {
                  setEditHasDiscount(e.target.checked);
                  if (!e.target.checked) setEditDiscountPercentage(null);
                }}
                className="w-4 h-4 rounded border-border text-primary focus:ring-primary bg-background"
              />
              <span>يوجد خصم على الحجز</span>
            </label>

            {editHasDiscount && (
              <div className="mt-1">
                <label className="block text-xs font-semibold text-muted-foreground mb-1">نسبة الخصم (%) *</label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={editDiscountPercentage ?? 0}
                  onChange={e => setEditDiscountPercentage(Number(e.target.value))}
                  className="w-full h-11 px-4 rounded-xl bg-background border border-border text-foreground font-bold outline-none focus:ring-2 focus:ring-primary text-xs transition-all text-right font-mono"
                />
              </div>
            )}
          </div>
        </div>

        <div className="flex flex-col gap-2 pb-1">
          <label className="flex items-center gap-2 text-xs font-bold text-foreground cursor-pointer select-none">
            <input
              type="checkbox"
              checked={editDepositPaid}
              onChange={e => setEditDepositPaid(e.target.checked)}
              className="w-4 h-4 rounded border-border text-primary focus:ring-primary bg-background"
            />
            <span>تم دفع التأمين</span>
          </label>
          <label className="flex items-center gap-2 text-xs font-bold text-foreground cursor-pointer select-none">
            <input
              type="checkbox"
              checked={editIdTaken}
              onChange={e => setEditIdTaken(e.target.checked)}
              className="w-4 h-4 rounded border-border text-primary focus:ring-primary bg-background"
            />
            <span>أخذ البطاقة الشخصية كضمان</span>
          </label>
        </div>

        <div>
          <label className="block text-xs font-semibold text-muted-foreground mb-1.5">ملاحظات الحجز</label>
          <textarea
            value={editNotes}
            onChange={e => setEditNotes(e.target.value)}
            rows={3}
            className="w-full p-4 rounded-xl bg-background border border-border text-foreground outline-none focus:ring-2 focus:ring-primary text-xs transition-all resize-none text-right font-semibold"
          />
        </div>

        <button
          onClick={onConfirm}
          disabled={isPending}
          className="w-full h-11 rounded-xl bg-primary hover:bg-primary/90 text-background font-black flex items-center justify-center gap-2 transition-all disabled:opacity-60 cursor-pointer text-xs"
        >
          {isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />} حفظ التغييرات
        </button>
      </div>
    </Modal>
  );
};
