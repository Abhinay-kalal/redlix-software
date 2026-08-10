import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Candidate Dashboard | Redlix Secure",
  description: "Manage your registered exams, view assessment scores, and track proctored hackathons.",
};

export default function CandidateDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
