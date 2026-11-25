import type { Metadata, Viewport } from "next";
import { Cinzel, Amiri, Plus_Jakarta_Sans, JetBrains_Mono } from "next/font/google";
import "./globals.css";

const cinzel = Cinzel({
  variable: "--font-cinzel",
  subsets: ["latin"],
  weight: ["500", "600", "700"],
});

const amiri = Amiri({
  variable: "--font-amiri",
  subsets: ["arabic", "latin"],
  weight: ["400", "700"],
});

const jakarta = Plus_Jakarta_Sans({
  variable: "--font-jakarta",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const jetbrains = JetBrains_Mono({
  variable: "--font-jetbrains",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "Mizan (ميزان) — Personal Barakah, Zakaat & Wealth OS",
  description:
    "Unified Islamically-inspired personal finance, 1 Crore Zakaat Mission, Silat al-Rahim ledger, and wealth command center.",
  applicationName: "Mizan",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Mizan",
  },
  icons: {
    icon: "/icon.svg",
    apple: "/icon.svg",
  },
};

export const viewport: Viewport = {
  themeColor: "#060D0B",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${cinzel.variable} ${amiri.variable} ${jakarta.variable} ${jetbrains.variable} h-full antialiased dark`}
    >
      <body className="min-h-full bg-[#060D0B] text-[#F4F1EA] selection:bg-[#D4AF37]/30 selection:text-[#F4F1EA]">
        <div className="islamic-lattice" aria-hidden="true" />
        <div className="relative z-10 min-h-screen flex flex-col">{children}</div>
      </body>
    </html>
  );
}
