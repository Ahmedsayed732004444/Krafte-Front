import React from "react";
import { Modal } from "./Modal";
import { Loader2, Check } from "lucide-react";
import type { BookingResponse } from "../types/bookings";

interface BookingReturnModalProps {
  booking: BookingResponse;
  returnIsDamaged: boolean;
  setReturnIsDamaged: (val: boolean) => void;
  returnDamageAmount: number;
  setReturnDamageAmount: (val: number) => void;
  returnDamageNotes: string;
  setReturnDamageNotes: (val: string) => void;
  returnExtraDamagePaid: boolean;
  setReturnExtraDamagePaid: (val: boolean) => void;
  returnExtraDamagePaidAmount: number;
  setReturnExtraDamagePaidAmount: (val: number) => void;
  onConfirm: () => void;
  onClose: () => void;
  isPending: boolean;
}

export const BookingReturnModal: React.FC<BookingReturnModalProps> = ({
  booking,
  returnIsDamaged,
  setReturnIsDamaged,
  returnDamageAmount,
  setReturnDamageAmount,
  returnDamageNotes,
  setReturnDamageNotes,
  returnExtraDamagePaid,
  setReturnExtraDamagePaid,
  returnExtraDamagePaidAmount,
  setReturnExtraDamagePaidAmount,
  onConfirm,
  onClose,
  isPending
}) => {
  const deposit = booking.depositAmount ?? 0;
  const extraOwed = returnIsDamaged && returnDamageAmount > deposit
    ? returnDamageAmount - deposit
    : 0;

  return (
    <Modal title="إرجاع البدلة وتسوية الضمان" onClose={onClose}>
      <div className="space-y-4 pt-2 text-right" dir="rtl">
        <div>
          <span className="text-xs text-muted-foreground block mb-1 font-bold">مبلغ التأمين المدفوع سابقاً</span>
          <span className="font-bold text-foreground">{deposit.toLocaleString("ar-EG-u-nu-latn", { minimumFractionDigits: 3 })} د.ك</span>
        </div>

        <div className="flex flex-col gap-2 py-1">
          <label className="flex items-center gap-2.5 cursor-pointer select-none text-xs font-bold text-muted-foreground hover:text-foreground transition-colors">
            <input
              type="checkbox"
              checked={returnIsDamaged}
              onChange={e => {
                setReturnIsDamaged(e.target.checked);
                if (!e.target.checked) {
                  setReturnExtraDamagePaid(false);
                  setReturnExtraDamagePaidAmount(0);
                }
              }}
              className="w-4 h-4 rounded border-border bg-background text-primary focus:ring-primary focus:ring-offset-background"
            />
            <span>هل يوجد تلف أو قطع بالبدلة؟</span>
          </label>
        </div>

        {returnIsDamaged && (
          <div className="space-y-4 animate-in fade-in slide-in-from-top-2 duration-200">
            <div>
              <label className="block text-xs font-semibold text-muted-foreground mb-1.5">مبلغ التعويض المطلوب للتلف *</label>
              <input
                type="number"
                step="0.001"
                value={returnDamageAmount}
                onChange={e => setReturnDamageAmount(Number(e.target.value))}
                className="w-full h-11 px-4 rounded-xl bg-background border border-border text-foreground font-bold outline-none focus:ring-2 focus:ring-primary text-xs transition-all text-right font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-muted-foreground mb-1.5">ملاحظات وتفاصيل التلف *</label>
              <textarea
                value={returnDamageNotes}
                onChange={e => setReturnDamageNotes(e.target.value)}
                rows={2}
                placeholder="اشرح طبيعة التلف هنا..."
                className="w-full p-4 rounded-xl bg-background border border-border text-foreground outline-none focus:ring-2 focus:ring-primary text-xs transition-all resize-none text-right font-semibold"
              />
            </div>

            {/* Calculations preview */}
            <div className="bg-background/40 border border-border/40 rounded-xl p-4 space-y-2 text-xs font-bold">
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">المسترجع للزبون من التأمين:</span>
                <span className="text-emerald-400 text-sm font-black font-mono">
                  {Math.max(0, deposit - returnDamageAmount).toLocaleString("ar-EG-u-nu-latn", { minimumFractionDigits: 3 })} د.ك
                </span>
              </div>
              {extraOwed > 0 && (
                <div className="flex justify-between items-center border-t border-border/30 pt-2 text-red-400">
                  <span>المبلغ الإضافي المستحق على الزبون (الفرق):</span>
                  <span className="text-sm font-black font-mono">
                    {extraOwed.toLocaleString("ar-EG-u-nu-latn", { minimumFractionDigits: 3 })} د.ك
                  </span>
                </div>
              )}
            </div>

            {/* Extra damage paid section — only shown when damage > deposit */}
            {extraOwed > 0 && (
              <div className="space-y-3 border border-amber-500/20 bg-amber-500/5 rounded-xl p-4 animate-in fade-in duration-200">
                <label className="flex items-center gap-2.5 cursor-pointer select-none text-xs font-bold text-amber-400 hover:text-amber-300 transition-colors">
                  <input
                    type="checkbox"
                    checked={returnExtraDamagePaid}
                    onChange={e => {
                      setReturnExtraDamagePaid(e.target.checked);
                      if (!e.target.checked) setReturnExtraDamagePaidAmount(0);
                    }}
                    className="w-4 h-4 rounded border-border bg-background text-amber-500 focus:ring-amber-400 focus:ring-offset-background"
                  />
                  <span>هل دفع الزبون الفرق الإضافي الآن؟</span>
                </label>

                {returnExtraDamagePaid && (
                  <div className="animate-in fade-in slide-in-from-top-2 duration-200">
                    <label className="block text-xs font-semibold text-muted-foreground mb-1.5">المبلغ المدفوع فعلياً من الفرق</label>
                    <input
                      type="number"
                      step="0.001"
                      min={0}
                      max={extraOwed}
                      value={returnExtraDamagePaidAmount}
                      onChange={e => setReturnExtraDamagePaidAmount(Number(e.target.value))}
                      className="w-full h-11 px-4 rounded-xl bg-background border border-amber-500/30 text-foreground font-bold outline-none focus:ring-2 focus:ring-amber-500 text-xs transition-all text-right font-mono"
                    />
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        <button
          onClick={onConfirm}
          disabled={isPending}
          className="w-full h-11 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold flex items-center justify-center gap-2 transition-all disabled:opacity-60 cursor-pointer text-xs"
        >
          {isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />} تأكيد إرجاع البدلة والتسوية
        </button>
      </div>
    </Modal>
  );
};
