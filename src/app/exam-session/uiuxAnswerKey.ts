import { UIUX_QUESTIONS } from "./uiuxQuestions";

export const UIUX_ANSWER_KEY: Record<number, string> = {
  5001: "B",
  5002: "A",
  5003: "A",
  5004: "A",
  5005: "B",
  5006: "A",
  5007: "B",
  5008: "A",
  5009: "C",
  5010: "A",
  5011: "A",
  5012: "A",
  5013: "B",
  5014: "A",
  5015: "A",
  5016: "B",
  5017: "A",
  5018: "B",
  5019: "A",
  5020: "A",
  5021: "B",
  5022: "A",
  5023: "B",
  5024: "A",
  5025: "A",
  5026: "B",
  5027: "C",
  5028: "B",
  5029: "B",
  5030: "B",
  5031: "B",
  5032: "A",
  5033: "A",
  5034: "B",
  5035: "A",
  5036: "C",
  5037: "B",
  5038: "A",
  5039: "A",
  5040: "A",
  5041: "B",
  5042: "A",
  5043: "B",
  5044: "B",
  5045: "A",
  5046: "A",
  5047: "A",
  5048: "B",
  5049: "B",
  5050: "C"
};

export function gradeUIUXMCQ(qid: number, selectedAnswer: string): boolean {
  const correct = UIUX_ANSWER_KEY[qid];
  if (!correct || !selectedAnswer) return false;
  const cleanAns = selectedAnswer.trim().toUpperCase();
  return cleanAns.startsWith(correct);
}

export interface UIUXGradingResult {
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

export function gradeUIUXFull(answers: Record<number, string>): UIUXGradingResult {
  let totalAttempted = 0;
  let totalCorrect = 0;
  let totalMarks = 0;

  const questionDetails = UIUX_QUESTIONS.map((q) => {
    const userAns = answers[q.id] || "";
    const isAttempted = userAns.trim() !== "";
    if (isAttempted) totalAttempted++;

    const isCorrect = gradeUIUXMCQ(q.id, userAns);
    const marksObtained = isCorrect ? q.marks : 0;
    if (isCorrect) totalCorrect++;
    totalMarks += marksObtained;

    return {
      id: q.id,
      number: q.number,
      questionText: q.questionText,
      selectedOption: userAns,
      correctOption: UIUX_ANSWER_KEY[q.id] || "N/A",
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
