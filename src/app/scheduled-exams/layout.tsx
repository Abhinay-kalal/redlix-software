import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Scheduled Exams | Redlix Secure",
  description: "View and register for active scheduled examinations on Redlix.",
};

export default function ScheduledExamsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
