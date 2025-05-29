import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Head from "next/head";

// Import Geist Sans
const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

// Import Geist Mono
const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "Social Atlas",
  description: "Your global adventure and creator hub.",
  icons: {
    icon: [
      { url: "/earthy-favicon.ico?v=2" },
      { url: "/favicon-32x32.png?v=2", sizes: "32x32", type: "image/png" },
      { url: "/favicon-16x16.png?v=2", sizes: "16x16", type: "image/png" },
    ],
    apple: "/apple-touch-icon.png?v=2",
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable}`}>
      <Head>
        <link
          href="https://fonts.googleapis.com/css2?family=Poppins+Rounded:wght@400;600;700&display=swap"
          rel="stylesheet"
        />
      </Head>
      <body className="font-poppins antialiased">
        {children}
      </body>
    </html>
  );
}
