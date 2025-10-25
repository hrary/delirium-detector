import { cookies } from "next/headers";
import DashboardClient from "./dashboard";

export default async function Page() {
  const cookieStore = await cookies();
  const username = cookieStore.get("username")?.value || "User";
  
  return <DashboardClient username={username} />;
}
