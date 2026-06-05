import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Admin Console Login | Redlix Secure",
  description: "Secure login portal for system administrators and examiners to configure, monitor, and audit examinations.",
};

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
