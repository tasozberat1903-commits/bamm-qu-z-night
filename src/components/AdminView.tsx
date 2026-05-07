
import React from 'react';
import { motion } from 'motion/react';
import { LayoutDashboard, ListTodo, BarChart3, Trophy, Play, Pause, SkipForward, Settings } from 'lucide-react';
import { QUIZ_QUESTIONS } from '../constants';
import { QuizState } from '../types';

interface AdminViewProps {
  state: any;
  updateSession: (updates: Partial<QuizState>) => Promise<void>;
}

export default function AdminView({ state, updateSession }: AdminViewProps) {
  const currentQuestion = QUIZ_QUESTIONS[state.currentQuestionIndex];

  const handleNext = () => {
    if (state.currentQuestionIndex < QUIZ_QUESTIONS.length - 1) {
      updateSession({ currentQuestionIndex: state.currentQuestionIndex + 1 });
    }
  };

  const calculateDistribution = () => {
    const distribution = { A: 0, B: 0, C: 0, D: 0 };
    state.participants.forEach((p: any) => {
      if (p.lastAnswer) {
        distribution[p.lastAnswer as keyof typeof distribution]++;
      }
    });
    return distribution;
  };

  const distribution = calculateDistribution();
  const totalAnswers = Object.values(distribution).reduce((a, b) => a + b, 0);

  return (
    <div className="min-h-screen bg-dark-bg text-white flex">
      {/* Sidebar */}
      <div className="w-24 border-r border-white/5 flex flex-col items-center py-10 gap-10">
        <div className="w-12 h-12 bg-neon-purple rounded-2xl flex items-center justify-center shadow-[0_0_20px_rgba(191,0,255,0.4)]">
          <LayoutDashboard className="w-6 h-6" />
        </div>
        <div className="flex flex-col gap-8 opacity-40">
          <ListTodo className="w-6 h-6 hover:opacity-100 cursor-pointer transition-opacity" />
          <BarChart3 className="w-6 h-6 hover:opacity-100 cursor-pointer transition-opacity" />
          <Trophy className="w-6 h-6 hover:opacity-100 cursor-pointer transition-opacity" />
          <Settings className="w-6 h-6 hover:opacity-100 cursor-pointer transition-opacity" />
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col p-10 gap-8 max-w-7xl mx-auto w-full">
        <header className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">Kontrol Paneli</h1>
            <p className="text-white/40 text-sm mt-1">Gastro Quiz: Perşembe Gecesi Nostaljisi</p>
          </div>
          <div className="flex gap-4">
            <button 
              onClick={() => updateSession({ status: 'waiting' })}
              className={`flex items-center gap-2 px-6 py-2 glass rounded-xl text-sm font-bold border-white/5 transition-all ${state.status === 'waiting' ? 'border-neon-pink text-neon-pink' : 'hover:border-white/20'}`}
            >
              <Pause className="w-4 h-4" /> DURAKLAT
            </button>
            <button 
              onClick={() => updateSession({ status: 'active' })}
              className={`flex items-center gap-2 px-6 py-2 rounded-xl text-sm font-bold transition-all ${state.status === 'active' ? 'bg-neon-purple shadow-[0_0_15px_rgba(191,0,255,0.3)]' : 'glass border-white/5 text-white/50 hover:border-white/20'}`}
            >
              <Play className="w-4 h-4" /> DEVAM ET
            </button>
            <button 
              onClick={handleNext}
              className="flex items-center justify-center w-10 h-10 glass border-white/5 rounded-xl hover:border-white/20"
            >
                <SkipForward className="w-5 h-5 opacity-60" />
            </button>
          </div>
        </header>

        <div className="grid grid-cols-12 gap-8 flex-1">
          {/* Left Column: Question Management */}
          <div className="col-span-8 flex flex-col gap-6">
            <div className="glass p-8 rounded-3xl border-white/5">
                <div className="flex justify-between items-center mb-6">
                    <h3 className="font-bold flex items-center gap-2 tracking-tight">
                        <span className={`w-2 h-2 rounded-full ${state.status === 'active' ? 'bg-neon-blue animate-pulse' : 'bg-white/20'}`} />
                        AKTİF SORU ({state.currentQuestionIndex + 1}/{QUIZ_QUESTIONS.length})
                    </h3>
                    <span className="text-xs font-mono text-white/30">ID: QZ-{state.currentQuestionIndex + 100}</span>
                </div>
                <div className="p-6 bg-white/5 rounded-2xl mb-8 border border-white/5">
                    <p className="text-xl font-bold leading-relaxed">{currentQuestion.text}</p>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                    {currentQuestion.choices.map((choice: any) => {
                        const isCorrect = choice.id === currentQuestion.correctChoiceId;
                        return (
                            <div key={choice.id} className={`p-4 rounded-2xl flex items-center justify-between border ${isCorrect ? 'border-green-500/30 bg-green-500/10 shadow-[inset_0_0_10px_rgba(34,197,94,0.05)]' : 'border-white/5 bg-white/2'}`}>
                                <span className="font-medium text-sm">{choice.id}: {choice.text}</span>
                                {isCorrect && <span className="text-[10px] bg-green-500 text-white px-2 py-0.5 rounded-full font-bold">DOĞRU</span>}
                            </div>
                        );
                    })}
                </div>
            </div>

            <div className="flex-1 glass p-8 rounded-3xl border-white/5">
                <div className="flex justify-between items-center mb-6">
                    <h3 className="font-bold text-white/60">CEVAP DAĞILIMI</h3>
                    <span className="text-xs text-neon-blue font-bold">{totalAnswers} CEVAP</span>
                </div>
                <div className="flex flex-col gap-6">
                    {currentQuestion.choices.map((choice: any, idx: number) => {
                        const count = distribution[choice.id as keyof typeof distribution];
                        const colors = ['bg-orange-500', 'bg-blue-500', 'bg-green-500', 'bg-pink-500'];
                        const percentage = totalAnswers > 0 ? (count / totalAnswers) * 100 : 0;
                        
                        return (
                            <div key={choice.id} className="flex flex-col gap-2">
                                <div className="flex justify-between text-[10px] font-bold uppercase tracking-widest text-white/40">
                                    <span>{choice.text}</span>
                                    <span>{count} KİŞİ (%{Math.round(percentage)})</span>
                                </div>
                                <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden">
                                    <motion.div 
                                        initial={{ width: 0 }}
                                        animate={{ width: `${percentage}%` }}
                                        className={`h-full ${colors[idx % colors.length]}`}
                                    />
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
          </div>

          {/* Right Column: Leaderboard */}
          <div className="col-span-4 glass p-8 rounded-3xl border-white/5 flex flex-col">
            <h3 className="font-bold mb-6 flex items-center gap-2">
                <Trophy className="w-5 h-5 text-yellow-500" /> LİDERLİK TABLOSU
            </h3>
            <div className="flex flex-col gap-4 flex-1 overflow-y-auto pr-2 max-h-[500px] custom-scrollbar">
                {state.participants.length === 0 && (
                  <div className="flex-1 flex flex-col items-center justify-center text-center opacity-20 py-20">
                    <Trophy className="w-12 h-12 mb-4" />
                    <p className="text-sm font-bold uppercase tracking-widest">Henüz Katılımcı Yok</p>
                  </div>
                )}
                {state.participants.map((user: any, idx: number) => (
                    <motion.div 
                        key={user.id} 
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="flex items-center gap-4 p-3 rounded-2xl bg-white/2 border border-white/5 hover:border-white/10 transition-all group"
                    >
                        <div className={`w-8 h-8 rounded-xl flex items-center justify-center font-bold text-xs ${idx === 0 ? 'bg-yellow-500/20 text-yellow-500' : 'bg-white/5 text-white/50'}`}>
                            #{idx + 1}
                        </div>
                        <div className="flex-1 overflow-hidden">
                            <div className="flex items-center gap-2">
                                <p className="font-bold group-hover:text-neon-blue transition-colors truncate">{user.name}</p>
                                <span className="text-[8px] bg-white/10 px-1 py-0.5 rounded text-white/40 font-mono flex-shrink-0">Masa {user.tableNumber}</span>
                            </div>
                            <p className="text-[10px] text-white/30 uppercase tracking-widest font-mono">{user.score} PUAN</p>
                        </div>
                        {idx === 0 && <div className="w-2 h-2 rounded-full bg-yellow-500 glow-yellow shadow-[0_0_10px_rgba(234,179,8,0.5)] flex-shrink-0" />}
                    </motion.div>
                ))}
            </div>
            <button className="mt-8 py-4 w-full glass rounded-2xl text-[10px] font-extrabold tracking-[0.2em] uppercase opacity-50 hover:opacity-100 transition-opacity">Full Listeyi Gör</button>
          </div>
        </div>
      </div>
    </div>
  );
}
