import { notFound } from "next/navigation";
import { EmptyState } from "@/components/EmptyState";
import { PostCard } from "@/components/PostCard";
import { getCategories, getGameBySlug, getPostsByGame } from "@/lib/queries";

export default async function GameDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const game = await getGameBySlug(slug);
  if (!game) {
    notFound();
  }

  const [posts, categories] = await Promise.all([getPostsByGame(game.id, 30), getCategories(game.id)]);
  const popularPosts = [...posts]
    .sort((a, b) => {
      if (b.reaction_count !== a.reaction_count) {
        return b.reaction_count - a.reaction_count;
      }
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    })
    .slice(0, 5);

  return (
    <div className="space-y-6">
      <section className="card">
        <h1 className="text-2xl font-bold">{game.name}</h1>
        <p className="mt-2 text-sm text-gray-600">{game.description || "このゲームの感想を話しましょう。"}</p>
      </section>

      <section className="card space-y-3">
        <h2 className="text-base font-semibold">カテゴリ</h2>
        <div className="flex flex-wrap gap-2">
          {categories.map((category) => (
            <span key={category.id} className="rounded-full bg-orange-50 px-3 py-1 text-xs text-gray-700">
              {category.name}
            </span>
          ))}
        </div>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-bold">新着投稿</h2>
        {posts.length ? posts.map((post) => <PostCard key={post.id} post={post} />) : <EmptyState title="まだ投稿がありません" description="最初の感想を投稿してみよう。" />}
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-bold">人気投稿</h2>
        {popularPosts.length ? (
          popularPosts.map((post) => <PostCard key={`popular-${post.id}`} post={post} />)
        ) : (
          <EmptyState title="人気投稿はまだありません" description="リアクションが集まるとここに表示されます。" />
        )}
      </section>
    </div>
  );
}
