import React, { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import { Bell, Book, Save, Calendar, User, Sparkles, Lock, LogIn, Share2, Copy, Edit3, Volume2 } from 'lucide-react';

const SUPABASE_URL = 'https://czgmoblnjmlcxpnijnpi.supabase.co'; 
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImN6Z21vYmxuam1sY3hwbmlqbnBpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzA2ODI1NTQsImV4cCI6MjA4NjI1ODU1NH0.3WH69MWJmiFGMpACOpTLR2WQHE0iU6GGcBH9fDvpmL0'; 
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

const days = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];

export default function App() {
  const [scheduleData, setScheduleData] = useState({});
  const [view, setView] = useState('home'); 
  const [isAuth, setIsAuth] = useState(false);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      const { data, error } = await supabase.from('Jadwal').select('*');
      if (data) {
        const dbMap = {};
        data.forEach(item => { dbMap[item.hari] = item.data; });
        setScheduleData(dbMap);
      }
    } catch (err) { console.error(err); } 
    finally { setLoading(false); }
  };

  useEffect(() => { fetchData(); }, []);

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-indigo-50 font-bold text-indigo-600">Sinkronisasi Cloud...</div>;

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 pb-24 font-sans selection:bg-indigo-100">
      <nav className="fixed top-0 inset-x-0 z-30 bg-white/80 backdrop-blur-md border-b border-slate-200 px-4 py-3 flex justify-between items-center shadow-sm">
        <div className="flex items-center gap-2">
          <div className="bg-indigo-600 p-2 rounded-xl text-white shadow-lg"><Calendar size={20} /></div>
          <h1 className="text-lg font-bold">Kelas Kita</h1>
        </div>
        <button onClick={() => setView(view === 'home' ? 'admin' : 'home')} className="text-xs font-bold px-4 py-2 bg-indigo-600 text-white rounded-full">
          {view === 'home' ? 'Menu Admin' : 'Kembali'}
        </button>
      </nav>

      <main className="max-w-lg mx-auto px-4 pt-20">
        {view === 'home' ? (
          <div className="space-y-6">
            <DayView title="Hari Ini" dayName={days[new Date().getDay()]} data={scheduleData[days[new Date().getDay()]]} isToday={true} />
            <DayView title="Besok" dayName={days[(new Date().getDay() + 1) % 7]} data={scheduleData[days[(new Date().getDay() + 1) % 7]]} isToday={false} />
          </div>
        ) : (
          isAuth ? <AdminPanel data={scheduleData} onSaveSuccess={fetchData} /> : <AdminLogin onLogin={() => setIsAuth(true)} />
        )}
      </main>
    </div>
  );
}

function DayView({ title, dayName, data, isToday }) {
  if (!data) return <div className="p-8 bg-white rounded-3xl border border-dashed border-slate-200 text-center text-slate-400 italic">Jadwal {dayName} belum tersedia.</div>;
  return (
    <div className={`p-6 rounded-3xl shadow-xl transition-all duration-500 ${isToday ? 'bg-indigo-600 text-white' : 'bg-white border border-slate-100'}`}>
      <p className={`text-[10px] font-black uppercase mb-1 ${isToday ? 'text-indigo-200' : 'text-indigo-500'}`}>{title}</p>
      <h2 className="text-3xl font-black">{dayName}</h2>
      <div className="flex flex-wrap gap-2 my-4">
        {data.subjects?.map((s, i) => <span key={i} className={`px-4 py-1.5 rounded-full text-xs font-black ${isToday ? 'bg-white/20' : 'bg-indigo-50 text-indigo-600'}`}>{s}</span>)}
      </div>
      <div className={`pt-4 border-t ${isToday ? 'border-white/10' : 'border-slate-100'} flex justify-between text-[11px] font-bold uppercase opacity-70`}>
        <span>Piket: {data.picket?.join(', ') || '-'}</span>
        <span>Tugas: {data.homework || '-'}</span>
      </div>
    </div>
  );
}

function AdminPanel({ data, onSaveSuccess }) {
  const [day, setDay] = useState('Senin');
  const [form, setForm] = useState({ subjects: [], picket: [], homework: '' });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (data[day]) setForm(data[day]);
    else setForm({ subjects: [], picket: [], homework: '' });
  }, [day, data]);

  const handleUpdate = async () => {
    setSaving(true);
    const { error } = await supabase.from('Jadwal').upsert({ hari: day, data: form }, { onConflict: 'hari' });
    if (!error) { alert('Sinkron Cloud Berhasil!'); onSaveSuccess(); }
    else alert('Error: ' + error.message);
    setSaving(false);
  };

  // --- FORMAT WHATSAPP TERBARU ---
  const generateWA = () => {
    const today = new Date().toLocaleDateString('id-ID', { day: '2-digit', month: 'long', year: 'numeric' });
    const sub = form.subjects.map(s => `• ${s} ⏰`).join('\n');
    const pik = form.picket.join(', ');
    
    return `───────────────────┐\n` +
           `✨ *INFO KELAS BESOK* ✨\n` +
           `${day}, ${today}\n` +
           `└───────────────────┘\n` +
           `🔹 *PELAJARAN:*\n${sub || '-\n'}\n` +
           `🔹 *PIKET:*\n• ${pik || '-'}\n\n` +
           `🔹 *TUGAS:*\n${form.homework || '-'}\n\n` +
           `Lihat jadwal: https://jadwal-sigma.vercel.app\n\n` +
           `*#NB:* Yang piket pagi tolong stand-by lebih awal agar kelas nyaman digunakan belajar!\n` +
           `🚀 *#XTKJ1SelaluNomer1*\n` +
           `Wassalamu'alaikum wr. wb.`;
  };

  return (
    <div className="bg-white p-6 rounded-3xl shadow-2xl space-y-4 border border-slate-100">
      <h2 className="font-black text-xl flex items-center gap-2"><Edit3 className="text-indigo-600" /> Editor</h2>
      <select value={day} onChange={(e) => setDay(e.target.value)} className="w-full p-4 bg-slate-50 rounded-2xl font-bold border-none ring-2 ring-indigo-50 outline-none">
        {days.map(d => <option key={d} value={d}>{d}</option>)}
      </select>
      <input className="w-full p-4 bg-slate-50 rounded-2xl outline-none text-sm" placeholder="Pelajaran (Koma)" value={form.subjects.join(', ')} onChange={e => setForm({...form, subjects: e.target.value.split(',').map(s=>s.trim())})} />
      <input className="w-full p-4 bg-slate-50 rounded-2xl outline-none text-sm" placeholder="Piket (Koma)" value={form.picket.join(', ')} onChange={e => setForm({...form, picket: e.target.value.split(',').map(s=>s.trim())})} />
      <input className="w-full p-4 bg-slate-50 rounded-2xl outline-none text-sm" placeholder="Tugas / PR" value={form.homework} onChange={e => setForm({...form, homework: e.target.value})} />
      
      <button onClick={handleUpdate} disabled={saving} className="w-full py-4 bg-indigo-600 text-white rounded-2xl font-black shadow-lg transition-all active:scale-95">
        {saving ? 'Sinkronisasi...' : 'SIMPAN KE SEMUA HP'}
      </button>

      <div className="pt-6 border-t-2 border-slate-50 border-dashed">
        <h3 className="font-bold text-slate-700 mb-2 text-sm flex items-center gap-2"><Share2 size={16} /> Broadcast WA</h3>
        <textarea className="w-full p-3 bg-slate-50 rounded-xl text-[10px] font-mono text-slate-500 mb-2 border border-slate-100" rows="8" readOnly value={generateWA()} />
        <div className="grid grid-cols-2 gap-2">
          <button onClick={() => { navigator.clipboard.writeText(generateWA()); alert('Salin Teks!'); }} className="p-3 bg-slate-100 text-slate-600 rounded-xl font-bold text-xs flex justify-center items-center gap-2"><Copy size={14}/> Salin</button>
          <button onClick={() => window.open(`https://wa.me/?text=${encodeURIComponent(generateWA())}`, '_blank')} className="p-3 bg-green-500 text-white rounded-xl font-bold text-xs flex justify-center items-center gap-2 shadow-lg"><Share2 size={14}/> Kirim WA</button>
        </div>
      </div>
    </div>
  );
}

function AdminLogin({ onLogin }) {
  const [p, setP] = useState('');
  return (
    <div className="bg-white p-8 rounded-3xl shadow-2xl text-center space-y-4">
      <div className="w-16 h-16 bg-indigo-50 rounded-2xl flex items-center justify-center mx-auto text-indigo-600"><Lock size={32} /></div>
      <h2 className="font-black text-xl">Login Admin</h2>
      <input type="password" value={p} onChange={e => setP(e.target.value)} className="w-full p-4 bg-slate-50 rounded-2xl text-center font-black tracking-widest border-none focus:ring-2 focus:ring-indigo-100" placeholder="••••••••" autoFocus />
      <button onClick={() => p === 'TKJ2025' ? onLogin() : alert('Salah!')} className="w-full py-4 bg-slate-900 text-white rounded-2xl font-black">MASUK</button>
    </div>
  );
  }
        
