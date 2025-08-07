import { auth } from "@clerk/nextjs/server";
import Navigation from "@/components/Navigation";
import DashboardClient from "./DashboardClient";

export default async function DashboardPage() {
  await auth.protect();

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      <DashboardClient />
    </div>
  );
} 