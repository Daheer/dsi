import type { Metadata } from "next";
import { Playfair_Display, Lato } from "next/font/google";
import SmoothScroll from "./components/SmoothScroll";
import "./globals.css";

const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
  display: "swap",
});

const lato = Lato({
  variable: "--font-lato",
  weight: ["300", "400", "700"],
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "De Signature International | Luxury & Modernity",
  description: "Experience luxury in our residential and executive wings.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${playfair.variable} ${lato.variable} antialiased font-sans bg-hotel-white text-hotel-gray overflow-x-hidden`}
      >
        <SmoothScroll>{children}</SmoothScroll>
      </body>
    </html>
  );
}
