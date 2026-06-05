import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Scheduled Exams Directory | Redlix Secure",
  description: "View the official directory of upcoming, active, and completed secure online examinations conducted via Redlix Secure.",
};

export default function ScheduledExamsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
