import type { Metadata } from "next";
import { Plus_Jakarta_Sans, Outfit, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import Navigation from "@/components/Navigation";

const plusJakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-plus-jakarta",
  display: "swap",
});

const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-outfit",
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains",
  display: "swap",
});

export const metadata: Metadata = {
  title: "SustainX 2.0 | Personal Ecological Credit & Micro-dMRV Protocol",
  description: "Next-generation citizen ecological dMRV protocol and dual-token credit engine on Polygon. Built for PROJ-IT781 Capstone, Techno Main Salt Lake.",
  icons: {
    icon: "/favicon.ico",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${plusJakarta.variable} ${outfit.variable} ${jetbrainsMono.variable}`}>
      <body className="min-h-screen bg-slate-950 text-slate-100 flex flex-col md:flex-row antialiased selection:bg-brand-500 selection:text-white font-sans overflow-x-hidden">
        {/* Ambient background glow elements */}
        <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
          <div className="absolute -top-40 -left-40 w-96 h-96 bg-brand-700/15 rounded-full blur-[128px] animate-pulse-subtle" />
          <div className="absolute top-1/3 -right-40 w-[30rem] h-[30rem] bg-emerald-500/10 rounded-full blur-[140px] animate-float-slow" />
          <div className="absolute -bottom-40 left-1/3 w-96 h-96 bg-brand-900/25 rounded-full blur-[128px]" />
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#0234300a_1px,transparent_1px),linear-gradient(to_bottom,#0234300a_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]" />
        </div>

        <Navigation />

        <main className="flex-1 min-w-0 relative z-10 min-h-screen pb-16 md:pb-8">
          {children}
        </main>
      </body>
    </html>
  );
}
