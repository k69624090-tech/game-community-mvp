import Link from "next/link";
import { adminDeleteCommentAction, adminDeletePostAction } from "@/app/actions";
import { EmptyState } from "@/components/EmptyState";
import { requireAdmin } from "@/lib/admin";

type ReportRow = {
  id: string;
  target_type: "post" | "comment" | "user";
  target_id: string;
  reason: string;
  created_at: string;
  user_id: string;
};

type PostRow = {
  id: string;
  title: string | null;
};

type CommentRow = {
  id: string;
  post_id: string;
  body: string;
};

type UserRow = {
  id: string;
  username: string;
};

export default async function AdminReportsPage({
  searchParams
}: {
  searchParams: Promise<{ error?: string; notice?: string }>;
}) {
  const { supabase } = await requireAdmin();
  const { error, notice } = await searchParams;

  const { data: reportsData } = await supabase
    .from("reports")
    .select("id,target_type,target_id,reason,created_at,user_id")
    .order("created_at", { ascending: false })
    .limit(100);

  const reports = (reportsData ?? []) as ReportRow[];
  const postIds = reports.filter((report) => report.target_type === "post").map((report) => report.target_id);
  const commentIds = reports.filter((report) => report.target_type === "comment").map((report) => report.target_id);
  const reporterIds = reports.map((report) => report.user_id);

  const [{ data: postsData }, { data: commentsData }, { data: reportersData }] = await Promise.all([
    postIds.length ? supabase.from("posts").select("id,title").in("id", postIds) : Promise.resolve({ data: [] as PostRow[] }),
    commentIds.length
      ? supabase.from("comments").select("id,post_id,body").in("id", commentIds)
      : Promise.resolve({ data: [] as CommentRow[] }),
    reporterIds.length
      ? supabase.from("users").select("id,username").in("id", reporterIds)
      : Promise.resolve({ data: [] as UserRow[] })
  ]);

  const postMap = new Map((postsData ?? []).map((post) => [post.id, post]));
  const commentMap = new Map((commentsData ?? []).map((comment) => [comment.id, comment]));
  const reporterMap = new Map((reportersData ?? []).map((user) => [user.id, user.username]));

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h1 className="text-2xl font-bold">通報一覧</h1>
        <Link href="/admin" className="button-soft">
          管理トップへ
        </Link>
      </div>

      {notice === "post_deleted" ? (
        <p className="rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-800">
          投稿を削除しました。
        </p>
      ) : null}
      {notice === "comment_deleted" ? (
        <p className="rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-800">
          コメントを削除しました。
        </p>
      ) : null}
      {error ? <p className="rounded-xl bg-rose-50 p-3 text-sm text-rose-700">{decodeURIComponent(error)}</p> : null}

      {reports.length ? (
        <div className="space-y-3">
          {reports.map((report) => {
            const post = report.target_type === "post" ? postMap.get(report.target_id) : null;
            const comment = report.target_type === "comment" ? commentMap.get(report.target_id) : null;
            const targetPostId = post?.id ?? comment?.post_id ?? null;
            const reporterName = reporterMap.get(report.user_id) ?? "不明ユーザー";

            return (
              <article key={report.id} className="card space-y-3">
                <div className="flex flex-wrap items-center gap-2 text-xs text-gray-500">
                  <span className="rounded-full bg-orange-100 px-2 py-1">{report.target_type}</span>
                  <span>{new Date(report.created_at).toLocaleString("ja-JP")}</span>
                  <span>通報者: {reporterName}</span>
                </div>

                <div className="space-y-1 text-sm">
                  <p>
                    <span className="font-semibold">理由:</span> {report.reason}
                  </p>
                  <p>
                    <span className="font-semibold">対象ID:</span> {report.target_id}
                  </p>
                  {post ? (
                    <p>
                      <span className="font-semibold">投稿タイトル:</span> {post.title?.trim() || "タイトルなし"}
                    </p>
                  ) : null}
                  {comment ? (
                    <p className="line-clamp-2">
                      <span className="font-semibold">コメント:</span> {comment.body}
                    </p>
                  ) : null}
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  {targetPostId ? (
                    <Link href={`/posts/${targetPostId}`} className="button-soft text-xs">
                      投稿詳細へ移動
                    </Link>
                  ) : null}

                  {report.target_type === "post" && post ? (
                    <form action={adminDeletePostAction}>
                      <input type="hidden" name="postId" value={post.id} />
                      <input type="hidden" name="redirectTo" value="/admin/reports" />
                      <button type="submit" className="rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-xs font-semibold text-rose-700">
                        投稿を削除
                      </button>
                    </form>
                  ) : null}

                  {report.target_type === "comment" && comment ? (
                    <form action={adminDeleteCommentAction}>
                      <input type="hidden" name="commentId" value={comment.id} />
                      <input type="hidden" name="redirectTo" value="/admin/reports" />
                      <button type="submit" className="rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-xs font-semibold text-rose-700">
                        コメントを削除
                      </button>
                    </form>
                  ) : null}
                </div>
              </article>
            );
          })}
        </div>
      ) : (
        <EmptyState title="通報はまだありません" description="通報が発生すると、ここに表示されます。" />
      )}
    </div>
  );
}
