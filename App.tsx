
import React, { useState } from 'react';
import { QuizState, UserProgress, Question } from './types';
import { Quiz } from './components/Quiz';
import { Result } from './components/Result';
import { 
  ChevronRight, 
  Loader2, 
  Sparkles, 
  Flame
} from 'lucide-react';
import { GoogleGenAI, Type } from "@google/genai";

const App: React.FC = () => {
  const [gameState, setGameState] = useState<QuizState>(QuizState.START);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [progress, setProgress] = useState<UserProgress>({
    score: 0,
    currentQuestionIndex: 0,
    answeredCount: 0,
    answers: {},
    level: 1 // 1: Dễ, 2: Trung bình, 3: Khó
  });

  const generateQuestions = async (currentLevel: number) => {
    setGameState(QuizState.LOADING);
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    
    let levelPrompt = "";
    if (currentLevel === 1) levelPrompt = "Cấp độ Dễ: Các công thức cơ bản, tính toán nguyên hàm tích phân đơn giản.";
    else if (currentLevel === 2) levelPrompt = "Cấp độ Trung bình: Các bài toán tính diện tích, thể tích, đổi biến số, từng phần mức độ thông hiểu và vận dụng.";
    else levelPrompt = "Cấp độ Khó: Tập trung vào các bài toán thực tế mới lạ (như tính toán trong xây dựng, kinh tế, vật lý, kỹ thuật), đòi hỏi tư duy cao và ứng dụng thực tiễn cực kỳ lôi cuốn của tích phân.";

    // Thêm seed ngẫu nhiên để ép AI tạo nội dung mới mỗi lần
    const randomSeed = Math.random().toString(36).substring(7);

    try {
      const response = await ai.models.generateContent({
        model: 'gemini-3-pro-preview',
        contents: `Tạo bộ đề 10 câu hỏi trắc nghiệm về "Nguyên hàm & Tích phân". 
        Yêu cầu: 
        1. ${levelPrompt}
        2. PHẢI dùng LaTeX cho mọi công thức toán học.
        3. Các câu hỏi PHẢI THAY ĐỔI HOÀN TOÀN, không được trùng lặp với bất kỳ bộ đề nào trước đó (Mã phiên: ${randomSeed}).
        4. Nội dung câu hỏi phải sáng tạo, hành văn gãy gọn.
        5. Trả về JSON chuẩn.`,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                id: { type: Type.INTEGER },
                text: { type: Type.STRING },
                options: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      id: { type: Type.STRING },
                      text: { type: Type.STRING }
                    },
                    required: ["id", "text"]
                  }
                },
                correctOptionId: { type: Type.STRING },
                explanation: { type: Type.STRING }
              },
              required: ["id", "text", "options", "correctOptionId", "explanation"]
            }
          }
        }
      });

      const data = JSON.parse(response.text || "[]");
      setQuestions(data);
      setGameState(QuizState.QUIZ);
    } catch (error) {
      console.error("AI Error:", error);
      setGameState(QuizState.START);
    }
  };

  const startQuiz = (level: number) => {
    setProgress(prev => ({ ...prev, score: 0, currentQuestionIndex: 0, level }));
    generateQuestions(level);
  };

  const handleFinish = (finalScore: number) => {
    setGameState(QuizState.RESULT);
  };

  return (
    <div className="safe-area-container pt-4 px-4 pb-0 lg:pt-8 lg:px-8 lg:pb-0 gap-6 justify-center min-h-screen">
      <main className="flex items-center justify-center overflow-hidden h-full">
        {gameState === QuizState.START && (
          <div className="glass-card rounded-[3rem] p-8 lg:p-12 text-center animate-scale-in max-w-2xl w-full border-blue-400/30">
            <div className="w-20 h-20 bg-gradient-to-tr from-blue-400 to-cyan-400 rounded-3xl mx-auto flex items-center justify-center mb-6 shadow-2xl transform -rotate-3 border-2 border-white/20">
              <Sparkles className="w-10 h-10 text-white animate-pulse" />
            </div>
            <h1 className="text-4xl font-black text-white mb-2 tracking-tight italic uppercase logo-rainbow" style={{ WebkitTextFillColor: 'initial', background: 'none' }}>Toán Pro</h1>
            <p className="text-blue-100/80 font-bold mb-8 text-lg">Hệ thống trắc nghiệm AI thông minh</p>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <button onClick={() => startQuiz(1)} className="p-6 bg-emerald-500/20 hover:bg-emerald-500/40 border border-emerald-400/50 rounded-2xl transition-all group active:scale-95">
                <span className="block text-2xl font-black text-emerald-300 group-hover:scale-110 transition-transform">DỄ</span>
                <span className="text-xs text-white/60">Cơ bản & Nền tảng</span>
              </button>
              <button onClick={() => startQuiz(2)} className="p-6 bg-blue-500/20 hover:bg-blue-500/40 border border-blue-400/50 rounded-2xl transition-all group active:scale-95">
                <span className="block text-2xl font-black text-blue-300 group-hover:scale-110 transition-transform">VỪA</span>
                <span className="text-xs text-white/60">Vận dụng tiêu chuẩn</span>
              </button>
              <button onClick={() => startQuiz(3)} className="p-6 bg-rose-500/20 hover:bg-rose-500/40 border border-rose-400/50 rounded-2xl transition-all group active:scale-95">
                <span className="block text-2xl font-black text-rose-300 group-hover:scale-110 transition-transform">KHÓ</span>
                <span className="text-xs text-white/60">Thực tế & Tư duy</span>
              </button>
            </div>
          </div>
        )}

        {gameState === QuizState.LOADING && (
          <div className="glass-card rounded-[3rem] p-20 text-center animate-pulse max-w-md w-full">
            <div className="relative w-24 h-24 mx-auto mb-8">
                <Loader2 className="w-24 h-24 text-cyan-400 animate-spin" />
                <div className="absolute inset-0 flex items-center justify-center">
                    <Flame className="w-10 h-10 text-blue-300" />
                </div>
            </div>
            <h2 className="text-2xl font-black text-white uppercase italic tracking-widest">Đang kiến tạo tri thức...</h2>
          </div>
        )}

        {gameState === QuizState.QUIZ && (
          <Quiz 
            questions={questions} 
            onFinish={handleFinish} 
            progress={progress}
            setProgress={setProgress}
          />
        )}

        {gameState === QuizState.RESULT && (
          <div className="w-full max-w-2xl overflow-y-auto custom-scroll h-full pb-10">
            <Result 
              score={progress.score} 
              total={questions.length} 
              onRestart={() => setGameState(QuizState.START)} 
              level={progress.level}
            />
          </div>
        )}
      </main>
    </div>
  );
};

export default App;
