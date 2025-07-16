import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import SessionProviderWrapper from "@/components/SessionProviderWrapper";
import ClientLayout from "@/components/ClientLayout";
import React from 'react';

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "AI Toolbox - Your Comprehensive Collection of AI-Powered Tools",
  description: "Discover powerful AI-powered tools for everyday tasks. From age calculators to financial planning, URL shorteners to diet planners - all in one place.",
  keywords: "AI tools, calculator, URL shortener, price tracker, diet planner, finance tools, SWOT analysis, QR generator, password generator, word counter, tip calculator",
  authors: [{ name: "AI Toolbox Team" }],
  openGraph: {
    title: "AI Toolbox - Your Comprehensive Collection of AI-Powered Tools",
    description: "Discover powerful AI-powered tools for everyday tasks.",
    type: "website",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: "AI Toolbox - Your Comprehensive Collection of AI-Powered Tools",
    description: "Discover powerful AI-powered tools for everyday tasks.",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased h-full flex flex-col`}>
        <ClientLayout>{children}</ClientLayout>
      </body>
    </html>
  );
}
