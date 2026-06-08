// src/utils/theme.js

export const getTheme = (dbColor) => {
    const themes = {
        "bg-indigo-600": { bg: "bg-indigo-600", hover: "hover:bg-indigo-700", text: "text-indigo-600", light: "bg-indigo-50", shadow: "shadow-indigo-200" },
        "bg-blue-600": { bg: "bg-blue-600", hover: "hover:bg-blue-700", text: "text-blue-600", light: "bg-blue-50", shadow: "shadow-blue-200" },
        "bg-rose-600": { bg: "bg-rose-600", hover: "hover:bg-rose-700", text: "text-rose-600", light: "bg-rose-50", shadow: "shadow-rose-200" },
        "bg-emerald-600": { bg: "bg-emerald-600", hover: "hover:bg-emerald-700", text: "text-emerald-600", light: "bg-emerald-50", shadow: "shadow-emerald-200" },
        "bg-amber-500": { bg: "bg-amber-500", hover: "hover:bg-amber-600", text: "text-amber-500", light: "bg-amber-50", shadow: "shadow-amber-200" },
        "bg-slate-800": { bg: "bg-slate-800", hover: "hover:bg-slate-900", text: "text-slate-800", light: "bg-slate-100", shadow: "shadow-slate-300" },
    };

    // Jika warna tidak ditemukan, gunakan indigo sebagai default
    return themes[dbColor] || themes["bg-indigo-600"];
};