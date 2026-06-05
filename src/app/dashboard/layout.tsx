import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Admin Dashboard | Redlix Secure",
  description: "Real-time AI proctoring monitor, candidate status directory, analytics reports, and system settings console.",
};

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
