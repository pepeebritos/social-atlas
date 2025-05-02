import { Geist, Geist_Mono, Poppins } from "next/font/google";
import "./globals.css";

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

// Import Poppins Rounded
const poppinsRounded = Poppins({
  subsets: ["latin"],
  weight: ["400", "600", "700"],
  style: ["normal"],
  variable: "--font-poppins-rounded",
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
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable} ${poppinsRounded.variable}`}>
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
