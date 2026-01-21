import type { Metadata } from "next";
import { Montserrat } from "next/font/google"; // Changed from Geist
import SessionTimeout from "@/components/auth/SessionTimeout";
import "./globals.css";
import { Navbar } from "@/components/ui/Navbar";
import { Footer } from "@/components/ui/Footer";

const montserrat = Montserrat({
  variable: "--font-montserrat",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Licitaciones Efectivas",
  description: "Portal de servicios de licitaciones y contratación con el estado.",
};

import { auth } from "@/auth";

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await auth();
  return (
    <html lang="es">
      <body
        className={`${montserrat.variable} antialiased min-h-screen flex flex-col`}
      >
        <Navbar session={session} />
        <SessionTimeout session={session} />
        <main className="flex-1">
          {children}
        </main>
        <Footer />
      </body>
    </html>
  );
}
