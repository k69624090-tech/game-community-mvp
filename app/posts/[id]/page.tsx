import Link from "next/link";
import { addCommentAction } from "@/app/actions";
import { ReactionButtons } from "@/components/ReactionButtons";
import { ReportForm } from "@/components/ReportForm";
import { SpoilerBody } from "@/components/SpoilerBody";
import { REACTION_LABELS } from "@/lib/constants";
import { getPostDetail } from "@/lib/queries";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { ReactionType } from "@/types/models";

export default async function PostDetailPage({
  params,
  searchParams
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ error?: string; notice?: string }>;
}) {
  const { id } = await params;
  const { error, notice } = await searchParams;
  const post = await getPostDetail(id);
  if (!post) {
    return (
      <div className="card">
        <p className="font-semibold">投稿が見つかりませんでした。</p>
      </div>
    );
  }

  const supabase = await createSupabaseServerClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  const reactionSummary = (Object.keys(REACTION_LABELS) as ReactionType[]).reduce<Record<ReactionType, number>>(
    (acc, key) => ({ ...acc, [key]: 0 }),
    { like: 0, wakaru: 0, suki: 0, cried: 0, lol: 0, helpful: 0 }
  );
  post.reactions.forEach((reaction) => {
    reactionSummary[reaction.type] = reaction.count;
  });

  return (
    <div className="space-y-5">
      {notice === "report_submitted" ? (
        <p className="rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-800">
          通報を受け付けました。ご協力ありがとうございます。内容を確認のうえ、必要に応じて対応いたします。
        </p>
      ) : null}
      {error ? <p className="rounded-xl bg-rose-50 p-3 text-sm text-rose-700">{decodeURIComponent(error)}</p> : null}
      <article className="card space-y-4">
        <div className="flex flex-wrap items-center gap-2 text-xs text-gray-500">
          <Link href={`/games/${post.game.slug}`} className="rounded-full bg-orange-100 px-2 py-1 text-ink">
            {post.game.name}
          </Link>
          <span className="rounded-full bg-orange-50 px-2 py-1">{post.category.name}</span>
          {post.spoiler_flag ? (
            <span className="rounded-full bg-rose-100 px-2 py-1 text-rose-700">ネタバレあり</span>
          ) : null}
        </div>
        <h1 className="text-xl font-bold">{post.title?.trim() || "タイトルなし"}</h1>
        <p className="text-xs text-gray-500">投稿者: {post.author?.username ?? "匿名ユーザー"}</p>
        <SpoilerBody body={post.body} spoiler={post.spoiler_flag} />
        <ReactionButtons postId={post.id} summary={reactionSummary} canReact={Boolean(user)} />
        <div className="border-t border-orange-100 pt-3">
          <p className="mb-2 text-xs text-gray-500">不適切な内容は通報してください。</p>
          <ReportForm targetType="post" targetId={post.id} disabled={!user} redirectTo={`/posts/${post.id}`} />
          {!user ? <p className="mt-2 text-xs text-gray-500">通報にはログインが必要です。</p> : null}
        </div>
      </article>

      <section className="card space-y-3">
        <h2 className="text-base font-semibold">コメント</h2>
        {post.comments.length ? (
          <div className="space-y-3">
            {post.comments.map((comment) => (
              <div key={comment.id} className="rounded-xl border border-orange-100 bg-white p-3">
                <p className="whitespace-pre-wrap text-sm">{comment.body}</p>
                <div className="mt-2 flex flex-wrap items-center justify-between gap-2">
                  <p className="text-xs text-gray-500">{comment.author?.username ?? "匿名ユーザー"}</p>
                  <ReportForm targetType="comment" targetId={comment.id} disabled={!user} redirectTo={`/posts/${post.id}`} />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-gray-600">まだコメントはありません。</p>
        )}

        <form action={addCommentAction} className="space-y-2">
          <input type="hidden" name="postId" value={post.id} />
          <textarea name="body" className="textarea" placeholder="コメントを書く" required disabled={!user} />
          <button type="submit" className="button-primary" disabled={!user}>
            コメント投稿
          </button>
          {!user ? <p className="text-xs text-gray-500">コメント投稿にはログインが必要です。</p> : null}
        </form>
      </section>
    </div>
  );
}
