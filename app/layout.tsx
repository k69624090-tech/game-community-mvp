import type { Metadata } from "next";
import Link from "next/link";
import "./globals.css";
import { SiteHeader } from "@/components/SiteHeader";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "ゲーム感想コミュニティ",
  description: "初心者でも気軽に語れる、ゲーム好きの交流サイト。"
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  let user: { id: string } | null = null;
  let isAdmin = false;

  try {
    const supabase = await createSupabaseServerClient();
    const {
      data: { user: fetchedUser }
    } = await supabase.auth.getUser();
    user = fetchedUser ? { id: fetchedUser.id } : null;

    if (fetchedUser) {
      const { data: profile } = await supabase.from("users").select("role").eq("id", fetchedUser.id).maybeSingle();
      isAdmin = profile?.role === "admin";
    }
  } catch {
    user = null;
    isAdmin = false;
  }

  return (
    <html lang="ja">
      <body>
        <SiteHeader loggedIn={Boolean(user)} currentUserId={user?.id ?? null} isAdmin={isAdmin} />
        <main className="page-shell">{children}</main>
        <footer className="border-t border-orange-100 bg-white">
          <div className="mx-auto flex w-full max-w-5xl items-center justify-between px-4 py-4 text-xs text-gray-600 sm:px-6">
            <p>Game Feelings Community MVP</p>
            <Link href="/rules" className="underline-offset-2 hover:underline">
              利用ルール
            </Link>
          </div>
        </footer>
      </body>
    </html>
  );
}
