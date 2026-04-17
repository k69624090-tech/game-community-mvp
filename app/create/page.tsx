import { redirect } from "next/navigation";
import { CreatePostForm } from "@/components/CreatePostForm";
import { getCategories, getGames } from "@/lib/queries";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export default async function CreatePostPage({
  searchParams
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  let user: { id: string } | null = null;
  try {
    const supabase = await createSupabaseServerClient();
    const {
      data: { user: fetchedUser }
    } = await supabase.auth.getUser();
    user = fetchedUser ? { id: fetchedUser.id } : null;
  } catch {
    user = null;
  }

  if (!user) {
    redirect("/login");
  }

  const [games, categories, { error }] = await Promise.all([getGames(), getCategories(), searchParams]);

  return (
    <div className="mx-auto max-w-2xl space-y-4">
      <h1 className="text-2xl font-bold">投稿を作成</h1>
      <p className="text-sm text-gray-600">攻略よりまず、気持ちを共有しましょう。タイトルは任意です。</p>
      <CreatePostForm games={games} categories={categories} error={error} />
    </div>
  );
}
