import Link from "next/link";
import { EmptyState } from "@/components/EmptyState";
import { PostCard } from "@/components/PostCard";
import { SITE_COPY } from "@/lib/constants";
import { getGames, getPopularPosts, getRecentPosts } from "@/lib/queries";

export default async function HomePage() {
  const [games, recentPosts, popularPosts] = await Promise.all([getGames(), getRecentPosts(8), getPopularPosts(6)]);

  return (
    <div className="space-y-8">
      <section className="card overflow-hidden bg-gradient-to-br from-soft via-white to-orange-50">
        <p className="text-sm font-semibold text-accent">初心者歓迎コミュニティ</p>
        <h1 className="mt-2 text-2xl font-bold leading-9 sm:text-3xl">{SITE_COPY.title}</h1>
        <p className="mt-2 text-sm text-gray-600">{SITE_COPY.subtitle}</p>
        <div className="mt-5 flex flex-wrap gap-2">
          <Link href="/games" className="button-primary">
            ゲーム一覧を見る
          </Link>
          <Link href="/create" className="button-soft">
            感想を投稿する
          </Link>
        </div>
      </section>

      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold">対応ゲーム（初期5タイトル）</h2>
          <Link href="/games" className="text-sm text-accent underline-offset-2 hover:underline">
            すべて見る
          </Link>
        </div>
        <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-3">
          {games.map((game) => (
            <Link key={game.id} href={`/games/${game.slug}`} className="card block hover:border-accent">
              <p className="font-semibold">{game.name}</p>
              <p className="mt-2 text-sm text-gray-600">{game.description || "このゲームの感想を語ろう。"}</p>
            </Link>
          ))}
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="text-lg font-bold">新着投稿</h2>
        <div className="grid gap-3">
          {recentPosts.length ? recentPosts.map((post) => <PostCard key={post.id} post={post} />) : <EmptyState title="まだ投稿がありません" description="最初の感想投稿をして、コミュニティを始めましょう。" />}
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="text-lg font-bold">人気投稿</h2>
        <div className="grid gap-3">
          {popularPosts.length ? popularPosts.map((post) => <PostCard key={post.id} post={post} />) : <EmptyState title="人気投稿はまだありません" description="リアクションが集まるとここに表示されます。" />}
        </div>
      </section>
    </div>
  );
}
