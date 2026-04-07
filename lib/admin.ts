import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function requireAdmin() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { session }
  } = await supabase.auth.getSession();

  const userId = session?.user?.id;
  if (!userId) {
    redirect("/login");
  }

  const { data: profile } = await supabase.from("users").select("role").eq("id", userId).maybeSingle();
  if (!profile || profile.role !== "admin") {
    redirect("/?error=権限がありません");
  }

  return { supabase, user: session.user };
}
