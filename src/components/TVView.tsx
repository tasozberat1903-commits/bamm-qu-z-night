
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { QrCode, Timer, Users, Radio } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { QUIZ_QUESTIONS } from '../constants';

export default function TVView({ state }: { state: any }) {
  const currentQuestion = QUIZ_QUESTIONS[state.currentQuestionIndex];
  const [timeLeft, setTimeLeft] = useState(currentQuestion.duration);
  const appUrl = import.meta.env.VITE_APP_URL || window.location.origin;

  // Reset timer when question changes
  useEffect(() => {
    setTimeLeft(currentQuestion.duration);
  }, [state.currentQuestionIndex]);

  useEffect(() => {
    if (timeLeft > 0 && state.status === 'active') {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [timeLeft, state.status]);

  return (
    <div className="min-h-screen bg-dark-bg p-12 flex flex-col items-center justify-center relative overflow-hidden">
      {/* Background Glows */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-neon-purple/20 blur-[120px] rounded-full" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-neon-blue/20 blur-[120px] rounded-full" />

      {/* Header Info */}
      <div className="absolute top-12 left-12 right-12 flex justify-between items-center z-10">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 glass rounded-full flex items-center justify-center neon-border-purple">
            <Radio className="text-neon-purple w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold tracking-tight glow-purple italic">RADYO GASTRO PUB</h2>
            <p className="text-xs text-white/50 uppercase tracking-widest font-medium">Canlı Bilgi Yarışması</p>
          </div>
        </div>

        <div className="flex gap-8">
          <div className="flex items-center gap-3">
            <Users className="text-neon-blue w-5 h-5" />
            <span className="text-2xl font-bold font-mono">{state.participants.length} <span className="text-sm font-sans text-white/50 font-normal">katılan</span></span>
          </div>
          <div className="flex items-center gap-3">
            <Timer className="text-neon-pink w-5 h-5" />
            <span className="text-2xl font-bold font-mono tracking-tighter">00:{timeLeft.toString().padStart(2, '0')}</span>
          </div>
        </div>
      </div>

      {/* Leaderboard Sidebar */}
      <div className="absolute left-12 top-40 w-64 hidden xl:flex flex-col gap-4 z-10">
        <h4 className="text-[10px] font-bold tracking-[0.2em] text-white/40 uppercase mb-2">LİDERLİK TABLOSU</h4>
        {state.participants.slice(0, 5).map((p: any, idx: number) => (
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: idx * 0.1 }}
            key={p.id} 
            className="glass p-4 rounded-2xl flex items-center gap-4 border-white/5"
          >
            <div className="w-8 h-8 rounded-lg glass flex items-center justify-center font-bold text-xs text-neon-blue">
              {idx + 1}
            </div>
            <div className="flex-1 overflow-hidden">
              <p className="font-bold text-sm truncate">{p.name}</p>
              <p className="text-[9px] text-white/40 uppercase font-mono">Masa {p.tableNumber}</p>
            </div>
            <div className="text-right">
              <p className="text-[10px] font-bold font-mono">{p.score}</p>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Main Question Area */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentQuestion.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className="w-full max-w-5xl z-10 text-center"
        >
          <p className="text-neon-purple font-bold tracking-widest uppercase mb-4 text-sm">Soru {currentQuestion.id} / 10</p>
          <h1 className="text-5xl md:text-6xl font-extrabold mb-16 leading-tight">
            {currentQuestion.text}
          </h1>

          <div className="grid grid-cols-2 gap-6 text-left">
            {currentQuestion.choices.map((choice: any) => (
              <motion.div
                key={choice.id}
                whileHover={{ scale: 1.02 }}
                className="glass p-8 rounded-3xl flex items-center gap-6 border-white/5 hover:border-neon-blue/30 transition-all cursor-pointer group relative overflow-hidden"
              >
                <div className="absolute inset-0 bg-neon-blue/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="w-12 h-12 rounded-2xl flex items-center justify-center font-bold text-2xl glass border-white/10 text-neon-blue shadow-lg">
                  {choice.id}
                </div>
                <span className="text-2xl font-medium">{choice.text}</span>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </AnimatePresence>

      {/* QR Code Section */}
      <div className="absolute bottom-12 right-12 flex flex-col items-center gap-4 z-10">
        <div className="p-4 glass rounded-3xl neon-border-blue">
          <div className="w-32 h-32 bg-white rounded-xl flex items-center justify-center p-2">
            <QRCodeSVG value={appUrl} size={112} level="H" />
          </div>
        </div>
        <p className="text-xs font-bold tracking-[0.2em] text-white/40 uppercase">Oynamak için tara</p>
      </div>

      {/* Bottom Progress Bar */}
      <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/5 overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${(timeLeft / currentQuestion.duration) * 100}%` }}
          className="h-full bg-neon-blue"
        />
      </div>
    </div>
  );
}
