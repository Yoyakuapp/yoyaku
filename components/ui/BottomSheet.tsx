"use client";

import type { ReactNode } from "react";

type BottomSheetProps = {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
};

export default function BottomSheet({
  open,
  onClose,
  title,
  children,
}: BottomSheetProps) {
  if (!open) {
    return null;
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/40"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label={title}
        onClick={(event) => event.stopPropagation()}
        className="w-full max-w-[430px] animate-[yoyaku-sheet-up_0.25s_ease-out] rounded-t-3xl bg-white p-6 pb-8 shadow-lg"
      >
        <div className="mx-auto mb-4 h-1.5 w-10 rounded-full bg-stone-200" />

        {title ? (
          <h2 className="text-lg font-bold text-stone-900">{title}</h2>
        ) : null}

        <div className={title ? "mt-4" : ""}>{children}</div>
      </div>
    </div>
  );
}
