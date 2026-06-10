"use client";
import { useState, useEffect } from "react";

// ─── Tipe: "success" | "error" | "warning" | "info" | "confirm"
export function useAlert() {
  const [alertState, setAlertState] = useState(null);

  const showAlert = ({ type = "info", title, message, onConfirm = null }) => {
    return new Promise((resolve) => {
      setAlertState({ type, title, message, onConfirm, resolve });
    });
  };

  const handleClose = (result = false) => {
    if (alertState?.resolve) alertState.resolve(result);
    setAlertState(null);
  };

  return { alertState, showAlert, handleClose };
}

const icons = {
  success: { symbol: "check_circle", bg: "bg-emerald-50", icon: "text-emerald-500", ring: "ring-emerald-200", btn: "bg-emerald-500 hover:bg-emerald-600 shadow-emerald-200" },
  error:   { symbol: "cancel",       bg: "bg-rose-50",    icon: "text-rose-500",    ring: "ring-rose-200",    btn: "bg-rose-500 hover:bg-rose-600 shadow-rose-200" },
  warning: { symbol: "warning",      bg: "bg-amber-50",   icon: "text-amber-500",   ring: "ring-amber-200",   btn: "bg-amber-500 hover:bg-amber-600 shadow-amber-200" },
  info:    { symbol: "info",         bg: "bg-indigo-50",  icon: "text-indigo-500",  ring: "ring-indigo-200",  btn: "bg-indigo-500 hover:bg-indigo-600 shadow-indigo-200" },
  confirm: { symbol: "help",         bg: "bg-slate-50",   icon: "text-slate-500",   ring: "ring-slate-200",   btn: "bg-rose-500 hover:bg-rose-600 shadow-rose-200" },
};

export default function AlertDialog({ alertState, onClose }) {
  useEffect(() => {
    if (!alertState) return;
    const onKey = (e) => { if (e.key === "Escape") onClose(false); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [alertState, onClose]);

  if (!alertState) return null;

  const cfg = icons[alertState.type] || icons.info;
  const isConfirm = alertState.type === "confirm";

  return (
    <div
      className="fixed inset-0 z-[999] flex items-center justify-center p-4"
      style={{ background: "rgba(15,23,42,0.55)", backdropFilter: "blur(6px)" }}
      onClick={() => onClose(false)}
    >
      {/* Card */}
      <div
        className="bg-white rounded-[2rem] shadow-2xl w-full max-w-sm p-8 flex flex-col items-center text-center gap-4 animate-in zoom-in-95 fade-in duration-300"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Icon circle */}
        <div className={`w-20 h-20 rounded-full ${cfg.bg} ring-8 ${cfg.ring} flex items-center justify-center`}>
          <span className={`material-symbols-outlined text-5xl ${cfg.icon}`}>{cfg.symbol}</span>
        </div>

        {/* Text */}
        <div className="space-y-1">
          {alertState.title && (
            <h3 className="text-xl font-black text-slate-800">{alertState.title}</h3>
          )}
          {alertState.message && (
            <p className="text-sm text-slate-500 font-medium leading-relaxed">{alertState.message}</p>
          )}
        </div>

        {/* Buttons */}
        <div className="flex gap-3 w-full mt-2">
          {isConfirm && (
            <button
              onClick={() => onClose(false)}
              className="flex-1 py-3 rounded-xl font-bold text-sm text-slate-500 bg-slate-100 hover:bg-slate-200 transition-all"
            >
              Batal
            </button>
          )}
          <button
            onClick={() => onClose(true)}
            className={`flex-1 py-3 rounded-xl font-black text-sm text-white shadow-lg transition-all active:scale-95 ${cfg.btn}`}
          >
            {isConfirm ? "Ya, Lanjutkan" : "Oke, Mengerti"}
          </button>
        </div>
      </div>
    </div>
  );
}
