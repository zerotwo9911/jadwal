import React, { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import { Bell, Book, Edit3, Save, Calendar, User, CheckCircle, AlertCircle, Sparkles, Lock, LogIn, Share2, MessageCircle, Copy } from 'lucide-react';

const SUPABASE_URL = 'https://czgmoblnjmlcxpnijnpi.supabase.co'; 
const SUPABASE_KEY = 'Sb_publishable_HY7yoPZvIqM6FBMPkCo_TA_5bUeIE9K'; 
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

const defaultData = {
  Senin: { subjects: ['Upacara', 'Matematika', 'B. Indonesia', 'Fisika'], picket: ['Ahmad', 'Budi', 'Citra'], homework: '' },
  Selasa: { subjects: ['Olahraga', 'B. Inggris', 'Kimia', 'Sejarah'], picket: ['Dedi', 'Eka', 'Fani'], homework: '' },
  Rabu: { subjects: ['Seni Budaya', 'Matematika', 'Biologi'], picket: ['Gita', 'Hadi', 'Indah'], homework: '' },
  Kamis: { subjects: ['B. Jawa', 'Agama', 'PKN'], picket: ['Joko', 'Kiki', 'Lina'], homework: '' },
  Jumat: { subjects: ['Senam', 'Pramuka', 'TIK'], picket: ['Mina', 'Nino', 'Oki'], homework: '' },
  Sabtu: { subjects: ['Ekskul Pilihan'], picket: ['Putri', 'Qori', 'Rian'], homework: '' },
  Minggu: { subjects: ['Libur'], picket: [], homework: '' },
};

const days = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];

export default function App() {
  const [scheduleData, setScheduleData] = useState(defaultData);
  const [view, setView] = useState('home');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentDayIndex] = useState(new Date().getDay());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const { data, error } = await supabase.from('Jadwal_kelas').select('*');
        if (data && data.length > 0) {
          const merged = { ...defaultData };
          data.forEach(item => { merged[item.hari] = item.data; });
          setScheduleData(merged);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-indigo-50 font-sans text-indigo-600 font-bold">Memuat Jadwal...</div>;

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 pb-24 font-sans">
      <nav className="fixed top-0 inset-x-0 z-30 bg-white/80 backdrop-blur-md border-b border-slate-200 px-4 py-3">
        <div className="max-w-lg mx-auto flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Calendar className="text-indigo-600" size={24} />
            <h1 className="font-bold text-lg">Kelas Kita</h1>
          </div>
          <button onClick={() => setView(view === 'home' ? 'admin' : 'home')} className="text-xs font-bold px-4 py-2 bg-indigo-600 text-white rounded-full">
            {view === 'home' ? 'Menu Admin' : 'Kembali'}
          </button>
        </div>
      </nav>

      <main className="max-w-lg mx-auto px-4 pt-20">
        {view === 'home' ? (
          <div className="space-y-6">
            <DayCard title="Hari Ini" dayName={days[currentDayIndex]} data={scheduleData[days[currentDayIndex]]} isToday={true} />
            <DayCard title="Besok" dayName={days[(currentDayIndex + 1) % 7]} data={scheduleData[days[(currentDayIndex + 1) % 7]]} isToday={false} />
          </div>
        ) : (
          isAuthenticated ? <AdminPanel data={scheduleData} setData={setScheduleData} /> : <AdminLogin onLogin={() => setIsAuthenticated(true)} />
        )}
      </main>
    </div>
  );
}

function DayCard({ title, dayName, data, isToday }) {
  return (
    <div className={`p-6 rounded-3xl shadow-lg ${isToday ? 'bg-indigo-600 text-white' : 'bg-white border border-slate-100'}`}>
      <p className={`text-xs font-bold uppercase mb-1 ${isToday ? 'text-indigo-200' : 'text-indigo-500'}`}>{title}</p>
      <h2 className="text-3xl font-bold mb-4">{dayName}</h2>
      <div className="space-y-4">
        <div>
          <p className="text-xs font-bold opacity-70 mb-2 uppercase tracking-widest">Pelajaran</p>
          <div className="flex flex-wrap gap-2">
            {data.subjects.map((s, i) => <span key={i} className={`px-3 py-1 rounded-full text-sm font-medium ${isToday ? 'bg-white/20' : 'bg-slate-100'}`}>{s}</span>)}
          </div>
        </div>
        <div className="pt-4 border-t border-white/10 flex justify-between">
          <div><p className="text-[10px] uppercase font-bold opacity-60">Piket</p><p className="text-sm font-medium">{data.picket.join(', ')}</p></div>
          <div><p className="text-[10px] uppercase font-bold opacity-60">Tugas</p><p className="text-sm font-medium">{data.homework || '-'}</p></div>
        </div>
      </div>
    </div>
  );
}

function AdminPanel({ data, setData }) {
  const [day, setDay] = useState('Senin');
  const [form, setForm] = useState(data['Senin']);

  useEffect(() => { setForm(data[day]); }, [day, data]);

  const save = async () => {
    const { error } = await supabase.from('Jadwal_kelas').upsert({ hari: day, data: form }, { onConflict: 'hari' });
    if (!error) { setData({ ...data, [day]: form }); alert('Berhasil!'); }
  };

  return (
    <div className="bg-white p-6 rounded-3xl shadow-xl space-y-4 border border-slate-100">
      <select value={day} onChange={(e) => setDay(e.target.value)} className="w-full p-3 bg-slate-50 rounded-xl border-none font-bold">
        {days.map(d => <option key={d} value={d}>{d}</option>)}
      </select>
      <input className="w-full p-4 bg-slate-50 rounded-xl" placeholder="Pelajaran (koma)" value={form.subjects.join(', ')} onChange={e => setForm({...form, subjects: e.target.value.split(',')})} />
      <input className="w-full p-4 bg-slate-50 rounded-xl" placeholder="Piket (koma)" value={form.picket.join(', ')} onChange={e => setForm({...form, picket: e.target.value.split(',')})} />
      <input className="w-full p-4 bg-slate-50 rounded-xl" placeholder="PR / Tugas" value={form.homework} onChange={e => setForm({...form, homework: e.target.value})} />
      <button onClick={save} className="w-full py-4 bg-indigo-600 text-white rounded-xl font-bold">Simpan Publik</button>
    </div>
  );
}

function AdminLogin({ onLogin }) {
  const [p, setP] = useState('');
  return (
    <div className="bg-white p-8 rounded-3xl shadow-xl text-center space-y-4 border border-slate-100">
      <h2 className="font-bold text-xl">Login Admin</h2>
      <input type="password" value={p} onChange={e => setP(e.target.value)} className="w-full p-4 bg-slate-50 rounded-xl text-center" placeholder="Password" />
      <button onClick={() => p === 'TKJ2025' ? onLogin() : alert('Salah')} className="w-full py-4 bg-slate-900 text-white rounded-xl font-bold">Masuk</button>
    </div>
  );
        }
