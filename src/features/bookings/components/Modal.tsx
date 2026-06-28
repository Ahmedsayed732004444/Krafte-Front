import { ReactNode } from "react";
import { X } from "lucide-react";

interface ModalProps {
  title: string;
  onClose: () => void;
  children: ReactNode;
}

export const Modal = ({ title, onClose, children }: ModalProps) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4 overflow-y-auto">
    <div className="bg-popover border border-border rounded-2xl w-full max-w-2xl my-8 shadow-2xl animate-in fade-in zoom-in duration-200">
      <div className="flex items-center justify-between p-6 border-b border-border">
        <h2 className="text-lg font-bold text-foreground">{title}</h2>
        <button
          onClick={onClose}
          className="text-muted-foreground hover:text-foreground transition-colors p-1 rounded-lg hover:bg-accent"
        >
          <X className="w-5 h-5" />
        </button>
      </div>
      <div className="p-6 max-h-[80vh] overflow-y-auto">{children}</div>
    </div>
  </div>
);
