import React, { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import { Bell, Book, Edit3, Save, Calendar, User, CheckCircle, AlertCircle, Sparkles, Lock, LogIn, Share2, MessageCircle, Copy } from 'lucide-react';

// --- KONFIGURASI SUPABASE ---
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
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const { data, error } = await supabase.from('Jadwal_kelas').select('*');
      if (data && data.length > 0) {
        const merged = { ...defaultData };
        data.forEach(item => {
          merged[item.hari] = item.data;
        });
        setScheduleData(merged);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleAdminClick = () => {
    if (view === 'home') setView('admin');
    else { setView('home'); setIsAuthenticated(false); }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-indigo-50">
        <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-indigo-50 to-purple-50 text-slate-800 pb-24">
      <nav className="fixed top-0 inset-x-0 z-30 bg-white/70 backdrop-blur-xl border-b border-white/20 shadow-sm">
        <div className="max-w-lg mx-auto px-4 py-3 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="bg-indigo-600 p-2 rounded-xl text-white shadow-lg"><Calendar size={20} /></div>
            <div><h1 className="text-lg font-bold">Kelas Kita</h1><p className="text-[10px] text-slate-500 uppercase">Cloud Sync</p></div>
          </div>
          <button onClick={handleAdminClick} className="px-4 py-2 rounded-full text-xs font-bold bg-white text-indigo-600 border border-indigo-100 shadow-sm">
            {view === 'home' ? 'Edit Jadwal' : 'Tutup Admin'}
          </button>
        </div>
      </nav>

      <main className="max-w-lg mx-auto px-4 pt-24 space-y-6">
        {view === 'home' ? (
          <>
            <div className="flex justify-between items-end mb-2">
              <div><p className="text-slate-500 text-sm">Selamat Datang,</p><h2 className="text-2xl font-bold text-slate-800">Jadwal Sekolah</h2></div>
              <p className="text-xs font-semibold text-indigo-500 bg-indigo-50 px-2 py-1 rounded-lg">
                {new Date().toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'short' })}
              </p>
            </div>
            <DayCard title="Hari Ini" dayName={days[currentDayIndex]} data={scheduleData[days[currentDayIndex]]} isToday={true} />
            <div className="flex items-center gap-4 py-2"><div className="h-px bg-slate-200 flex-1"></div><span className="text-xs text-slate-400 font-medium uppercase tracking-widest">Selanjutnya</span><div className="h-px bg-slate-200 flex-1"></div></div>
            <DayCard title="Besok" dayName={days[(currentDayIndex + 1) % 7]} data={scheduleData[days[(currentDayIndex + 1) % 7]]} isToday={false} />
          </>
        ) : (
          isAuthenticated ? <AdminPanel data={scheduleData} setData={setScheduleData} days={days} onSaveSuccess={fetchData} /> : <AdminLogin onLogin={() => setIsAuthenticated(true)} />
        )}
      </main>
    </div>
  );
}

const DayCard = ({ title, dayName, data, isToday }) => {
  if (!data) return null;
  return (
    <div className={`relative rounded-3xl p-6 transition-all duration-500 ${isToday ? "bg-gradient-to-br from-indigo-600 to-purple-700 text-white shadow-xl" : "bg-white/80 backdrop-blur-xl text-slate-600 border border-white shadow-lg"}`}>
      <div className="flex justify-between items-start mb-6">
        <div><div className={`text-xs font-bold uppercase mb-1 ${isToday ? 'text-indigo-200' : 'text-indigo-500'}`}>{title}</div><h2 className="text-3xl font-bold">{dayName}</h2></div>
        {isToday && <Sparkles className="text-yellow-300" />}
      </div>
      <div className="mb-6">
        <div className={`flex items-center gap-2 mb-3 text-sm font-semibold ${isToday ? 'text-indigo-100' : 'text-slate-400'}`}><Book size={16} /> Mata Pelajaran</div>
        <div className="flex flex-wrap gap-2">
          {data.subjects.map((sub, idx) => (
            <span key={idx} className={`px-4 py-1.5 text-sm rounded-full font-medium ${isToday ? "bg-white/20 text-white" : "bg-indigo-50 text-indigo-600"}`}>{sub}</span>
          ))}
        </div>
      </div>
      <div className={`grid grid-cols-2 gap-4 pt-4 border-t ${isToday ? 'border-white/20' : 'border-slate-100'}`}>
        <div><div className="text-xs font-bold uppercase mb-1 flex items-center gap-1.5"><User size={14}/> Piket</div><div className="text-sm font-medium">{data.picket.join(', ') || '-'}</div></div>
        <div className={`rounded-xl p-3 ${isToday ? 'bg-white/10' : 'bg-red-50'}`}>
          <div className={`text-xs font-bold uppercase mb-1 flex items-center gap-1.5 ${isToday ? 'text-red-200' : 'text-red-500'}`}><AlertCircle size={14}/> Tugas</div>
          <p className="text-xs font-medium">{data.homework || "Tidak ada tugas."}</p>
        </div>
      </div>
    </div>
  );
};

const AdminPanel = ({ data, setData, days, onSaveSuccess }) => {
  const [selectedDay, setSelectedDay] = useState('Senin');
  const [formData, setFormData] = useState(data['Senin']);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => { setFormData(data[selectedDay]); }, [selectedDay, data]);

  const handleSave = async () => {
    setIsSaving(true);
    const { error } = await supabase.from('Jadwal_kelas').upsert({ hari: selectedDay, data: formData }, { onConflict: 'hari' });
    if (!error) {
      setData(prev => ({ ...prev, [selectedDay]: formData }));
      onSaveSuccess();
      alert("Berhasil diperbarui untuk semua orang!");
    } else {
      alert("Error: " + error.message);
    }
    setIsSaving(false);
  };

  return (
    <div className="bg-white/80 backdrop-blur-xl rounded-3xl p-6 shadow-xl border border-white space-y-6">
      <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
        {days.map(day => (
          <button key={day} onClick={() => setSelectedDay(day)} className={`px-4 py-2 rounded-full text-sm font-bold ${selectedDay === day ? 'bg-indigo-600 text-white shadow-lg' : 'bg-slate-100 text-slate-500'}`}>{day}</button>
        ))}
      </div>
      <div className="space-y-4">
        <div><label className="text-xs font-bold text-slate-500 uppercase">Mata Pelajaran (koma)</label>
        <textarea className="w-full p-4 mt-1 bg-slate-50 rounded-2xl border-none focus:ring-2 focus:ring-indigo-500 font-medium" rows="3" value={formData.subjects.join(', ')} onChange={(e) => setFormData({...formData, subjects: e.target.value.split(',').map(s=>s.trim())})} /></div>
        <div><label className="text-xs font-bold text-slate-500 uppercase">Piket (koma)</label>
        <input className="w-full p-4 mt-1 bg-slate-50 rounded-2xl border-none focus:ring-2 focus:ring-indigo-500 font-medium" type="text" value={formData.picket.join(', ')} onChange={(e) => setFormData({...formData, picket: e.target.value.split(',').map(s=>s.trim())})} /></div>
        <div><label className="text-xs font-bold text-slate-500 uppercase">Tugas / PR</label>
        <input className="w-full p-4 mt-1 bg-slate-50 rounded-2xl border-none focus:ring-2 focus:ring-indigo-500 font-medium" type="text" value={formData.homework} onChange={(e) => setFormData({...formData, homework: e.target.value})} /></div>
      </div>
      <button onClick={handleSave} disabled={isSaving} className="w-full py-4 bg-slate-900 text-white rounded-xl font-bold flex justify-center items-center gap-2 active:scale-95 transition-all">
        {isSaving ? "Sinkronisasi..." : <><Save size={20}/> Simpan & Sinkronkan</>}
      </button>
    </div>
  );
};

const AdminLogin = ({ onLogin }) => {
  const [pw, setPw] = useState('');
  const handleSubmit = (e) => { e.preventDefault(); if(pw === 'TKJ2025') onLogin(); else alert('Password Salah!'); };
  return (
    <div className="bg-white/80 p-8 rounded-3xl shadow-xl text-center space-y-4">
      <div className="bg-slate-100 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto text-slate-600"><Lock size={32} /></div>
      <h2 className="text-xl font-bold text-slate-800">Admin Pusat</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <input type="password" value={pw} onChange={(e) => setPw(e.target.value)} placeholder="Password..." className="w-full p-4 bg-slate-50 rounded-xl text-center font-bold tracking-widest" autoFocus />
        <button type="submit" className="w-full bg-slate-900 text-white font-bold py-4 rounded-xl flex justify-center items-center gap-2 hover:bg-slate-800 transition-all shadow-lg"><LogIn size={18} /> Masuk</button>
      </form>
    </div>
  );
};
                                                                                       
