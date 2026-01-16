
import React from 'react';
import { Trophy, RotateCcw, Award, ArrowUpCircle, Sparkles, TrendingUp } from 'lucide-react';

interface ResultProps {
  score: number;
  total: number;
  onRestart: () => void;
  level?: number;
}

export const Result: React.FC<ResultProps> = ({ score, total, onRestart }) => {
  const percentage = Math.round((score / total) * 100);
  
  let message = "Cần cố gắng thêm!";
  let Icon = Award;
  let textColor = "text-cyan-400";

  if (percentage >= 90) {
    message = "Đỉnh Cao Trí Tuệ!";
    Icon = Trophy;
    textColor = "text-yellow-400";
  } else if (percentage >= 70) {
    message = "Rất Khá Khen!";
    Icon = Sparkles;
    textColor = "text-green-400";
  }

  return (
    <div className="glass-card rounded-[3rem] p-12 text-center animate-scale-in relative overflow-hidden border-2 border-blue-400/40">
      <div className="absolute top-0 left-0 w-full h-3 bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-500"></div>
      
      <div className="inline-flex items-center justify-center p-10 bg-blue-900/40 rounded-[3rem] mb-10 shadow-inner border border-blue-400/20 relative">
        <Icon className={`w-20 h-20 text-white rounded-3xl p-4 bg-gradient-to-br from-blue-400 to-blue-700 shadow-2xl`} />
        <div className="absolute -top-4 -right-4 p-3 bg-white rounded-2xl shadow-2xl animate-bounce border border-blue-100">
            <TrendingUp className="w-8 h-8 text-blue-600" />
        </div>
      </div>
      
      <h2 className={`text-5xl font-black mb-6 tracking-tighter uppercase italic ${textColor}`}>
        {message}
      </h2>
      <p className="text-blue-100/70 mb-12 px-6 text-2xl font-medium leading-relaxed italic">
        "Toán học là bài thơ của những con số logic." - Bạn đã làm rất tốt!
      </p>

      <div className="grid grid-cols-2 gap-6 mb-12">
        <div className="bg-blue-950/50 p-10 rounded-[2.5rem] border border-blue-400/20 shadow-xl">
          <div className="text-6xl font-black text-white mb-2">
            {score}<span className="text-2xl text-blue-400/50">/{total}</span>
          </div>
          <div className="text-sm font-black text-blue-300 uppercase tracking-widest">Đúng chóc</div>
        </div>
        <div className="bg-blue-950/50 p-10 rounded-[2.5rem] border border-blue-400/20 shadow-xl">
          <div className={`text-6xl font-black ${textColor} mb-2`}>
            {percentage}<span className="text-2xl opacity-40">%</span>
          </div>
          <div className="text-sm font-black text-blue-300 uppercase tracking-widest">Tỉ lệ đỉnh</div>
        </div>
      </div>

      <div className="flex flex-col gap-5">
        <button
          onClick={onRestart}
          className="flex items-center justify-center gap-4 btn-gradient text-white font-black py-6 rounded-[2rem] transition-all duration-300 shadow-2xl hover:scale-[1.02] active:scale-95 text-3xl italic"
        >
          <ArrowUpCircle className="w-8 h-8" />
          LÀM VÁN MỚI
        </button>
        <button
          className="flex items-center justify-center gap-3 bg-blue-900/30 text-white font-bold py-5 rounded-[1.5rem] transition-all hover:bg-blue-800/40 border border-blue-400/20 text-xl italic"
          onClick={onRestart}
        >
          <RotateCcw className="w-5 h-5" />
          Về trang chính
        </button>
      </div>
    </div>
  );
};
