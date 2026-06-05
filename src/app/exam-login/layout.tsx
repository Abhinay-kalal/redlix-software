import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Candidate Exam Portal Login | Redlix Secure",
  description: "Securely sign in to your assigned online examination using your full name and hall ticket number.",
};

export default function ExamLoginLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
