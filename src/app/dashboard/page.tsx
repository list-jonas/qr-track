import { getDashboardStats } from "@/server/qr-codes";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import DashboardClientPage from "./dashboard-client-page";

export default async function DashboardPage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    redirect("/sign-in");
  }

  const { success, stats, error } = await getDashboardStats(session.user.id);

  if (!success || !stats) {
    return <div>Error: {error}</div>;
  }

  return <DashboardClientPage stats={stats} />;
}
