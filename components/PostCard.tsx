import Link from "next/link";
import { PostListItem } from "@/types/models";

type PostCardProps = {
  post: PostListItem;
};

export function PostCard({ post }: PostCardProps) {
  return (
    <article className="card space-y-3">
      <div className="flex flex-wrap items-center gap-2 text-xs text-gray-500">
        <span className="rounded-full bg-orange-100 px-2 py-1 text-ink">{post.game.name}</span>
        <span className="rounded-full bg-orange-50 px-2 py-1">{post.category.name}</span>
        {post.spoiler_flag ? (
          <span className="rounded-full bg-rose-100 px-2 py-1 text-rose-700">ネタバレあり</span>
        ) : null}
      </div>
      <h3 className="text-base font-semibold leading-6">
        <Link href={`/posts/${post.id}`} className="hover:text-accent">
          {post.title?.trim() || "タイトルなし"}
        </Link>
      </h3>
      <p className="line-clamp-3 whitespace-pre-wrap text-sm text-gray-700">
        {post.spoiler_flag ? "本文はネタバレ設定されています。詳細ページで表示できます。" : post.body}
      </p>
      <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-gray-500">
        <span>{post.author?.username ?? "匿名ユーザー"}</span>
        <span>
          共感 {post.reaction_count} ・ コメント {post.comment_count}
        </span>
      </div>
    </article>
  );
}
