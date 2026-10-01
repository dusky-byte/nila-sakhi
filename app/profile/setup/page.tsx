import { currentUser } from "@/lib/supabase/server";
export default async function Setup() {
  const user = await currentUser();
  return <main className="mx-auto max-w-2xl px-6 py-16"><h1 className="text-2xl font-semibold">Welcome{user?.user_metadata?.full_name ? `, ${user.user_metadata.full_name}` : ""}</h1></main>;
}
