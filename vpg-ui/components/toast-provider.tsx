"use client";
import { createContext, useContext, useState } from "react";

type Toast = { id: number; msg: string };
const ToastCtx = createContext<(msg: string) => void>(() => {});

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const push = (msg: string) => {
    const id = Date.now();
    setToasts((t) => [...t, { id, msg }]);
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 2500);
  };
  return (
    <ToastCtx.Provider value={push}>
      {children}
      <div className="fixed bottom-4 left-1/2 -translate-x-1/2 space-y-2">
        {toasts.map((t) => (
          <div key={t.id} className="bg-black text-white px-3 py-2 rounded shadow">{t.msg}</div>
        ))}
      </div>
    </ToastCtx.Provider>
  );
}

export const useToast = () => useContext(ToastCtx);
