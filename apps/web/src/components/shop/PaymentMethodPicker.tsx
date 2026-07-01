"use client";

import { Building2 } from "lucide-react";
import type { PaymentMethod } from "@konnit/types";
import { cn } from "@/lib/utils";

export type { PaymentMethod } from "@konnit/types";

interface PaymentMethodPickerProps {
  value: PaymentMethod;
  onChange: (v: PaymentMethod) => void;
}

// Chỉ hỗ trợ chuyển khoản ngân hàng. Ví/thẻ online tạm ẩn.
const OPTIONS: { value: PaymentMethod; label: string; icon: React.ReactNode; desc: string }[] = [
  {
    value: "bank",
    label: "Chuyển khoản ngân hàng",
    icon: <Building2 className="h-5 w-5" />,
    desc: "Quét QR ngân hàng, BTC xác nhận thủ công",
  },
];

export function PaymentMethodPicker({ value, onChange }: PaymentMethodPickerProps) {
  return (
    <div className="space-y-2">
      <p className="text-xs font-bold uppercase tracking-wide text-slate-500">
        Phương thức thanh toán
      </p>
      <div className="grid gap-2">
        {OPTIONS.map((opt) => (
          <button
            key={opt.value}
            type="button"
            onClick={() => onChange(opt.value)}
            className={cn(
              "flex items-center gap-3 rounded-xl border p-3 text-left transition",
              value === opt.value
                ? "border-[var(--konnit-berry)] bg-[var(--konnit-pink-02)]"
                : "border-slate-200 hover:border-slate-300 hover:bg-slate-50",
            )}
          >
            <span
              className={cn(
                "flex h-9 w-9 shrink-0 items-center justify-center rounded-lg",
                value === opt.value
                  ? "bg-[var(--konnit-berry)] text-white"
                  : "bg-slate-100 text-slate-500",
              )}
            >
              {opt.icon}
            </span>
            <div>
              <p className="text-sm font-bold text-[var(--konnit-ink)]">{opt.label}</p>
              <p className="text-xs text-slate-400">{opt.desc}</p>
            </div>
            <span
              className={cn(
                "ml-auto h-4 w-4 shrink-0 rounded-full border-2",
                value === opt.value
                  ? "border-[var(--konnit-berry)] bg-[var(--konnit-berry)]"
                  : "border-slate-300",
              )}
            />
          </button>
        ))}
      </div>
    </div>
  );
}
