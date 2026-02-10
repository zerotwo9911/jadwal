import React, { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import { Bell, Book, Edit3, Save, Calendar, User, CheckCircle, AlertCircle, Sparkles, Lock, LogIn, Share2, MessageCircle, Copy } from 'lucide-react';

// --- KONFIGURASI SUPABASE KAMU ---
const SUPABASE_URL = 'https://czgmoblnjmlcxpni jnpi.supabase.co'; 
const SUPABASE_KEY = 'Sb_publishable_HY7yoPZvIqM6FBMPkCo_TA_5bUeIE9K'; // Ini Anon Key kamu
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

  // Ambil data dari Supabase saat aplikasi dibuka
  useEffect(() => {
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
        console.error("Error fetching data:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleAdminClick = () => {
    if (view === 'home') setView('admin');
    else { setView('home'); setIsAuthenticated(false); }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-indigo-50">
        <div className="animate-bounce bg-indigo-600 p-4 rounded-full text-white shadow-xl">
          <Calendar size={32} />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-indigo-50 to-purple-50 text-slate-800 font-sans pb-24 selection:bg-indigo-100">
      <nav className="fixed top-0 inset-x-0 z-30 bg-white/70 backdrop-blur-xl border-b border-white/20 shadow-sm">
        <div className="max-w-lg mx-auto px-4 py-3 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="bg-indigo-600 p-2 rounded-xl text-white shadow-lg"><Calendar size={20} /></div>
            <div>
              <h1 className="text-lg font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600">Kelas Kita</h1>
              <p className="text-[10px] text-slate-500 font-medium uppercase tracking-wider">Cloud Synchronized</p>
            </div>
          </div>
          <button onClick={handleAdminClick} className={`px-4 py-2 rounded-full text-xs font-bold transition-all duration-300 shadow-md ${view === 'admin' ? 'bg-slate-800 text-white' : 'bg-white text-indigo-600 border border-indigo-100'}`}>
            {view === 'home' ? 'Edit Jadwal' : 'Tutup Admin'}
          </button>
        </div>
      </nav>

      <main className="max-w-lg mx-auto px-4 pt-24 space-y-6">
        {view === 'home' && (
          <>
            <div className="flex justify-between items-end mb-2">
              <div><p className="text-slate-500 text-sm">Selamat Datang,</p><h2 className="text-2xl font-bold text-slate-800">Jadwal Sekolah</h2></div>
              <p className="text-xs font-semibold text-indigo-500 bg-indigo-50 px-2 py-1 rounded-lg">
                {new Date().toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'short'})}
              </p>
            </div>
            <DayCard title="Hari Ini" dayName={days[currentDayIndex]} data={scheduleData[days[currentDayIndex]]} isToday={true} />
            <div className="flex items-center gap-4 py-2"><div className="h-px bg-slate-200 flex-1"></div><span className="text-xs text-slate-400 font-medium uppercase tracking-widest">Selanjutnya</span><div className="h-px bg-slate-200 flex-1"></div></div>
            <DayCard title="Besok" dayName={days[(currentDayIndex + 1) % 7]} data={scheduleData[days[(currentDayIndex + 1) % 7]]} isToday={false} />
          </>
        )}

        {view === 'admin' && (
          isAuthenticated ? 
          <AdminPanel data={scheduleData} setData={setScheduleData} days={days} /> : 
          <AdminLogin onLogin={() => setIsAuthenticated(true)} />
        )}
      </main>
    </div>
  );
}

// --- KOMPONEN KARTU ---
const DayCard = ({ title, dayName, data, isToday }) => {
  if (!data) return null;
  return (
    <div className={`relative rounded-3xl p-6 transition-all duration-500 hover:scale-[1.02] ${isToday ? "bg-gradient-to-br from-indigo-600 to-purple-700 text-white shadow-xl shadow-indigo-200" : "bg-white/80 backdrop-blur-xl text-slate-600 border border-white shadow-lg"}`}>
      <div className="flex justify-between items-start mb-6">
        <div><div className={`text-xs font-bold uppercase tracking-wider mb-1 ${isToday ? 'text-indigo-200' : 'text-indigo-500'}`}>{title}</div><h2 className="text-3xl font-bold tracking-tight">{dayName}</h2></div>
        {isToday && <Sparkles className="text-yellow-300 opacity-80" />}
      </div>
      <div className="mb-6">
        <div className={`flex items-center gap-2 mb-3 text-sm font-semibold ${isToday ? 'text-indigo-100' : 'text-slate-400'}`}><Book size={16} /> Mata Pelajaran</div>
        <div className="flex flex-wrap gap-2">
          {data.subjects.map((sub, i) => (
            <span key={i} className={`px-4 py-1.5 text-sm rounded-full font-medium ${isToday ? "bg-white/20 text-white border border-white/20" : "bg-indigo-50 text-indigo-600 border border-indigo-100"}`}>{sub}</span>
          ))}
        </div>
      </div>
      <div className={`grid grid-cols-2 gap-4 pt-4 border-t ${isToday ? 'border-white/20' : 'border-slate-100'}`}>
        <div><div className={`flex items-center gap-1.5 text-xs font-bold uppercase tracking-wide mb-1 ${isToday ? 'text-indigo-200' : 'text-slate-400'}`}><User size={14} /> Piket</div><div className="text-sm font-medium">{data.picket.join(', ') || '-'}</div></div>
        <div className={`rounded-xl p-3 ${isToday ? 'bg-white/10' : 'bg-red-50'}`}>
          <div className={`flex items-center gap-1.5 text-xs font-bold uppercase tracking-wide mb-1 ${isToday ? 'text-red-200' : 'text-red-500'}`}><AlertCircle size={14} /> Tugas</div>
          <p className="text-xs font-medium leading-relaxed">{data.homework || "Tidak ada tugas."}</p>
        </div>
      </div>
    </div>
  );
};

// --- PANEL ADMIN ---
const AdminPanel = ({ data, setData, days }) => {
  const [selectedDay, setSelectedDay] = useState('Senin');
  const [formData, setFormData] = useState(data['Senin']);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => { setFormData(data[selectedDay]); }, [selectedDay, data]);

  const handleSave = async () => {
    setIsSaving(true);
    const { error } = await supabase
      .from('Jadwal_kelas')
      .upsert({ hari: selectedDay, data: formData }, { onConflict: 'hari' });

    if (!error) {
      setData(prev => ({ ...prev, [selectedDay]: formData }));
      alert(`Jadwal hari ${selectedDay} berhasil diperbarui untuk seluruh kelas!`);
    } else {
      alert("Gagal menyimpan: " + error.message);
    }
    setIsSaving(false);
  };

  return (
    <div className="bg-white/80 backdrop-blur-xl rounded-3xl p-6 shadow-xl border border-white space-y-6 animate-in slide-in-from-bottom-4">
      <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
        {days.map(day => (
          <button key={day} onClick={() => setSelectedDay(day)} className={`px-4 py-2 rounded-full text-sm font-bold transition-all duration-300 ${selectedDay === day ? 'bg-indigo-600 text-white shadow-lg' : 'bg-slate-100 text-slate-500'}`}>{day}</button>
        ))}
      </div>
      <div className="space-y-4">
        <div><label className="text-xs font-bold text-slate-400 uppercase ml-1">Mata Pelajaran (pisahkan koma)</label>
        <textarea className="w-full p-4 mt-1 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-indigo-500 font-medium" rows="3" value={formData.subjects.join(', ')} onChange={(e) => setFormData({...formData, subjects: e.target.value.split(',').map(s=>s.trim())})} /></div>
        <div><label className="text-xs font-bold text-slate-400 uppercase ml-1">Petugas Piket (pisahkan koma)</label>
        <input className="w-full p-4 mt-1 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-indigo-500 font-medium" type="text" value={formData.picket.join(', ')} onChange={(e) => setFormData({...formData, picket: e.target.value.split(',').map(s=>s.trim())})} /></div>
        <div><label className="text-xs font-bold text-slate-400 uppercase ml-1">Tugas / PR</label>
        <input className="w-full p-4 mt-1 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-indigo-500 font-medium" type="text" value={formData.homework} onChange={(e) => setFormData({...formData, homework: e.target.value})} /></div>
      </div>
      <button onClick={handleSave} disabled={isSaving} className={`w-full py-4 rounded-xl font-bold text-white flex justify-center items-center gap-2 transition-all shadow-lg ${isSaving ? 'bg-green-500 shadow-green-200' : 'bg-slate-900 active:scale-95 shadow-slate-300'}`}>
        {isSaving ? "Sinkronisasi Cloud..." : <><Save size={20}/> Simpan & Update Publik</>}
      </button>
    </div>
  );
};

// --- LOGIN ADMIN ---
const AdminLogin = ({ onLogin }) => {
  const [password, setPassword] = useState('');
  const handleSubmit = (e) => { e.preventDefault(); if (password === 'TKJ2025') onLogin(); else alert('Password Salah!'); };
  return (
    <div className="bg-white/80 backdrop-blur-xl rounded-3xl p-8 shadow-xl text-center animate-in zoom-in">
      <div className="bg-slate-100 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 text-slate-600"><Lock size={32} /></div>
      <h2 className="text-xl font-bold mb-2 text-slate-800">Akses Admin Pusat</h2>
      <p className="text-slate-500 text-sm mb-6">Gunakan password untuk mengubah jadwal kelas.</p>
      <form onSubmit={handleSubmit} className="space-y-4">
        <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Password..." className="w-full p-4 bg-slate-50 border-none rounded-xl text-center font-bold tracking-widest focus:ring-2 focus:ring-indigo-500" autoFocus />
        <button type="submit" className="w-full bg-slate-900 text-white font-bold py-4 rounded-xl flex justify-center items-center gap-2 hover:bg-slate-800 transition-all shadow-lg"><LogIn size={18} /> Masuk</button>
      </form>
    </div>
  );
};
           <div className="absolute bottom-0 left-0 -ml-8 -mb-8 w-24 h-24 bg-purple-500/30 rounded-full blur-xl"></div>
        </>
      )}

      <div className="relative z-10">
        <div className="flex justify-between items-start mb-6">
          <div>
            <div className={`text-xs font-bold uppercase tracking-wider mb-1 ${isToday ? 'text-indigo-200' : 'text-indigo-500'}`}>{title}</div>
            <h2 className="text-3xl font-bold tracking-tight">{dayName}</h2>
          </div>
          {isToday && <Sparkles className="text-yellow-300 opacity-80" />}
        </div>
        
        {/* Subjects */}
        <div className="mb-6">
          <div className={`flex items-center gap-2 mb-3 text-sm font-semibold ${isToday ? 'text-indigo-100' : 'text-slate-400'}`}>
            <Book size={16} /> Mata Pelajaran
          </div>
          <div className="flex flex-wrap gap-2">
            {data.subjects.length > 0 ? (
              data.subjects.map((sub, idx) => (
                <span key={idx} className={`px-4 py-1.5 text-sm rounded-full font-medium shadow-sm ${subPillStyle}`}>
                  {sub}
                </span>
              ))
            ) : <span className="opacity-60 italic text-sm">Tidak ada pelajaran</span>}
          </div>
        </div>

        {/* Footer Info (Piket & PR) */}
        <div className={`grid grid-cols-2 gap-4 pt-4 border-t ${isToday ? 'border-white/20' : 'border-slate-100'}`}>
          
          {/* Piket - LANGSUNG NAMA */}
          <div className="flex flex-col gap-2">
            <div className={`flex items-center gap-1.5 text-xs font-bold uppercase tracking-wide ${isToday ? 'text-indigo-200' : 'text-slate-400'}`}>
              <User size={14} /> Piket
            </div>
            
            <div className={`text-sm font-medium leading-relaxed ${isToday ? 'text-indigo-50' : 'text-slate-700'}`}>
               {data.picket.length > 0 ? data.picket.join(', ') : '-'}
            </div>
          </div>

          {/* PR / Info */}
          <div className={`rounded-xl p-3 ${isToday ? 'bg-white/10' : 'bg-red-50'}`}>
             <div className={`flex items-center gap-1.5 text-xs font-bold uppercase tracking-wide mb-1 ${isToday ? 'text-red-200' : 'text-red-500'}`}>
              <AlertCircle size={14} /> Tugas / PR
            </div>
            <p className={`text-xs leading-relaxed font-medium ${isToday ? 'text-white' : 'text-slate-700'}`}>
              {data.homework || "Tidak ada tugas."}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

// Modern Admin Panel with WA Feature
const AdminPanel = ({ data, setData, days }) => {
  const [selectedDay, setSelectedDay] = useState('Senin');
  const [formData, setFormData] = useState(data['Senin']);
  const [isSaving, setIsSaving] = useState(false);
  const [waNote, setWaNote] = useState('');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    setFormData(data[selectedDay]);
    setWaNote(''); // Reset note when day changes
  }, [selectedDay, data]);

  const handleSave = () => {
    setIsSaving(true);
    setData(prev => ({ ...prev, [selectedDay]: formData }));
    setTimeout(() => setIsSaving(false), 800);
  };

  // Logic Generate Text WA
  const generateWAMessage = () => {
    const subjectsList = formData.subjects.length > 0 ? formData.subjects.map(s => `• ${s}`).join('\n') : '- Tidak ada mata pelajaran';
    const picketList = formData.picket.length > 0 ? formData.picket.map(p => `• ${p}`).join('\n') : '- Tidak ada piket';
    const homeworkText = formData.homework ? formData.homework : 'Tidak ada PR';
    
    // Auto-detect "Besok" or "Hari Ini" for clarity in message
    const todayIndex = new Date().getDay();
    const selectedDayIndex = days.indexOf(selectedDay);
    let dayLabel = selectedDay;
    if (selectedDayIndex === (todayIndex + 1) % 7) dayLabel += ' (Besok)';
    
    return `*🔔 INFO KELAS - ${dayLabel.toUpperCase()}*\n` +
           `--------------------------\n\n` +
           `*📚 JADWAL PELAJARAN:*\n${subjectsList}\n\n` +
           `*🧹 PETUGAS PIKET:*\n${picketList}\n\n` +
           `*📝 PR / TUGAS:*\n${homeworkText}\n\n` +
           (waNote ? `*📢 INFO TAMBAHAN:*\n_${waNote}_\n\n` : '') +
           `--------------------------\n` +
           `Semangat belajar! 💪`;
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(generateWAMessage());
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSendWA = () => {
    const text = generateWAMessage();
    const url = `https://wa.me/?text=${encodeURIComponent(text)}`;
    window.open(url, '_blank');
  };

  return (
    <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-xl shadow-slate-200/50 border border-white overflow-hidden animate-in slide-in-from-bottom-4 duration-500 mb-10">
      <div className="p-6 pb-4 border-b border-slate-100">
        <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
          <Edit3 className="text-indigo-600" size={24}/> 
          Editor Jadwal
        </h2>
        <p className="text-slate-500 text-sm mt-1">Sesuaikan jadwal kelas dengan mudah.</p>
      </div>

      <div className="p-6 pt-4 space-y-6">
        {/* Day Selector Pills */}
        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide snap-x">
          {days.map(day => (
            <button
              key={day}
              onClick={() => setSelectedDay(day)}
              className={`snap-center px-4 py-2 rounded-full text-sm font-semibold whitespace-nowrap transition-all duration-300 ${
                selectedDay === day 
                  ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200 transform scale-105' 
                  : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
              }`}
            >
              {day}
            </button>
          ))}
        </div>

        <div className="space-y-5">
          <InputGroup 
            label="Mata Pelajaran" 
            desc="Pisahkan dengan koma"
            icon={<Book size={16} />}
            value={formData.subjects.join(', ')}
            onChange={(e) => setFormData({...formData, subjects: e.target.value.split(',').map(s=>s.trim())})}
            placeholder="Matematika, Fisika, ..."
            isArea
          />

          <InputGroup 
            label="Petugas Piket" 
            desc="Daftar nama siswa"
            icon={<User size={16} />}
            value={formData.picket.join(', ')}
            onChange={(e) => setFormData({...formData, picket: e.target.value.split(',').map(s=>s.trim())})}
            placeholder="Andi, Budi, ..."
          />

          <InputGroup 
            label="Catatan / PR" 
            desc="Tugas rumah atau pengumuman"
            icon={<AlertCircle size={16} />}
            value={formData.homework}
            onChange={(e) => setFormData({...formData, homework: e.target.value})}
            placeholder="Kerjakan Halaman 10..."
            color="red"
          />
        </div>

        <button 
          onClick={handleSave}
          disabled={isSaving}
          className={`w-full py-4 rounded-xl font-bold text-white flex justify-center items-center gap-2 transition-all duration-300 transform active:scale-95 shadow-lg ${
            isSaving ? 'bg-green-500 shadow-green-200' : 'bg-slate-900 hover:bg-slate-800 shadow-slate-300'
          }`}
        >
          {isSaving ? <CheckCircle size={20}/> : <Save size={20}/>}
          {isSaving ? 'Tersimpan!' : 'Simpan Perubahan'}
        </button>

        {/* NEW SECTION: WA BROADCAST */}
        <div className="mt-8 pt-6 border-t-2 border-slate-100 border-dashed">
            <h3 className="font-bold text-slate-700 mb-2 flex items-center gap-2">
                <Share2 className="text-green-600" size={20} /> 
                Kirim Jadwal ke WA
            </h3>
            <p className="text-xs text-slate-500 mb-4">
                Kirim data hari <b>{selectedDay}</b> ke grup kelas. 
                <span className="italic"> (Edit data di atas, lalu kirim di sini)</span>
            </p>

            {/* Preview Box */}
            <div className="bg-slate-100 p-4 rounded-xl border border-slate-200 mb-4">
                <div className="flex justify-between items-center mb-2">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Preview Pesan</span>
                </div>
                <div className="text-[11px] font-mono leading-relaxed text-slate-600 whitespace-pre-wrap bg-white p-3 rounded-lg border border-slate-200">
                    {generateWAMessage()}
                </div>
            </div>

            {/* Optional Note */}
            <input 
                type="text"
                placeholder="Tambah info tambahan untuk WA (opsional)..."
                value={waNote}
                onChange={(e) => setWaNote(e.target.value)}
                className="w-full p-3 mb-4 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-green-500 focus:outline-none transition-all"
            />

            {/* Action Buttons */}
            <div className="grid grid-cols-2 gap-3">
                <button 
                    onClick={handleCopy}
                    className="flex items-center justify-center gap-2 py-3 rounded-xl bg-slate-200 text-slate-700 font-bold text-sm hover:bg-slate-300 transition-all active:scale-95"
                >
                    {copied ? <CheckCircle size={16} /> : <Copy size={16} />}
                    {copied ? 'Disalin' : 'Salin Teks'}
                </button>
                <button 
                    onClick={handleSendWA}
                    className="flex items-center justify-center gap-2 py-3 rounded-xl bg-green-500 text-white font-bold text-sm hover:bg-green-600 shadow-lg shadow-green-200 transition-all active:scale-95"
                >
                    <MessageCircle size={16} />
                    Kirim ke WA
                </button>
            </div>
        </div>

      </div>
    </div>
  );
};

// Helper Input Component
const InputGroup = ({ label, desc, icon, value, onChange, placeholder, isArea, color = "indigo" }) => (
  <div className="group">
    <label className="flex justify-between items-center text-xs font-bold text-slate-500 uppercase mb-2 ml-1">
      <span className="flex items-center gap-1.5">{icon} {label}</span>
      <span className="text-[10px] font-normal text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full">{desc}</span>
    </label>
    <div className={`relative transition-all duration-300 focus-within:transform focus-within:-translate-y-1`}>
      {isArea ? (
        <textarea
          className={`w-full p-4 text-sm bg-slate-50 border-2 border-transparent rounded-2xl focus:bg-white focus:border-${color}-500 focus:ring-4 focus:ring-${color}-100 outline-none transition-all placeholder:text-slate-300 text-slate-700 font-medium`}
          rows="3"
          value={value}
          onChange={onChange}
          placeholder={placeholder}
        />
      ) : (
        <input
          type="text"
          className={`w-full p-4 text-sm bg-slate-50 border-2 border-transparent rounded-2xl focus:bg-white focus:border-${color}-500 focus:ring-4 focus:ring-${color}-100 outline-none transition-all placeholder:text-slate-300 text-slate-700 font-medium`}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
        />
      )}
    </div>
  </div>

);
