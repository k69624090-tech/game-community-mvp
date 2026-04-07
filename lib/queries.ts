import { createSupabaseServerClient } from "@/lib/supabase/server";
import { PostDetail, PostListItem, ReactionType } from "@/types/models";

type RawPost = {
  id: string;
  title: string | null;
  body: string;
  spoiler_flag: boolean;
  created_at: string;
  game: { id: string; slug: string; name: string } | null;
  category: { id: string; name: string } | null;
  author: { id: string; username: string; avatar_url: string | null } | null;
};

function takeFirst<T>(value: T | T[] | null | undefined): T | null {
  if (!value) {
    return null;
  }
  if (Array.isArray(value)) {
    return value[0] ?? null;
  }
  return value;
}

function normalizeRawPost(post: {
  id: string;
  title: string | null;
  body: string;
  spoiler_flag: boolean;
  created_at: string;
  game: { id: string; slug: string; name: string } | { id: string; slug: string; name: string }[] | null;
  category: { id: string; name: string } | { id: string; name: string }[] | null;
  author:
    | { id: string; username: string; avatar_url: string | null }
    | { id: string; username: string; avatar_url: string | null }[]
    | null;
}): RawPost {
  return {
    ...post,
    game: takeFirst(post.game),
    category: takeFirst(post.category),
    author: takeFirst(post.author)
  };
}

function toPostListItem(post: RawPost, reactionCount: number, commentCount: number): PostListItem {
  return {
    id: post.id,
    title: post.title,
    body: post.body,
    spoiler_flag: post.spoiler_flag,
    created_at: post.created_at,
    game: post.game ?? { id: "", slug: "", name: "不明なゲーム" },
    category: post.category ?? { id: "", name: "未分類" },
    author: post.author,
    reaction_count: reactionCount,
    comment_count: commentCount
  };
}

async function getCountsForPost(postId: string): Promise<{ reactions: number; comments: number }> {
  try {
    const supabase = await createSupabaseServerClient();
    const [{ count: reactionCount }, { count: commentCount }] = await Promise.all([
      supabase.from("reactions").select("id", { count: "exact", head: true }).eq("post_id", postId),
      supabase.from("comments").select("id", { count: "exact", head: true }).eq("post_id", postId)
    ]);

    return {
      reactions: reactionCount ?? 0,
      comments: commentCount ?? 0
    };
  } catch {
    return { reactions: 0, comments: 0 };
  }
}

export async function getGames() {
  try {
    const supabase = await createSupabaseServerClient();
    const { data, error } = await supabase.from("games").select("*").order("created_at", { ascending: true });
    if (error) {
      return [];
    }
    return data;
  } catch {
    return [];
  }
}

export async function getGameBySlug(slug: string) {
  try {
    const supabase = await createSupabaseServerClient();
    const { data, error } = await supabase.from("games").select("*").eq("slug", slug).maybeSingle();
    if (error) {
      return null;
    }
    return data;
  } catch {
    return null;
  }
}

export async function getCategories(gameId?: string) {
  try {
    const supabase = await createSupabaseServerClient();
    let query = supabase.from("categories").select("*").order("name");
    if (gameId) {
      query = query.or(`game_id.is.null,game_id.eq.${gameId}`);
    }
    const { data, error } = await query;
    if (error) {
      return [];
    }
    return data;
  } catch {
    return [];
  }
}

export async function getRecentPosts(limit = 12): Promise<PostListItem[]> {
  try {
    const supabase = await createSupabaseServerClient();
    const { data, error } = await supabase
      .from("posts")
      .select(
        "id,title,body,spoiler_flag,created_at,game:games(id,slug,name),category:categories(id,name),author:users(id,username,avatar_url)"
      )
      .order("created_at", { ascending: false })
      .limit(limit);

    if (error || !data) {
      return [];
    }

    const enriched = await Promise.all(
      data.map(async (post) => {
        const counts = await getCountsForPost(post.id);
        return toPostListItem(normalizeRawPost(post), counts.reactions, counts.comments);
      })
    );

    return enriched;
  } catch {
    return [];
  }
}

export async function getPostsByGame(gameId: string, limit = 20): Promise<PostListItem[]> {
  try {
    const supabase = await createSupabaseServerClient();
    const { data, error } = await supabase
      .from("posts")
      .select(
        "id,title,body,spoiler_flag,created_at,game:games(id,slug,name),category:categories(id,name),author:users(id,username,avatar_url)"
      )
      .eq("game_id", gameId)
      .order("created_at", { ascending: false })
      .limit(limit);

    if (error || !data) {
      return [];
    }

    const enriched = await Promise.all(
      data.map(async (post) => {
        const counts = await getCountsForPost(post.id);
        return toPostListItem(normalizeRawPost(post), counts.reactions, counts.comments);
      })
    );

    return enriched;
  } catch {
    return [];
  }
}

export async function getPopularPosts(limit = 8): Promise<PostListItem[]> {
  const recent = await getRecentPosts(80);
  return recent
    .sort((a, b) => {
      if (b.reaction_count !== a.reaction_count) {
        return b.reaction_count - a.reaction_count;
      }
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    })
    .slice(0, limit);
}

export async function getPostDetail(postId: string): Promise<PostDetail | null> {
  try {
    const supabase = await createSupabaseServerClient();
    const { data: post, error: postError } = await supabase
      .from("posts")
      .select(
        "id,title,body,spoiler_flag,created_at,game:games(id,slug,name),category:categories(id,name),author:users(id,username,avatar_url)"
      )
      .eq("id", postId)
      .maybeSingle();

    if (postError || !post) {
      return null;
    }

    const [{ data: commentsData }, { data: reactionsData }, counts] = await Promise.all([
      supabase
        .from("comments")
        .select("id,body,created_at,author:users(id,username,avatar_url)")
        .eq("post_id", postId)
        .order("created_at", { ascending: true }),
      supabase.from("reactions").select("type").eq("post_id", postId),
      getCountsForPost(postId)
    ]);

    const reactionMap = new Map<ReactionType, number>();
    (reactionsData ?? []).forEach((reaction) => {
      const type = reaction.type as ReactionType;
      reactionMap.set(type, (reactionMap.get(type) ?? 0) + 1);
    });

    return {
      ...toPostListItem(normalizeRawPost(post), counts.reactions, counts.comments),
      comments: (commentsData ?? []).map((comment) => ({
        id: comment.id,
        body: comment.body,
        created_at: comment.created_at,
        author: takeFirst(
          comment.author as
            | { id: string; username: string; avatar_url: string | null }
            | { id: string; username: string; avatar_url: string | null }[]
            | null
        )
      })),
      reactions: Array.from(reactionMap.entries()).map(([type, count]) => ({ type, count }))
    };
  } catch {
    return null;
  }
}

export async function getUserProfile(userId: string) {
  try {
    const supabase = await createSupabaseServerClient();
    const { data, error } = await supabase.from("users").select("*").eq("id", userId).maybeSingle();
    if (error) {
      return null;
    }
    return data;
  } catch {
    return null;
  }
}

export async function getUserPosts(userId: string) {
  try {
    const supabase = await createSupabaseServerClient();
    const { data, error } = await supabase
      .from("posts")
      .select(
        "id,title,body,spoiler_flag,created_at,game:games(id,slug,name),category:categories(id,name),author:users(id,username,avatar_url)"
      )
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(20);

    if (error || !data) {
      return [];
    }

    return Promise.all(
      data.map(async (post) => {
        const counts = await getCountsForPost(post.id);
        return toPostListItem(normalizeRawPost(post), counts.reactions, counts.comments);
      })
    );
  } catch {
    return [];
  }
}
