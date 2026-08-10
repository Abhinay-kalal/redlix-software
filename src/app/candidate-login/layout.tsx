import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Candidate Login | Redlix Secure",
  description: "Sign in to access your candidate dashboard and scheduled examinations on Redlix.",
};

export default function CandidateLoginLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
