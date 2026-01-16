
import React, { useState, useEffect, useCallback } from 'react';
import { Question, UserProgress } from '../types';
import { ChevronRight, Lightbulb, Target, Zap, Clock, RotateCcw, GraduationCap, Volume2, Mic2 } from 'lucide-react';
import { GoogleGenAI, Modality } from "@google/genai";

declare global {
  interface Window {
    MathJax?: { typesetPromise: () => Promise<void>; };
    confetti?: (options?: any) => void;
    AudioContext: typeof AudioContext;
    webkitAudioContext: typeof AudioContext;
  }
}

interface QuizProps {
  questions: Question[];
  onFinish: (score: number) => void;
  progress: UserProgress;
  setProgress: React.Dispatch<React.SetStateAction<UserProgress>>;
}

export const Quiz: React.FC<QuizProps> = ({ questions, onFinish, progress, setProgress }) => {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [timer, setTimer] = useState(0);
  const [isSpeaking, setIsSpeaking] = useState(false);

  const currentQuestion = questions[progress.currentQuestionIndex];

  // Hàm MC nói chuyện
  const speakMC = useCallback(async (text: string) => {
    if (isSpeaking) return;
    setIsSpeaking(true);
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    try {
      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash-preview-tts",
        contents: [{ parts: [{ text: `Đọc bằng giọng nam miền Tây Nam Bộ hào sảng, chất phác và cực kỳ thân thiện: "${text}"` }] }],
        config: {
          responseModalities: [Modality.AUDIO],
          speechConfig: {
            voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Kore' } },
          },
        },
      });

      const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
      if (base64Audio) {
        const ctx = new (window.AudioContext || window.webkitAudioContext)({ sampleRate: 24000 });
        const decode = (b64: string) => Uint8Array.from(atob(b64), c => c.charCodeAt(0));
        const data = decode(base64Audio);
        const dataInt16 = new Int16Array(data.buffer);
        const buffer = ctx.createBuffer(1, dataInt16.length, 24000);
        const channelData = buffer.getChannelData(0);
        for (let i = 0; i < dataInt16.length; i++) {
          channelData[i] = dataInt16[i] / 32768.0;
        }
        const source = ctx.createBufferSource();
        source.buffer = buffer;
        source.connect(ctx.destination);
        source.onended = () => setIsSpeaking(false);
        source.start();
      } else {
        setIsSpeaking(false);
      }
    } catch (e) {
      console.error(e);
      setIsSpeaking(false);
    }
  }, [isSpeaking]);

  // Tự động đọc câu hỏi khi vừa hiển thị câu mới
  useEffect(() => {
    if (currentQuestion) {
      // Đợi MathJax và render hoàn tất một chút trước khi đọc
      const timeout = setTimeout(() => {
        speakMC(currentQuestion.text);
      }, 500);
      return () => clearTimeout(timeout);
    }
  }, [progress.currentQuestionIndex]);

  useEffect(() => {
    const interval = setInterval(() => setTimer(t => t + 1), 1000);
    return () => clearInterval(interval);
  }, [progress.currentQuestionIndex]);

  useEffect(() => {
    if (window.MathJax) window.MathJax.typesetPromise();
  }, [currentQuestion, isAnswered]);

  const playApplause = useCallback(() => {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const bufferSize = 2 * ctx.sampleRate;
    const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const output = noiseBuffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
        output[i] = (Math.random() * 2 - 1) * Math.exp(-i / (ctx.sampleRate * 0.5));
    }
    
    for (let j = 0; j < 5; j++) {
        const whiteNoise = ctx.createBufferSource();
        whiteNoise.buffer = noiseBuffer;
        const gainNode = ctx.createGain();
        gainNode.gain.setValueAtTime(0.15, ctx.currentTime + j * 0.1);
        gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + j * 0.1 + 0.8);
        whiteNoise.connect(gainNode);
        gainNode.connect(ctx.destination);
        whiteNoise.start(ctx.currentTime + j * 0.05);
    }
  }, []);

  const handleSelect = (optionId: string) => {
    if (isAnswered) return;
    const correct = optionId === currentQuestion.correctOptionId;
    setSelectedId(optionId);
    setIsAnswered(true);
    setIsCorrect(correct);
    
    if (correct) {
      playApplause();
      speakMC("Trời ơi hay dữ thần chưa! Trúng phóc rồi đó con!");
      if (window.confetti) {
        window.confetti({ 
          particleCount: 150, spread: 90, origin: { y: 0.6 },
          colors: ['#00BFFF', '#1E90FF', '#FFD700']
        });
      }
      setProgress(prev => ({ ...prev, score: prev.score + 1 }));
    } else {
      speakMC("Tiếc quá hà, trật lất rồi. Coi kỹ lời giải dưới đây nè!");
    }
  };

  const handleNext = () => {
    if (progress.currentQuestionIndex + 1 < questions.length) {
      setProgress(prev => ({ ...prev, currentQuestionIndex: prev.currentQuestionIndex + 1 }));
      setSelectedId(null);
      setIsAnswered(false);
      setIsCorrect(false);
    } else {
      onFinish(progress.score);
    }
  };

  const levelLabels = ["Dễ ẹt hà", "Cũng thường thôi", "Dữ dằn luôn"];
  const levelLabel = levelLabels[progress.level - 1];

  return (
    <div className="glass-card rounded-[2.5rem] flex flex-col h-[94vh] max-h-[920px] animate-scale-in overflow-hidden mx-auto w-full max-w-4xl border-2 border-blue-400/40 shadow-[0_0_100px_rgba(0,35,102,0.8)]">
      <div className="px-6 py-0.5 bg-black/50 border-b border-blue-400/20 flex items-center justify-between flex-shrink-0 h-6 lg:h-7">
        <div className="flex items-center gap-3">
            <span className="px-1.5 py-0 bg-blue-500/30 rounded-full text-[8px] font-black text-cyan-300 border border-cyan-400/20 uppercase tracking-tighter leading-none">
                {levelLabel}
            </span>
            <div className="flex items-center gap-1 text-blue-200/50">
                <Clock className="w-2.5 h-2.5" />
                <span className="text-[10px] font-bold">{Math.floor(timer/60)}:{(timer%60).toString().padStart(2,'0')}</span>
            </div>
            
            <div className="flex items-center gap-1.5 ml-1 border-l border-blue-400/10 pl-3 h-3">
                <GraduationCap className="w-3 h-3 text-blue-300/80" />
                <span className="text-[11px] font-black italic logo-rainbow">TOÁN PRO</span>
            </div>
        </div>
        <div className="flex items-center gap-2">
             <div className="flex items-center gap-1 px-1.5 bg-blue-900/40 rounded border border-blue-400/20">
                <Target className="w-2.5 h-2.5 text-yellow-400/80" />
                <span className="text-[10px] font-black text-white/80">{progress.score}</span>
            </div>
            <span className="text-[10px] font-black text-blue-200/60 uppercase">
                Câu {progress.currentQuestionIndex + 1}/10
            </span>
        </div>
      </div>

      <div className="flex-grow flex flex-col p-6 lg:p-8 overflow-hidden">
        <div className="mb-4 flex items-start justify-between gap-4">
            <h3 className="text-xl lg:text-2xl font-black text-white leading-relaxed italic flex-grow">
                {currentQuestion.text}
            </h3>
            <button 
              onClick={() => speakMC(currentQuestion.text)}
              disabled={isSpeaking}
              className={`p-2 rounded-xl border-2 transition-all ${isSpeaking ? 'bg-cyan-500 border-cyan-300 animate-pulse' : 'bg-blue-800/40 border-blue-400/30 hover:bg-blue-700/50'}`}
              title="Nghe MC đọc đề"
            >
              {isSpeaking ? <Mic2 className="w-5 h-5 text-white" /> : <Volume2 className="w-5 h-5 text-cyan-300" />}
            </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 flex-shrink-0">
          {currentQuestion.options.map((option) => {
            const isSelected = selectedId === option.id;
            const isActuallyCorrect = isAnswered && option.id === currentQuestion.correctOptionId;
            const isWrong = isAnswered && isSelected && !isCorrect;

            let btnStyle = "bg-blue-900/40 border-blue-400/20 text-white/90 hover:bg-blue-800/50";
            if (isActuallyCorrect) btnStyle = "bg-emerald-500/20 border-emerald-400 text-emerald-100 shadow-[0_0_20px_rgba(16,185,129,0.3)] scale-[1.01]";
            else if (isWrong) btnStyle = "bg-rose-500/20 border-rose-400 text-rose-100 shadow-[0_0_20px_rgba(244,63,94,0.3)]";
            else if (isSelected) btnStyle = "bg-blue-500/40 border-blue-300 text-white";

            return (
              <button
                key={option.id}
                onClick={() => handleSelect(option.id)}
                disabled={isAnswered}
                className={`w-full text-left p-2 px-3 rounded-xl border-2 transition-all duration-300 flex items-center gap-3 ${btnStyle} active:scale-95 h-11 lg:h-12`}
              >
                <span className={`w-7 h-7 rounded-full flex items-center justify-center text-sm font-black flex-shrink-0 ${
                  isSelected ? 'bg-white text-blue-900 shadow-lg' : 'bg-blue-800/50 text-blue-300'
                }`}>{option.id}</span>
                <span className="text-base lg:text-lg font-bold leading-tight flex-grow truncate">{option.text}</span>
              </button>
            );
          })}
        </div>

        <div className="mt-2 pt-2 h-auto flex-grow overflow-hidden flex flex-col">
            {isAnswered && (
                <div className="animate-in fade-in slide-in-from-bottom-2 duration-300 flex-grow flex flex-col">
                    {/* Container cho giải thích và nút bấm sát nhau */}
                    <div className={`p-3 rounded-t-2xl border-2 border-b-0 flex gap-4 ${isCorrect ? 'bg-emerald-500/10 border-emerald-500/30' : 'bg-rose-500/10 border-rose-500/30'}`}>
                        <div className={`p-1.5 rounded-xl h-fit flex-shrink-0 ${isCorrect ? 'bg-emerald-500' : 'bg-rose-500'}`}>
                            {isCorrect ? <Zap className="w-3.5 h-3.5 text-white" /> : <Lightbulb className="w-3.5 h-3.5 text-white" />}
                        </div>
                        <div className="overflow-hidden flex-grow">
                            <h4 className="font-black text-blue-200 text-[9px] uppercase tracking-widest mb-0.5">Lời giải cực chất:</h4>
                            <div className="text-base lg:text-lg font-bold text-white/90 leading-snug overflow-y-auto custom-scroll italic max-h-20 lg:max-h-28">
                                {currentQuestion.explanation}
                            </div>
                        </div>
                    </div>
                    
                    {/* Nút bấm đặt sát ngay dưới khung giải thích (bo góc dưới) */}
                    <button
                        onClick={isCorrect ? handleNext : () => {setSelectedId(null); setIsAnswered(false);}}
                        className="w-full btn-gradient text-white font-black py-3 rounded-b-2xl flex items-center justify-center gap-2 active:scale-95 shadow-xl transition-all text-lg uppercase italic border-2 border-t-0 border-blue-400/30"
                    >
                        {isCorrect ? (progress.currentQuestionIndex + 1 === questions.length ? 'KẾT THÚC RỒI ĐÓ' : 'TỚI LUÔN BÁC TÀI!') : 'LÀM LẠI PHÁT NÈ'}
                        <ChevronRight className="w-6 h-6" />
                    </button>
                </div>
            )}
        </div>
      </div>

      <div className="h-1.5 w-full bg-blue-950 flex-shrink-0">
        <div 
          className="h-full bg-gradient-to-r from-cyan-400 via-white to-blue-600 transition-all duration-700 shadow-[0_0_20px_rgba(255,255,255,0.4)]" 
          style={{ width: `${((progress.currentQuestionIndex + 1) / questions.length) * 100}%` }}
        ></div>
      </div>
    </div>
  );
};
