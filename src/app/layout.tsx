import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Redlix Secure | Smart Proctored Examination System",
  description: "A secure, robust, and state-of-the-art online exam proctoring platform with live-monitoring, local lockout controls, and real-time candidate verification.",
  icons: {
    icon: [
      {
        url: "https://ik.imagekit.io/dypkhqxip/logo.png?updatedAt=1777320313623",
        href: "https://ik.imagekit.io/dypkhqxip/logo.png?updatedAt=1777320313623",
      }
    ],
    shortcut: "https://ik.imagekit.io/dypkhqxip/logo.png?updatedAt=1777320313623",
    apple: "https://ik.imagekit.io/dypkhqxip/logo.png?updatedAt=1777320313623",
  },
  openGraph: {
    title: "Redlix Secure | Smart Proctored Examination System",
    description: "Secure, reliable, and real-time exam proctoring platform with lockout controls.",
    images: ["https://ik.imagekit.io/dypkhqxip/logo.png?updatedAt=1777320313623"],
  },
  twitter: {
    card: "summary",
    title: "Redlix Secure | Smart Proctored Examination System",
    description: "Secure, reliable, and real-time exam proctoring platform with lockout controls.",
    images: ["https://ik.imagekit.io/dypkhqxip/logo.png?updatedAt=1777320313623"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
