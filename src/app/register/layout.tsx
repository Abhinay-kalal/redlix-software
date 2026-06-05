import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Candidate Registration | Redlix Secure",
  description: "Register for your scheduled examination and generate your printable hall ticket/permit on the Redlix Secure portal.",
};

export default function RegisterLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
