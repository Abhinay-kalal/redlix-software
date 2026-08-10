import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Redlix Hackathons & Engineering Sprints",
  description: "Discover high-impact hackathons, engineering sprints, and developer challenges on Redlix.",
};

export default function HackathonsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
