Import React, { useState, useEffect } from 'react';
import { Bell, Book, Trash2, Edit3, Save, Calendar, Clock, User, CheckCircle, AlertCircle, ChevronRight, Sparkles, Lock, LogIn, Share2, MessageCircle, Copy, ExternalLink } from 'lucide-react';

// Data awal (Default)
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
  const [scheduleData, setScheduleData] = useState(() => {
    const saved = localStorage.getItem('classSchedule');
    return saved ? JSON.parse(saved) : defaultData;
  });
  
  const [view, setView] = useState('home'); // home, admin
  const [isAuthenticated, setIsAuthenticated] = useState(false); // Status login admin
  const [currentDayIndex, setCurrentDayIndex] = useState(new Date().getDay());
  const [showNotification, setShowNotification] = useState(false);
  const [notificationMsg, setNotificationMsg] = useState('');

  // Simpan ke local storage
  useEffect(() => {
    localStorage.setItem('classSchedule', JSON.stringify(scheduleData));
  }, [scheduleData]);

  // Logic Notifikasi
  useEffect(() => {
    const checkTime = () => {
      const now = new Date();
      if (now.getHours() === 18 && now.getMinutes() === 0) {
        triggerNotification();
      }
    };

    if (Notification.permission !== "granted") Notification.requestPermission();
    const interval = setInterval(checkTime, 60000);
    return () => clearInterval(interval);
  }, [scheduleData]);

  const triggerNotification = () => {
    const tomorrowIndex = (new Date().getDay() + 1) % 7;
    const tomorrowName = days[tomorrowIndex];
    const tomorrowData = scheduleData[tomorrowName];

    const message = `Besok (${tomorrowName}): ${tomorrowData.subjects.slice(0, 2).join(', ')}... Piket: ${tomorrowData.picket.join(', ')}`;
    
    if (Notification.permission === "granted") {
      new Notification("Pengingat Jadwal Besok! 📚", { body: message });
    }
    setNotificationMsg(message);
    setShowNotification(true);
    setTimeout(() => setShowNotification(false), 8000);
  };

  const handleAdminClick = () => {
    if (view === 'home') {
      setView('admin');
    } else {
      setView('home');
      setIsAuthenticated(false); // Logout otomatis saat keluar admin
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-indigo-50 to-purple-50 text-slate-800 font-sans pb-24 selection:bg-indigo-100">
      
      {/* Modern Floating Header */}
      <nav className="fixed top-0 inset-x-0 z-30 bg-white/70 backdrop-blur-xl border-b border-white/20 shadow-sm">
        <div className="max-w-lg mx-auto px-4 py-3 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="bg-indigo-600 p-2 rounded-xl text-white shadow-indigo-200 shadow-lg">
              <Calendar size={20} />
            </div>
            <div>
              <h1 className="text-lg font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600 leading-tight">
                Kelas Kita
              </h1>
              <p className="text-[10px] text-slate-500 font-medium tracking-wide uppercase">Daily Schedule</p>
            </div>
          </div>
          <button 
            onClick={handleAdminClick}
            className={`px-4 py-2 rounded-full text-xs font-bold transition-all duration-300 shadow-md ${
              view === 'admin' 
                ? 'bg-slate-800 text-white shadow-slate-300' 
                : 'bg-white text-indigo-600 border border-indigo-100 hover:shadow-indigo-100'
            }`}
          >
            {view === 'home' ? 'Edit Jadwal' : 'Tutup Admin'}
          </button>
        </div>
      </nav>

      {/* In-App Notification Toast */}
      {showNotification && (
        <div className="fixed top-24 left-4 right-4 z-50 animate-in slide-in-from-top-4 fade-in duration-500">
          <div className="bg-white/90 backdrop-blur-md p-4 rounded-2xl shadow-2xl border-l-4 border-yellow-400 flex gap-3">
            <div className="bg-yellow-100 p-2 rounded-full h-fit text-yellow-600"><Bell size={20}/></div>
            <div>
              <h4 className="font-bold text-slate-800">Pengingat Besok!</h4>
              <p className="text-sm text-slate-600 mt-1">{notificationMsg}</p>
            </div>
          </div>
        </div>
      )}

      <main className="max-w-lg mx-auto px-4 pt-24 space-y-6">
        
        {view === 'home' && (
          <>
            {/* Header Greeting */}
            <div className="flex justify-between items-end mb-2">
              <div>
                <p className="text-slate-500 text-sm">Selamat Datang,</p>
                <h2 className="text-2xl font-bold text-slate-800">Jadwal Sekolah</h2>
              </div>
              <div className="text-right">
                <p className="text-xs font-semibold text-indigo-500 bg-indigo-50 px-2 py-1 rounded-lg">
                  {new Date().toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'short'})}
                </p>
              </div>
            </div>

            {/* Kartu Hari Ini (Highlight) */}
            <DayCard 
              title="Hari Ini" 
              dayName={days[currentDayIndex]} 
              data={scheduleData[days[currentDayIndex]]} 
              isToday={true}
            />

            {/* Divider text */}
            <div className="flex items-center gap-4 py-2">
               <div className="h-px bg-slate-200 flex-1"></div>
               <span className="text-xs text-slate-400 font-medium uppercase tracking-wider">Selanjutnya</span>
               <div className="h-px bg-slate-200 flex-1"></div>
            </div>

            {/* Kartu Besok */}
            <DayCard 
              title="Besok" 
              dayName={days[(currentDayIndex + 1) % 7]} 
              data={scheduleData[days[(currentDayIndex + 1) % 7]]} 
              isToday={false}
            />

             <div className="text-center pt-8 pb-4">
              <button 
                onClick={triggerNotification}
                className="text-slate-400 text-xs hover:text-indigo-500 transition-colors flex items-center justify-center gap-1 mx-auto"
              >
                <Bell size={12} /> Simulasi Notifikasi (Test)
              </button>
            </div>
          </>
        )}

        {view === 'admin' && (
          isAuthenticated ? (
            <AdminPanel 
              data={scheduleData} 
              setData={setScheduleData} 
              days={days}
            />
          ) : (
            <AdminLogin onLogin={() => setIsAuthenticated(true)} />
          )
        )}

      </main>
    </div>
  );
}

// Component Login Admin
const AdminLogin = ({ onLogin }) => {
  const [password, setPassword] = useState('');
  const [error, setError] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (password === 'TKJ2025') {
      onLogin();
    } else {
      setError(true);
      setTimeout(() => setError(false), 2000);
    }
  };

  return (
    <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-xl border border-white p-8 text-center animate-in fade-in zoom-in duration-300">
      <div className="bg-slate-100 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 text-slate-600">
        <Lock size={32} />
      </div>
      <h2 className="text-xl font-bold text-slate-800 mb-2">Akses Admin</h2>
      <p className="text-slate-500 text-sm mb-6">Masukkan password untuk mengedit jadwal.</p>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <input 
          type="password" 
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Password..."
          className={`w-full p-4 bg-white border-2 rounded-xl text-center font-bold tracking-widest focus:outline-none transition-all ${error ? 'border-red-400 bg-red-50 text-red-500 placeholder:text-red-300' : 'border-slate-100 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100'}`}
          autoFocus
        />
        <button 
          type="submit"
          className="w-full bg-slate-900 text-white font-bold py-4 rounded-xl hover:bg-slate-800 transition-all shadow-lg active:scale-95 flex justify-center items-center gap-2"
        >
          <LogIn size={18} /> Masuk
        </button>
      </form>
    </div>
  );
};

// Modern Card Component
const DayCard = ({ title, dayName, data, isToday }) => {
  if (!data) return null;

  // Style khusus untuk "Hari Ini" vs "Besok"
  const cardStyle = isToday 
    ? "bg-gradient-to-br from-indigo-600 to-purple-700 text-white shadow-xl shadow-indigo-200 border-none" 
    : "bg-white/80 backdrop-blur-xl text-slate-600 shadow-lg shadow-slate-100 border border-white";

  const subPillStyle = isToday
    ? "bg-white/20 text-white border border-white/20"
    : "bg-indigo-50 text-indigo-600 border border-indigo-100";

  return (
    <div className={`relative rounded-3xl p-6 overflow-hidden transition-all duration-500 hover:scale-[1.02] ${cardStyle}`}>
      {/* Background decoration for Today card */}
      {isToday && (
        <>
          <div className="absolute top-0 right-0 -mr-8 -mt-8 w-32 h-32 bg-white/10 rounded-full blur-2xl"></div>
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
