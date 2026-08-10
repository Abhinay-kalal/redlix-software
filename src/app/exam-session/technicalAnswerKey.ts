import { TECHNICAL_QUESTIONS } from "./technicalQuestions";

export const TECHNICAL_ANSWER_KEY: Record<number, string> = {
  // Section A
  2001: "C",
  2002: "B",
  2003: "C",
  2004: "B",
  2005: "A",
  2006: "A",
  2007: "B",
  2008: "D",
  2009: "B",
  2010: "C",
  2011: "A",
  2012: "A",
  2013: "B",
  2014: "B",
  2015: "A",
  // Section B
  2016: "C",
  2017: "B",
  2018: "B",
  2019: "D",
  2020: "B",
  2021: "B",
  2022: "B",
  2023: "C",
  2024: "B",
  2025: "B"
};

export function gradeTechnicalMCQ(qid: number, selectedAnswer: string): boolean {
  const correct = TECHNICAL_ANSWER_KEY[qid];
  if (!correct || !selectedAnswer) return false;
  const cleanAns = selectedAnswer.trim().toUpperCase();
  return cleanAns.startsWith(correct);
}

export interface TechnicalGradingResult {
  totalAttempted: number;
  mcqCorrect: number;
  mcqMarks: number;
  secACorrect: number;
  secAMarks: number;
  secBCorrect: number;
  secBMarks: number;
  totalMarks: number;
  percentage: number;
  isPass: boolean;
  questionDetails: Array<{
    id: number;
    number: number;
    section: "A" | "B";
    type: "mcq";
    questionText: string;
    selectedOptionOrCode: string;
    correctOption?: string;
    isCorrect?: boolean;
    marks: number;
  }>;
}

export function gradeTechnicalFull(answers: Record<number, string>): TechnicalGradingResult {
  let totalAttempted = 0;
  let mcqCorrect = 0;
  let mcqMarks = 0;
  let secACorrect = 0;
  let secAMarks = 0;
  let secBCorrect = 0;
  let secBMarks = 0;

  const questionDetails = TECHNICAL_QUESTIONS.map((q) => {
    const userAns = answers[q.id] || "";
    const isAttempted = userAns.trim() !== "";
    if (isAttempted) totalAttempted++;

    const isCorrect = gradeTechnicalMCQ(q.id, userAns);
    const marksObtained = isCorrect ? q.marks : 0;
    if (isCorrect) {
      mcqCorrect++;
      if (q.section === "A") secACorrect++;
      else if (q.section === "B") secBCorrect++;
    }
    mcqMarks += marksObtained;
    if (q.section === "A") secAMarks += marksObtained;
    else if (q.section === "B") secBMarks += marksObtained;

    return {
      id: q.id,
      number: q.number,
      section: q.section as "A" | "B",
      type: "mcq" as const,
      questionText: q.questionText,
      selectedOptionOrCode: userAns,
      correctOption: TECHNICAL_ANSWER_KEY[q.id] || "N/A",
      isCorrect,
      marks: marksObtained,
    };
  });

  const totalMarks = mcqMarks;
  const percentage = Math.round((totalMarks / 50) * 100);
  const isPass = totalMarks >= 20;

  return {
    totalAttempted,
    mcqCorrect,
    mcqMarks,
    secACorrect,
    secAMarks,
    secBCorrect,
    secBMarks,
    totalMarks,
    percentage,
    isPass,
    questionDetails,
  };
}
