import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Assessment Results | Redlix Secure",
  description: "View verified examination scores, category performance, and candidate attempt analytics.",
};

export default function ResultsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
