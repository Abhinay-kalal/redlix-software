import { ANALYTICS_QUESTIONS } from "./analyticsQuestions";

export const ANALYTICS_ANSWER_KEY: Record<number, string> = {
  4001: "B",
  4002: "B",
  4003: "C",
  4004: "B",
  4005: "C",
  4006: "C",
  4007: "B",
  4008: "B",
  4009: "B",
  4010: "C",
  4011: "D",
  4012: "A",
  4013: "B",
  4014: "B",
  4015: "B",
  4016: "B",
  4017: "B",
  4018: "B",
  4019: "A",
  4020: "B",
  4021: "B",
  4022: "B",
  4023: "A",
  4024: "C",
  4025: "C",
  4026: "C",
  4027: "C",
  4028: "B",
  4029: "C",
  4030: "C",
  4031: "B",
  4032: "B",
  4033: "A",
  4034: "B",
  4035: "B",
  4036: "B",
  4037: "A",
  4038: "B",
  4039: "C",
  4040: "C",
  4041: "C",
  4042: "C",
  4043: "B",
  4044: "B",
  4045: "B",
  4046: "B",
  4047: "B",
  4048: "B",
  4049: "B",
  4050: "A"
};

export function gradeAnalyticsMCQ(qid: number, selectedAnswer: string): boolean {
  const correct = ANALYTICS_ANSWER_KEY[qid];
  if (!correct || !selectedAnswer) return false;
  const cleanAns = selectedAnswer.trim().toUpperCase();
  return cleanAns.startsWith(correct);
}

export interface AnalyticsGradingResult {
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

export function gradeAnalyticsFull(answers: Record<number, string>): AnalyticsGradingResult {
  let totalAttempted = 0;
  let totalCorrect = 0;
  let totalMarks = 0;

  const questionDetails = ANALYTICS_QUESTIONS.map((q) => {
    const userAns = answers[q.id] || "";
    const isAttempted = userAns.trim() !== "";
    if (isAttempted) totalAttempted++;

    const isCorrect = gradeAnalyticsMCQ(q.id, userAns);
    const marksObtained = isCorrect ? q.marks : 0;
    if (isCorrect) totalCorrect++;
    totalMarks += marksObtained;

    return {
      id: q.id,
      number: q.number,
      questionText: q.questionText,
      selectedOption: userAns,
      correctOption: ANALYTICS_ANSWER_KEY[q.id] || "N/A",
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
