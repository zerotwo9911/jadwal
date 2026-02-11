import React, { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import { Calendar, Save, Lock, LogIn, Book, User, Sparkles } from 'lucide-react';

// --- KONFIGURASI SUPABASE ---
const SUPABASE_URL = 'https://czgmoblnjmlcxpnijnpi.supabase.co'; 
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImN6Z21vYmxuam1sY3hwbmlqbnBpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzA2ODI1NTQsImV4cCI6MjA4NjI1ODU1NH0.3WH69MWJmiFGMpACOpTLR2WQHE0iU6GGcBH9fDvpmL0'; 
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

const days = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];

export default function App() {
  const [scheduleData, setScheduleData] = useState({});
  const [view, setView] = useState('home');
  const [isAuth, setIsAuth] = useState(false);
  const [loading, setLoading] = useState(true);

  // Fungsi untuk mengambil data dari Cloud Supabase
  const fetchData = async () => {
    try {
      const { data, error } = await supabase.from('Jadwal').select('*');
      if (error) throw error;

      if (data) {
        const dbMap = {};
        data.forEach(item => { 
          dbMap[item.hari] = item.data; 
        });
        setScheduleData(dbMap);
      }
    } catch (err) {
      console.error("Error Fetching:", err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-indigo-50 font-bold text-indigo-600">
      Menyinkronkan Jadwal...
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 pb-24 font-sans">
      <nav className="fixed top-0 inset-x-0 z-30 bg-white/80 backdrop-blur-md border-b border-slate-200 px-4 py-3 flex justify-between items-center shadow-sm">
        <div className="flex items-center gap-2">
          <Calendar className="text-indigo-600" size={24} />
          <h1 className="font-bold text-lg">Kelas Kita</h1>
        </div>
        <button 
          onClick={() => { setView(view === 'home' ? 'admin' : 'home'); if(view === 'admin') fetchData(); }} 
          className="text-xs font-bold px-4 py-2 bg-indigo-600 text-white rounded-full shadow-md active:scale-95 transition-all"
        >
          {view === 'home' ? 'Menu Admin' : 'Kembali'}
        </button>
      </nav>

      <main className="max-w-lg mx-auto px-4 pt-20">
        {view === 'home' ? (
          <div className="space-y-6 animate-in fade-in duration-500">
            <DayView 
              title="Hari Ini" 
              dayName={days[new Date().getDay()]} 
              data={scheduleData[days[new Date().getDay()]]} 
              isToday={true} 
            />
            <DayView 
              title="Besok" 
              dayName={days[(new Date().getDay() + 1) % 7]} 
              data={scheduleData[days[(new Date().getDay() + 1) % 7]]} 
              isToday={false} 
            />
          </div>
        ) : (
          isAuth ? 
          <AdminPanel data={scheduleData} onSave={() => { fetchData(); setView('home'); }} /> : 
          <AdminLogin onLogin={() => setIsAuth(true)} />
        )}
      </main>
    </div>
  );
}

function DayView({ title, dayName, data, isToday }) {
  if (!data) return (
    <div className="p-8 bg-white rounded-3xl border border-dashed border-slate-200 text-center">
      <p className="text-slate-400 font-medium">Jadwal {dayName} belum diisi admin.</p>
    </div>
  );

  return (
    <div className={`p-6 rounded-3xl shadow-xl transition-all duration-500 ${isToday ? 'bg-indigo-600 text-white' : 'bg-white border border-slate-100'}`}>
      <div className="flex justify-between items-start mb-4">
        <div>
          <p className={`text-[10px] font-bold uppercase tracking-widest mb-1 ${isToday ? 'text-indigo-200' : 'text-indigo-500'}`}>{title}</p>
          <h2 className="text-3xl font-black">{dayName}</h2>
        </div>
        {isToday && <Sparkles className="text-yellow-300 animate-pulse" />}
      </div>
      <div className="flex flex-wrap gap-2 mb-6">
        {data.subjects?.map((s, i) => (
          <span key={i} className={`px-4 py-1.5 rounded-full text-xs font-bold shadow-sm ${isToday ? 'bg-white/20 text-white' : 'bg-indigo-50 text-indigo-600'}`}>
            {s}
          </span>
        ))}
      </div>
      <div className={`pt-4 border-t ${isToday ? 'border-white/10' : 'border-slate-100'} flex justify-between items-center`}>
        <div className="flex items-center gap-2">
          <User size={14} className="opacity-50" />
          <span className="text-[11px] font-bold uppercase opacity-70">Piket: {data.picket?.join(', ') || '-'}</span>
        </div>
        <div className={`px-3 py-1 rounded-lg ${isToday ? 'bg-white/10' : 'bg-red-50'}`}>
          <span className={`text-[11px] font-black uppercase ${isToday ? 'text-red-200' : 'text-red-500'}`}>Tugas: {data.homework || '-'}</span>
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
    if (form.subjects.length === 0 || form.subjects[0] === "") {
      alert("Mohon isi mata pelajaran!");
      return;
    }
    setSaving(true);
    const { error } = await supabase
      .from('Jadwal')
      .upsert({ hari: day, data: form }, { onConflict: 'hari' });
    
    if (!error) {
      alert('Berhasil Update Cloud!');
      onSave();
    } else {
      alert('Gagal: ' + error.message);
    }
    setSaving(false);
  };

  return (
    <div className="bg-white p-6 rounded-3xl shadow-2xl space-y-4 border border-slate-100 animate-in slide-in-from-bottom-4">
      <h2 className="font-black text-xl text-slate-800 mb-2">Editor Jadwal</h2>
      <div className="space-y-1">
        <label className="text-[10px] font-bold text-slate-400 uppercase ml-1">Pilih Hari</label>
        <select value={day} onChange={(e) => setDay(e.target.value)} className="w-full p-4 bg-slate-50 rounded-2xl font-bold border-none ring-2 ring-indigo-50 outline-none">
          {days.map(d => <option key={d} value={d}>{d}</option>)}
        </select>
      </div>
      <div className="space-y-1">
        <label className="text-[10px] font-bold text-slate-400 uppercase ml-1">Pelajaran (Koma)</label>
        <input className="w-full p-4 bg-slate-50 rounded-2xl outline-none font-medium" placeholder="Contoh: Fisika, Olahraga" value={form.subjects.join(', ')} onChange={e => setForm({...form, subjects: e.target.value.split(',').map(s => s.trim())})} />
      </div>
      <div className="space-y-1">
        <label className="text-[10px] font-bold text-slate-400 uppercase ml-1">Piket (Koma)</label>
        <input className="w-full p-4 bg-slate-50 rounded-2xl outline-none font-medium" placeholder="Nama-nama siswa" value={form.picket.join(', ')} onChange={e => setForm({...form, picket: e.target.value.split(',').map(s => s.trim())})} />
      </div>
      <div className="space-y-1">
        <label className="text-[10px] font-bold text-slate-400 uppercase ml-1">Tugas / PR</label>
        <input className="w-full p-4 bg-slate-50 rounded-2xl outline-none font-medium" placeholder="Tulis info tugas" value={form.homework} onChange={e => setForm({...form, homework: e.target.value})} />
      </div>
      <button onClick={handleUpdate} disabled={saving} className="w-full py-4 bg-indigo-600 text-white rounded-2xl font-black shadow-lg shadow-indigo-200 transition-all active:scale-95">
        {saving ? 'Sinkronisasi...' : 'SIMPAN KE CLOUD'}
      </button>
    </div>
  );
}

function AdminLogin({ onLogin }) {
  const [p, setP] = useState('');
  return (
    <div className="bg-white p-8 rounded-3xl shadow-2xl text-center space-y-4 border border-slate-100">
      <div className="w-16 h-16 bg-indigo-50 rounded-2xl flex items-center justify-center mx-auto text-indigo-600 mb-2">
        <Lock size={32} />
      </div>
      <h2 className="font-black text-xl text-slate-800">Login Admin</h2>
      <input type="password" value={p} onChange={e => setP(e.target.value)} className="w-full p-4 bg-slate-50 rounded-2xl text-center font-black tracking-widest border-none outline-none focus:ring-2 focus:ring-indigo-100" placeholder="••••••••" />
      <button onClick={() => p === 'TKJ2025' ? onLogin() : alert('Password Salah!')} className="w-full py-4 bg-slate-900 text-white rounded-2xl font-black shadow-xl transition-all active:scale-95">MASUK ADMIN</button>
    </div>
  );
              }
      
