import React, { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import { Calendar, Save, Lock, LogIn, Book, User, Sparkles, AlertCircle } from 'lucide-react';

// --- KONFIGURASI SUPABASE ---
const SUPABASE_URL = 'https://czgmoblnjmlcxpnijnpi.supabase.co'; 
const SUPABASE_KEY = 'EyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImN6Z21vYmxuam1sY3hwbmlqbnBpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzA2ODI1NTQsImV4cCI6MjA4NjI1ODU1NH0.3WH69MWJmiFGMpACOpTLR2WQHE0iU6GGcBH9fDvpmL0'; 
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

const days = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];

export default function App() {
  const [scheduleData, setScheduleData] = useState({});
  const [view, setView] = useState('home');
  const [isAuth, setIsAuth] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      // Nama tabel disesuaikan menjadi 'Jadwal' sesuai dashboard terbaru
      const { data, error } = await supabase.from('Jadwal').select('*');
      if (data) {
        const dbMap = {};
        data.forEach(item => { dbMap[item.hari] = item.data; });
        setScheduleData(dbMap);
      }
    } catch (err) { console.error(err); } 
    finally { setLoading(false); }
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-indigo-50 font-bold text-indigo-600">Sinkronisasi Cloud...</div>;

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 pb-24 font-sans">
      <nav className="fixed top-0 inset-x-0 z-30 bg-white/80 backdrop-blur-md border-b border-slate-200 px-4 py-3">
        <div className="max-w-lg mx-auto flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Calendar className="text-indigo-600" size={24} />
            <h1 className="font-bold text-lg">Kelas Kita</h1>
          </div>
          <button onClick={() => setView(view === 'home' ? 'admin' : 'home')} className="text-xs font-bold px-4 py-2 bg-indigo-600 text-white rounded-full shadow-sm">
            {view === 'home' ? 'Menu Admin' : 'Kembali'}
          </button>
        </div>
      </nav>

      <main className="max-w-lg mx-auto px-4 pt-20">
        {view === 'home' ? (
          <div className="space-y-6">
            <DayView title="Hari Ini" dayName={days[new Date().getDay()]} data={scheduleData[days[new Date().getDay()]]} isToday={true} />
            <DayView title="Besok" dayName={days[(new Date().getDay() + 1) % 7]} data={scheduleData[days[(new Date().getDay() + 1) % 7]]} isToday={false} />
          </div>
        ) : (
          isAuth ? <AdminPanel data={scheduleData} onSave={fetchData} /> : <AdminLogin onLogin={() => setIsAuth(true)} />
        )}
      </main>
    </div>
  );
}

function DayView({ title, dayName, data, isToday }) {
  if (!data) return (
    <div className="p-6 bg-white rounded-3xl border border-dashed border-slate-300 text-center text-slate-400">
      Jadwal {dayName} belum diisi admin.
    </div>
  );
  return (
    <div className={`p-6 rounded-3xl shadow-lg transition-all ${isToday ? 'bg-indigo-600 text-white' : 'bg-white border border-slate-100'}`}>
      <p className={`text-xs font-bold uppercase mb-1 ${isToday ? 'text-indigo-200' : 'text-indigo-500'}`}>{title}</p>
      <h2 className="text-3xl font-bold mb-4">{dayName}</h2>
      <div className="space-y-4">
        <div className="flex flex-wrap gap-2">
          {data.subjects?.map((s, i) => <span key={i} className={`px-3 py-1 rounded-full text-sm font-medium ${isToday ? 'bg-white/20' : 'bg-slate-100'}`}>{s}</span>)}
        </div>
        <div className="pt-4 border-t border-white/10 flex justify-between text-sm">
          <div><p className="opacity-60 text-[10px] font-bold uppercase tracking-wider">Piket</p>{data.picket?.join(', ') || '-'}</div>
          <div className="text-right"><p className="opacity-60 text-[10px] font-bold uppercase tracking-wider">Tugas / PR</p>{data.homework || '-'}</div>
        </div>
      </div>
    </div>
  );
}

function AdminPanel({ data, onSave }) {
  const [day, setDay] = useState('Senin');
  const [form, setForm] = useState({ subjects: [], picket: [], homework: '' });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (data[day]) setForm(data[day]);
    else setForm({ subjects: [], picket: [], homework: '' });
  }, [day, data]);

  const handleUpdate = async () => {
    setSaving(true);
    // Operasi upsert ke tabel 'Jadwal'
    const { error } = await supabase
      .from('Jadwal')
      .upsert({ hari: day, data: form }, { onConflict: 'hari' });
    
    if (!error) {
      alert('Berhasil Update Cloud! Seluruh kelas akan melihat info terbaru.');
      onSave();
    } else {
      alert('Gagal: ' + error.message);
    }
    setSaving(false);
  };

  return (
    <div className="bg-white p-6 rounded-3xl shadow-xl space-y-4 border border-slate-100">
      <h2 className="font-bold text-xl text-slate-800">Edit Jadwal Publik</h2>
      <select value={day} onChange={(e) => setDay(e.target.value)} className="w-full p-4 bg-slate-50 rounded-xl font-bold border-none outline-none ring-2 ring-indigo-50">
        {days.map(d => <option key={d} value={d}>{d}</option>)}
      </select>
      <input className="w-full p-4 bg-slate-50 rounded-xl outline-none" placeholder="Pelajaran (koma)" value={form.subjects.join(', ')} onChange={e => setForm({...form, subjects: e.target.value.split(',')})} />
      <input className="w-full p-4 bg-slate-50 rounded-xl outline-none" placeholder="Piket (koma)" value={form.picket.join(', ')} onChange={e => setForm({...form, picket: e.target.value.split(',')})} />
      <input className="w-full p-4 bg-slate-50 rounded-xl outline-none" placeholder="PR / Tugas" value={form.homework} onChange={e => setForm({...form, homework: e.target.value})} />
      <button onClick={handleUpdate} disabled={saving} className="w-full py-4 bg-indigo-600 text-white rounded-xl font-bold shadow-lg transition-all active:scale-95">
        {saving ? 'Sinkronisasi...' : 'Simpan ke Semua HP'}
      </button>
    </div>
  );
}

function AdminLogin({ onLogin }) {
  const [p, setP] = useState('');
  return (
    <div className="bg-white p-8 rounded-3xl shadow-xl text-center space-y-4 border border-slate-100">
      <h2 className="font-bold text-xl text-slate-800">Login Admin</h2>
      <p className="text-sm text-slate-500">Masukkan password (TKJ2025) untuk akses edit.</p>
      <input type="password" value={p} onChange={e => setP(e.target.value)} className="w-full p-4 bg-slate-50 rounded-xl text-center font-bold tracking-widest border-2 border-slate-50 focus:border-indigo-100 outline-none" placeholder="••••••••" />
      <button onClick={() => p === 'TKJ2025' ? onLogin() : alert('Password Salah!')} className="w-full py-4 bg-slate-900 text-white rounded-xl font-bold shadow-lg hover:bg-slate-800 transition-all">Masuk</button>
    </div>
  );
}
ounded-xl text-center font-bold tracking-widest border-none" autoFocus />
        <button type="submit" className="w-full bg-slate-900 text-white font-bold py-4 rounded-xl flex justify-center items-center gap-2 hover:bg-slate-800 transition-all shadow-lg"><LogIn size={18} /> Masuk</button>
      </form>
    </div>
  );
}
  

