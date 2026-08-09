import { MARKETING_QUESTIONS } from "./marketingQuestions";

export const MARKETING_ANSWER_KEY: Record<number, string> = {
  3001: "B",
  3002: "B",
  3003: "B",
  3004: "C",
  3005: "B",
  3006: "B",
  3007: "C",
  3008: "A",
  3009: "A",
  3010: "B",
  3011: "B",
  3012: "A",
  3013: "C",
  3014: "C",
  3015: "B",
  3016: "B",
  3017: "A",
  3018: "B",
  3019: "A",
  3020: "B",
  3021: "B",
  3022: "A",
  3023: "B",
  3024: "A",
  3025: "A",
  3026: "B",
  3027: "B",
  3028: "A",
  3029: "A",
  3030: "C",
  3031: "A",
  3032: "A",
  3033: "B",
  3034: "A",
  3035: "B",
  3036: "B",
  3037: "B",
  3038: "C",
  3039: "A",
  3040: "B",
  3041: "C",
  3042: "B",
  3043: "A",
  3044: "B",
  3045: "A",
  3046: "A",
  3047: "A",
  3048: "A",
  3049: "B",
  3050: "B"
};

export function gradeMarketingMCQ(qid: number, selectedAnswer: string): boolean {
  const correct = MARKETING_ANSWER_KEY[qid];
  if (!correct || !selectedAnswer) return false;
  const cleanAns = selectedAnswer.trim().toUpperCase();
  return cleanAns.startsWith(correct);
}

export interface MarketingGradingResult {
  totalAttempted: number;
  totalCorrect: number;
  totalMarks: number;
  percentage: number;
  isPass: boolean;
  questionDetails: Array<{
    id: number;
    number: number;
    questionText: string;
    selectedOption: string;
    correctOption: string;
    isCorrect: boolean;
    marks: number;
  }>;
}

export function gradeMarketingFull(answers: Record<number, string>): MarketingGradingResult {
  let totalAttempted = 0;
  let totalCorrect = 0;
  let totalMarks = 0;

  const questionDetails = MARKETING_QUESTIONS.map((q) => {
    const userAns = answers[q.id] || "";
    const isAttempted = userAns.trim() !== "";
    if (isAttempted) totalAttempted++;

    const isCorrect = gradeMarketingMCQ(q.id, userAns);
    const marksObtained = isCorrect ? q.marks : 0;
    if (isCorrect) totalCorrect++;
    totalMarks += marksObtained;

    return {
      id: q.id,
      number: q.number,
      questionText: q.questionText,
      selectedOption: userAns,
      correctOption: MARKETING_ANSWER_KEY[q.id] || "N/A",
      isCorrect,
      marks: marksObtained,
    };
  });

  const percentage = Math.round((totalMarks / 100) * 100);
  const isPass = totalMarks >= 40;

  return {
    totalAttempted,
    totalCorrect,
    totalMarks,
    percentage,
    isPass,
    questionDetails,
  };
}
