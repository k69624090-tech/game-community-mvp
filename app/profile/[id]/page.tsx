import { updateProfileAction } from "@/app/actions";
import { EmptyState } from "@/components/EmptyState";
import { PostCard } from "@/components/PostCard";
import { getUserPosts, getUserProfile } from "@/lib/queries";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export default async function ProfilePage({
  params,
  searchParams
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ error?: string }>;
}) {
  const { id } = await params;
  const { error } = await searchParams;

  const [profile, posts] = await Promise.all([getUserProfile(id), getUserPosts(id)]);
  if (!profile) {
    return (
      <div className="card">
        <p className="font-semibold">プロフィールが見つかりません。</p>
      </div>
    );
  }

  const supabase = await createSupabaseServerClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  const editable = user?.id === profile.id;

  return (
    <div className="space-y-5">
      <section className="card space-y-3">
        <h1 className="text-2xl font-bold">{profile.username}</h1>
        {profile.avatar_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={profile.avatar_url} alt="avatar" className="h-16 w-16 rounded-full object-cover" />
        ) : (
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-soft text-sm">No Icon</div>
        )}
        <p className="text-sm text-gray-600">{profile.bio || "自己紹介はまだありません。"}</p>
        <div className="flex flex-wrap gap-2">
          {(profile.favorite_games ?? []).map((game: string) => (
            <span key={game} className="rounded-full bg-orange-50 px-3 py-1 text-xs">
              {game}
            </span>
          ))}
        </div>
      </section>

      {editable ? (
        <section className="card space-y-3">
          <h2 className="text-base font-semibold">プロフィール編集</h2>
          {error ? <p className="rounded-xl bg-rose-50 p-2 text-sm text-rose-700">{decodeURIComponent(error)}</p> : null}
          <form action={updateProfileAction} className="space-y-3">
            <input type="hidden" name="profileId" value={profile.id} />
            <div>
              <label className="mb-1 block text-sm font-semibold">ユーザー名</label>
              <input name="username" defaultValue={profile.username} className="input" maxLength={30} />
            </div>
            <div>
              <label className="mb-1 block text-sm font-semibold">アイコンURL</label>
              <input name="avatarUrl" defaultValue={profile.avatar_url ?? ""} className="input" />
            </div>
            <div>
              <label className="mb-1 block text-sm font-semibold">自己紹介</label>
              <textarea name="bio" defaultValue={profile.bio ?? ""} className="textarea" maxLength={300} />
            </div>
            <div>
              <label className="mb-1 block text-sm font-semibold">好きなゲーム（カンマ区切り）</label>
              <input name="favoriteGames" defaultValue={(profile.favorite_games ?? []).join(", ")} className="input" />
            </div>
            <button type="submit" className="button-primary">
              更新する
            </button>
          </form>
        </section>
      ) : null}

      <section className="space-y-3">
        <h2 className="text-lg font-bold">このユーザーの投稿</h2>
        {posts.length ? posts.map((post) => <PostCard key={post.id} post={post} />) : <EmptyState title="投稿はまだありません" description="投稿されるとここに表示されます。" />}
      </section>
    </div>
  );
}
