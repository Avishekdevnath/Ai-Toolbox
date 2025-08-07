import type { Metadata } from "next";
import { ClerkProvider } from "@clerk/nextjs";
import "./globals.css";

export const metadata: Metadata = {
  title: "AI Toolbox - Authentication",
  description: "Modern authentication with Clerk and Next.js",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
      <html lang="en">
        <body className="min-h-screen bg-gray-50">
          {children}
        </body>
      </html>
    </ClerkProvider>
  );
}
