
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Smartphone, Scan, User, CheckCircle2, ChevronRight, Radio } from 'lucide-react';
import { QUIZ_QUESTIONS } from '../constants';
import { User as FirebaseUser } from 'firebase/auth';
import { Participant } from '../types';

interface ParticipantViewProps {
  state: any;
  user: FirebaseUser;
  joinSession: (p: Participant) => Promise<void>;
}

export default function ParticipantView({ state, user, joinSession }: ParticipantViewProps) {
  const [stage, setStage] = useState<'join' | 'name' | 'waiting' | 'play'>('join');
  const [name, setName] = useState(user.displayName || '');
  const [tableNumber, setTableNumber] = useState('');
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [timeLeft, setTimeLeft] = useState(15);
  const [showError, setShowError] = useState(false);

  const currentQuestion = QUIZ_QUESTIONS[state.currentQuestionIndex];
  const participantData = state.participants.find((p: any) => p.id === user.uid);

  // Sync stage with quiz status
  useEffect(() => {
    if (participantData) {
      if (state.status === 'active' && stage === 'waiting') {
        setStage('play');
      }
      if (state.status === 'waiting' && stage === 'play') {
        setStage('waiting');
        setSelectedAnswer(null);
      }
    }
  }, [state.status, participantData]);

  // Reset timer when question changes
  useEffect(() => {
    setTimeLeft(currentQuestion.duration);
    setSelectedAnswer(null);
  }, [state.currentQuestionIndex]);

  // Timer logic
  useEffect(() => {
    if (stage === 'play' && timeLeft > 0) {
      const timerId = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timerId);
    }
  }, [timeLeft, stage]);

  const handleJoin = () => setStage('name');
  
  const handleSetName = async () => {
    const trimmedName = name.trim();
    const trimmedTable = tableNumber.trim();

    if (trimmedName.length > 0 && trimmedTable.length > 0) {
      // Check for table collision
      const isTableTaken = state.participants.some((p: any) => p.tableNumber === trimmedTable && p.id !== user.uid);
      
      if (isTableTaken) {
        setShowError(true);
        return;
      }

      const newParticipant: Participant = {
        id: user.uid,
        name: trimmedName,
        tableNumber: trimmedTable,
        score: 0
      };
      await joinSession(newParticipant);
      setStage('waiting');
      setShowError(false);
    } else {
      setShowError(true);
    }
  };

  const handleSelectAnswer = async (choiceId: string) => {
    if (selectedAnswer || timeLeft === 0) return;
    
    setSelectedAnswer(choiceId);
    const isCorrect = choiceId === currentQuestion.correctChoiceId;
    const scoreGain = isCorrect ? Math.floor((timeLeft / currentQuestion.duration) * 1000) : 0;

    if (participantData) {
      await joinSession({
        ...participantData,
        lastAnswer: choiceId,
        isCorrect,
        score: (participantData.score || 0) + scoreGain
      });
    }
  };

  return (
    <div className="min-h-screen bg-dark-bg flex items-center justify-center p-4">
      <div className="w-full max-w-[380px] aspect-[9/19] relative bg-black rounded-[50px] border-[10px] border-[#1a1a1a] shadow-2xl overflow-hidden flex flex-col">
        {/* Dynamic Island / Notch */}
        <div className="absolute top-2 left-1/2 -translate-x-1/2 w-28 h-6 bg-black rounded-full z-50 flex items-center justify-center">
            <div className="w-2 h-2 rounded-full bg-blue-500/20 blur-sm" />
        </div>

        <div className="flex-1 p-6 pt-12 flex flex-col relative">
          <div className="absolute top-[-20%] left-[-20%] w-[80%] h-[40%] bg-neon-purple/20 blur-[60px] rounded-full pointer-events-none" />
          <div className="absolute bottom-[-10%] right-[-10%] w-[60%] h-[30%] bg-neon-blue/20 blur-[60px] rounded-full pointer-events-none" />

          {/* Status Bar App Mock */}
          <div className="flex justify-between items-center mb-12 relative z-10 px-2">
            <div className="flex items-center gap-2">
                <div className="w-6 h-6 glass rounded-full flex items-center justify-center border-neon-purple/50">
                    <Radio className="w-3 h-3 text-neon-purple" />
                </div>
                <span className="text-[10px] font-bold tracking-widest text-white/60">RADYO GASTRO</span>
            </div>
            <div className="flex gap-1">
                <div className="w-1 h-3 bg-white/40 rounded-full" />
                <div className="w-1 h-3 bg-white/40 rounded-full" />
                <div className="w-1 h-3 bg-white rounded-full" />
            </div>
          </div>

          <AnimatePresence mode="wait">
            {stage === 'join' && (
              <motion.div
                key="join"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="flex-1 flex flex-col justify-center items-center text-center gap-8"
              >
                <div className="w-24 h-24 glass rounded-full flex items-center justify-center neon-border-blue relative">
                  <Scan className="w-10 h-10 text-neon-blue animate-pulse" />
                  <div className="absolute inset-0 rounded-full border-2 border-neon-blue/30 scale-125 animate-ping opacity-20" />
                </div>
                <div>
                  <h3 className="text-xl font-bold mb-2">Yarışmaya Katıl</h3>
                  <p className="text-white/50 text-sm">QR kodu tara veya butona basarak ilerle</p>
                </div>
                <button
                  onClick={handleJoin}
                  className="w-full py-4 glass rounded-2xl border-neon-blue/50 text-neon-blue font-bold tracking-wider hover:bg-neon-blue/10 transition-all flex items-center justify-center gap-2"
                >
                  KATIL <ChevronRight className="w-4 h-4" />
                </button>
              </motion.div>
            )}

            {stage === 'name' && (
              <motion.div
                key="name"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="flex-1 flex flex-col justify-center gap-8"
              >
                <div>
                  <h3 className="text-2xl font-bold mb-2">Profil Oluştur</h3>
                  <p className="text-white/50 text-sm">Yarışmada görünecek ismini gir</p>
                </div>

                <div className="flex flex-col gap-4">
                  <div className="relative">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/30" />
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="İsmin (Örn: Berat)"
                      className="w-full glass py-4 pl-12 pr-4 rounded-2xl outline-none focus:border-neon-purple/50 transition-all text-white font-medium"
                    />
                  </div>

                  <div className="relative">
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/30 flex items-center justify-center font-bold text-[10px]">#</div>
                    <input
                      type="text"
                      value={tableNumber}
                      onChange={(e) => {
                        setTableNumber(e.target.value);
                        if (showError) setShowError(false);
                      }}
                      placeholder="Masa Numarası (Örn: 12)"
                      className={`w-full glass py-4 pl-12 pr-4 rounded-2xl outline-none transition-all text-white font-medium ${showError && tableNumber.length === 0 ? 'border-red-500/50 bg-red-500/5' : 'focus:border-neon-blue/50'}`}
                    />
                  </div>
                </div>

                {showError && (
                  <p className="text-red-500 text-[10px] uppercase font-bold tracking-widest text-center animate-pulse">
                    {state.participants.some((p: any) => p.tableNumber === tableNumber.trim() && p.id !== user.uid) 
                      ? 'Bu masa zaten kullanımda' 
                      : 'Lütfen tüm alanları doldurun'}
                  </p>
                )}

                <button
                  onClick={handleSetName}
                  disabled={name.trim().length === 0 || tableNumber.trim().length === 0}
                  className="w-full py-4 bg-neon-purple text-white rounded-2xl font-bold shadow-[0_0_20px_rgba(191,0,255,0.4)] disabled:opacity-50 disabled:shadow-none"
                >
                  DEVAM ET
                </button>
              </motion.div>
            )}

            {stage === 'waiting' && (
              <motion.div
                key="waiting"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="flex-1 flex flex-col items-center justify-center text-center gap-6"
              >
                <div className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center mb-4">
                    <CheckCircle2 className="w-10 h-10 text-green-500" />
                </div>
                <h3 className="text-xl font-bold">Harika, {name}!</h3>
                <p className="text-white/50">Diğer oyuncuların gelmesini ve yarışmanın başlamasını bekle.</p>
                <div className="flex gap-2">
                    <motion.div animate={{ scale: [1, 1.2, 1] }} transition={{ repeat: Infinity, duration: 1.5, delay: 0 }} className="w-2 h-2 rounded-full bg-neon-blue" />
                    <motion.div animate={{ scale: [1, 1.2, 1] }} transition={{ repeat: Infinity, duration: 1.5, delay: 0.2 }} className="w-2 h-2 rounded-full bg-neon-blue" />
                    <motion.div animate={{ scale: [1, 1.2, 1] }} transition={{ repeat: Infinity, duration: 1.5, delay: 0.4 }} className="w-2 h-2 rounded-full bg-neon-blue" />
                </div>
                <button onClick={() => setStage('play')} className="mt-8 text-xs text-white/30 hover:text-white underline tracking-widest">SİMÜLASYONU BAŞLAT</button>
              </motion.div>
            )}

            {stage === 'play' && (
              <motion.div
                key="play"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex-1 flex flex-col gap-6"
              >
                <div className="flex justify-between items-end mb-4">
                    <span className="text-[10px] text-white/40 tracking-widest uppercase font-bold">Soru 3/10</span>
                    <motion.span 
                      animate={timeLeft <= 5 ? { scale: [1, 1.1, 1], color: ['#ff007f', '#ffffff', '#ff007f'] } : {}}
                      transition={{ repeat: Infinity, duration: 0.5 }}
                      className={`text-xl font-mono font-bold ${timeLeft <= 5 ? 'text-neon-pink' : 'text-neon-blue'}`}
                    >
                      {timeLeft}s
                    </motion.span>
                </div>

                <div className="glass p-4 rounded-2xl border-white/5 mb-4">
                  <p className="text-base font-bold leading-relaxed">{currentQuestion.text}</p>
                </div>

                <div className="flex flex-col gap-4">
                  {currentQuestion.choices.map((choice: any, idx: number) => {
                    const colors = ['bg-orange-500', 'bg-blue-500', 'bg-green-500', 'bg-pink-500'];
                    return (
                      <motion.button
                        key={choice.id}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => handleSelectAnswer(choice.id)}
                        className={`w-full py-4 px-6 rounded-2xl text-left border-2 flex items-center justify-between transition-all ${
                          selectedAnswer === choice.id
                            ? 'border-white bg-white/20'
                            : 'border-white/5 bg-white/5'
                        }`}
                      >
                        <span className="font-bold">{choice.id}: {choice.text}</span>
                        <div className={`w-3 h-3 rounded-full ${colors[idx % colors.length]}`} />
                      </motion.button>
                    );
                  })}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Home Button Bar */}
        <div className="h-14 flex items-center justify-center">
            <div className="w-32 h-1 bg-white/20 rounded-full" />
        </div>
      </div>
    </div>
  );
}
