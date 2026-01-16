
import { Question } from './types';

export const QUESTIONS: Question[] = [
  {
    id: 1,
    text: "Nguyên hàm của hàm số f(x) = 2x là:",
    options: [
      { id: 'A', text: "x² + C" },
      { id: 'B', text: "2x² + C" },
      { id: 'C', text: "x + C" },
      { id: 'D', text: "2 + C" }
    ],
    correctOptionId: 'A',
    explanation: "Áp dụng công thức nguyên hàm cơ bản: ∫ xⁿ dx = xⁿ⁺¹/(n+1) + C. Với n = 1, ta có ∫ 2x dx = 2 * (x²/2) + C = x² + C."
  },
  {
    id: 2,
    text: "Tích phân ∫₀¹ 3x² dx bằng:",
    options: [
      { id: 'A', text: "0" },
      { id: 'B', text: "1" },
      { id: 'C', text: "2" },
      { id: 'D', text: "3" }
    ],
    correctOptionId: 'B',
    explanation: "Nguyên hàm của 3x² là x³. Thế cận từ 0 đến 1: [x³]₀¹ = 1³ - 0³ = 1."
  },
  {
    id: 3,
    text: "Diện tích hình phẳng giới hạn bởi đồ thị y = x² và y = x là:",
    options: [
      { id: 'A', text: "1/2" },
      { id: 'B', text: "1/3" },
      { id: 'C', text: "1/6" },
      { id: 'D', text: "1" }
    ],
    correctOptionId: 'C',
    explanation: "Phương trình hoành độ giao điểm: x² = x ⇔ x = 0 hoặc x = 1. Diện tích S = ∫₀¹ |x - x²| dx = [x²/2 - x³/3]₀¹ = (1/2 - 1/3) - 0 = 1/6."
  },
  {
    id: 4,
    text: "Nguyên hàm của hàm số f(x) = sin(x) là:",
    options: [
      { id: 'A', text: "cos(x) + C" },
      { id: 'B', text: "-cos(x) + C" },
      { id: 'C', text: "sin(x) + C" },
      { id: 'D', text: "-sin(x) + C" }
    ],
    correctOptionId: 'B',
    explanation: "Vì đạo hàm của cos(x) là -sin(x), nên nguyên hàm của sin(x) là -cos(x) + C."
  },
  {
    id: 5,
    text: "Thể tích khối tròn xoay khi quay hình phẳng giới hạn bởi y = √x, trục Ox và x = 4 quanh Ox là:",
    options: [
      { id: 'A', text: "8π" },
      { id: 'B', text: "4π" },
      { id: 'C', text: "16π" },
      { id: 'D', text: "2π" }
    ],
    correctOptionId: 'A',
    explanation: "Công thức thể tích: V = π ∫ₐᵇ [f(x)]² dx. Ở đây V = π ∫₀⁴ (√x)² dx = π ∫₀⁴ x dx = π [x²/2]₀⁴ = π (16/2) = 8π."
  }
];
