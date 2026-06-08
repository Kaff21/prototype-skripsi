export default function AnggotaView({ data }) {
  return (
    <div className="space-y-8">
      <div className="bg-indigo-600 p-10 rounded-[3rem] text-white shadow-2xl shadow-indigo-100 relative overflow-hidden text-left">
        <div className="relative z-10">
          <p className="text-[10px] font-black uppercase tracking-[0.3em] opacity-70 mb-2">Profil Organisasi</p>
          <h1 className="text-4xl font-black italic uppercase tracking-tighter leading-none">{data?.name}</h1>
          <p className="mt-4 text-sm font-medium opacity-90 max-w-2xl">{data?.description}</p>
        </div>
        <span className="material-symbols-outlined absolute -bottom-8 -right-8 text-[12rem] opacity-10">hub</span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <InfoCard title="Visi" content={data?.vision} icon="visibility" color="text-indigo-500" />
        <InfoCard title="Misi" content={data?.mission} icon="ads_click" color="text-rose-500" />
        <div className="md:col-span-2">
          <InfoCard title="Sejarah" content={data?.history} icon="history_edu" color="text-amber-500" />
        </div>
      </div>
    </div>
  );
}

function InfoCard({ title, content, icon, color }) {
  return (
    <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm text-left">
      <div className="flex items-center gap-3 mb-4">
        <span className={`material-symbols-outlined ${color}`}>{icon}</span>
        <h3 className="text-xs font-black uppercase tracking-widest text-slate-800">{title}</h3>
      </div>
      <p className="text-slate-500 text-sm leading-relaxed font-medium whitespace-pre-line">
        {content || `Data ${title} belum tersedia.`}
      </p>
    </div>
  );
}