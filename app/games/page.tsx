import Link from "next/link";
import { EmptyState } from "@/components/EmptyState";
import { getGames } from "@/lib/queries";

export default async function GamesPage() {
  const games = await getGames();

  return (
    <div className="space-y-5">
      <h1 className="text-2xl font-bold">ゲーム一覧</h1>
      <p className="text-sm text-gray-600">最初は5タイトルだけ。気になったゲームのコミュニティに入って感想を語ろう。</p>
      {games.length ? (
        <div className="grid gap-3 sm:grid-cols-2">
          {games.map((game) => (
            <Link key={game.id} href={`/games/${game.slug}`} className="card block hover:border-accent">
              <p className="text-lg font-semibold">{game.name}</p>
              <p className="mt-2 text-sm text-gray-600">{game.description || "このゲームのコミュニティへ"}</p>
            </Link>
          ))}
        </div>
      ) : (
        <EmptyState title="ゲームが未登録です" description="seed.sql を実行すると初期ゲームが表示されます。" />
      )}
    </div>
  );
}
