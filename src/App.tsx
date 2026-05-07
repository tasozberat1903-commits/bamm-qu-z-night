import React, { useState, useEffect } from 'react';
import TVView from './components/TVView';
import ParticipantView from './components/ParticipantView';
import AdminView from './components/AdminView';
import { useQuizSession } from './hooks/useQuizSession';
import { auth, signInAnonymously } from './lib/firebase';
import { onAuthStateChanged, User } from 'firebase/auth';
import { Monitor, Smartphone, LayoutDashboard } from 'lucide-react';

export default function App() {
  const [view, setView] = useState<'tv' | 'mobile' | 'admin'>('tv');
  const [user, setUser] = useState<User | null>(null);
  const [authError, setAuthError] = useState<string | null>(null);
  const { state, participants, loading, updateSession, joinSession } = useQuizSession();

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => {
      if (!u) {
        signInAnonymously(auth).catch((error) => {
          console.error("Auth Error:", error);
          setAuthError(error.message);
        });
      } else {
        setUser(u);
        setAuthError(null);
      }
    });
    return () => unsub();
  }, []);

  if (authError) {
    return (
      <div className="min-h-screen bg-dark-bg flex flex-col items-center justify-center p-6 text-center">
        <div className="w-20 h-20 bg-red-500/20 rounded-full flex items-center justify-center mb-6">
          <Smartphone className="w-10 h-10 text-red-500" />
        </div>
        <h2 className="text-2xl font-bold mb-2">Bağlantı Hatası</h2>
        <p className="text-white/40 text-sm mb-8 max-w-xs">
          Firebase anonim giriş yapılamadı. Lütfen Firebase Console'dan 'Anonymous Auth' özelliğinin açık olduğundan emin olun.
        </p>
        <code className="bg-black/40 p-4 rounded-xl text-xs text-red-400 font-mono mb-8 block w-full overflow-x-auto">
          {authError}
        </code>
        <button onClick={() => window.location.reload()} className="px-8 py-3 bg-white text-black rounded-xl font-bold">
          TEKRAR DENE
        </button>
      </div>
    );
  }

  if (loading || !state || !user) {
    return (
      <div className="min-h-screen bg-dark-bg flex flex-col items-center justify-center gap-4">
        <div className="w-12 h-12 border-4 border-neon-purple border-t-transparent rounded-full animate-spin" />
        <p className="text-white/40 font-bold tracking-widest text-xs uppercase">Sistem Yükleniyor...</p>
      </div>
    );
  }

  // Combine state with real-time participants
  const fullState = { ...state, participants };

  return (
    <div className="relative">
      {/* View Switcher Overlay */}
      <div className="fixed top-6 left-1/2 -translate-x-1/2 z-[100] glass px-4 py-2 rounded-full flex gap-2 border-white/20 shadow-2xl scale-75 md:scale-100">
        <button 
          onClick={() => setView('tv')}
          className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold transition-all ${view === 'tv' ? 'bg-neon-purple text-white' : 'hover:bg-white/10 text-white/50'}`}
        >
          <Monitor className="w-3 h-3" /> TV EKRANI
        </button>
        <button 
          onClick={() => setView('mobile')}
          className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold transition-all ${view === 'mobile' ? 'bg-neon-blue text-white' : 'hover:bg-white/10 text-white/50'}`}
        >
          <Smartphone className="w-3 h-3" /> MOBİL
        </button>
        <button 
          onClick={() => setView('admin')}
          className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold transition-all ${view === 'admin' ? 'bg-white text-dark-bg shadow-lg' : 'hover:bg-white/10 text-white/50'}`}
        >
          <LayoutDashboard className="w-3 h-3" /> ADMIN
        </button>
      </div>

      {/* Main View Renderer */}
      <main className="min-h-screen">
        {view === 'tv' && <TVView state={fullState} />}
        
        {view === 'mobile' && (
          <ParticipantView state={fullState} user={user} joinSession={joinSession} />
        )}

        {view === 'admin' && <AdminView state={fullState} updateSession={updateSession} />}
      </main>
    </div>
  );
}
