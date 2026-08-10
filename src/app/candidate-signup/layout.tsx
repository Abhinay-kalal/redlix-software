import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Candidate Registration | Redlix Secure",
  description: "Create your candidate profile to participate in proctored examinations and hackathons on Redlix.",
};

export default function CandidateSignupLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
