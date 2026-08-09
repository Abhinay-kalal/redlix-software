import type { Metadata } from "next";
import { Geist, Geist_Mono, Poppins, Inter } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const poppins = Poppins({
  variable: "--font-poppins",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
});

export const metadata: Metadata = {
  title: "Redlix Secure | Smart Proctored Examination System",
  description: "A secure, robust, and state-of-the-art online exam proctoring platform with live-monitoring, local lockout controls, and real-time candidate verification.",
  icons: {
    icon: [
      {
        url: "https://ik.imagekit.io/dypkhqxip/logo__1_?updatedAt=1781048454786",
        href: "https://ik.imagekit.io/dypkhqxip/logo__1_?updatedAt=1781048454786",
      }
    ],
    shortcut: "https://ik.imagekit.io/dypkhqxip/logo__1_?updatedAt=1781048454786",
    apple: "https://ik.imagekit.io/dypkhqxip/logo__1_?updatedAt=1781048454786",
  },
  openGraph: {
    title: "Redlix Secure | Smart Proctored Examination System",
    description: "Secure, reliable, and real-time exam proctoring platform with lockout controls.",
    images: ["https://ik.imagekit.io/dypkhqxip/redlix%20new?updatedAt=1781042212493"],
  },
  twitter: {
    card: "summary",
    title: "Redlix Secure | Smart Proctored Examination System",
    description: "Secure, reliable, and real-time exam proctoring platform with lockout controls.",
    images: ["https://ik.imagekit.io/dypkhqxip/redlix%20new?updatedAt=1781042212493"],
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
      className={`${geistSans.variable} ${geistMono.variable} ${poppins.variable} ${inter.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <head>
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200&display=block"
        />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Rounded:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200&display=block"
        />
      </head>
      <body className="min-h-full flex flex-col">
        {children}
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
