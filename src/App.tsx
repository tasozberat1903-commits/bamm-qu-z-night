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
  const { state, participants, loading, updateSession, joinSession } = useQuizSession();

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => {
      if (!u) {
        signInAnonymously(auth).catch(console.error);
      } else {
        setUser(u);
      }
    });
    return () => unsub();
  }, []);

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
