import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

// Font config
const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: "swap", // tezroq yuklanadi
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
});

// Metadata
export const metadata = {
  title: "AsMedia",
  description: "AsMedia – Watch Movies & Cartoons Online",
  keywords: ["movies", "cartoons", "streaming", "AsMedia"],
  authors: [{ name: "AsMedia Team" }],
  openGraph: {
    title: "AsMedia",
    description: "Watch Movies & Cartoons Online in HD",
    url: "https://asmedia.vercel.app",
    siteName: "AsMedia",
    images: [
      {
        url: "/asmedia-og.jpg", // agar logong bo‘lsa joylashtir
        width: 1200,
        height: 630,
        alt: "AsMedia Preview",
      },
    ],
    locale: "en_US",
    type: "website",
  },
};

// Root Layout
export default function RootLayout({ children }) {
  return (
    <html lang="en" className="scroll-smooth">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-gray-50 dark:bg-gray-950 text-gray-900 dark:text-gray-100 transition-colors duration-300`}
      >
        {children}
      </body>
    </html>
  );
}
