import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Header from '../components/Header';
import Footer from '../components/Footer';

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "int0x80.ca",
  description: "A personal devlog and portfolio site",
  openGraph: {
    title: "int0x80.ca",
    description: "A personal devlog and portfolio site",
    siteName: "int0x80.ca",
    type: "website",
  },
  twitter: {
    card: "summary",
    title: "int0x80.ca",
    description: "A personal devlog and portfolio site",
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
	  <head>
		<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.9.0/styles/github-dark.min.css" />
		<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/katex@0.16.9/dist/katex.min.css" integrity="sha384-n8MVd4RsNIU0tAv4ct0nTaAbDJwPJzDEaqSD1odI+WdtXRGWt2kTvGFasHpSy3SV" crossOrigin="anonymous" />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-screen flex flex-col`}
      >
		<Header />
        <main className="flex-grow">
          {children}
        </main>
		<Footer />
      </body>
    </html>
  );
}
