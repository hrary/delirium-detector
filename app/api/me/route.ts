import { cookies } from "next/headers";
export async function GET() {
  const cookieStore = await cookies();
  const username = cookieStore.get("username")?.value;
  return new Response(JSON.stringify({ username }));
}
