import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Hackathons Management | Redlix Admin",
  description: "Create, configure, and manage technical hackathons and engineering sprints.",
};

export default function AdminHackathonsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
