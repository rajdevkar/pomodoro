import clsx from "clsx";
import type { Metadata, Viewport } from "next";
import {
  Doto,
  Fascinate,
  Geist,
  Geist_Mono,
  Orbitron,
  Sixtyfour,
} from "next/font/google";
import "./globals.css";
import JotaiProvider from "@/components/JotaiProvider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const doto = Doto({
  variable: "--font-doto",
  subsets: ["latin"],
});

const fascinate = Fascinate({
  variable: "--font-fascinate",
  weight: "400",
  subsets: ["latin"],
});

const sixtyFour = Sixtyfour({
  variable: "--font-sixtyfour",
  subsets: ["latin"],
});

const orbitron = Orbitron({
  variable: "--font-orbitron",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "OrientTimer",
  description: "A minimalist Pomodoro timer with orientation controls",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "OrientTimer",
  },
};

export const viewport: Viewport = {
  themeColor: "#000000",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={clsx(
          geistSans.variable,
          geistMono.variable,
          doto.variable,
          fascinate.variable,
          sixtyFour.variable,
          orbitron.variable,
          "antialiased",
        )}
      >
        <JotaiProvider>{children}</JotaiProvider>
      </body>
    </html>
  );
}
