"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/admin";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { ReactionType } from "@/types/models";

const allowedReactions: ReactionType[] = ["like", "wakaru", "suki", "cried", "lol", "helpful"];

function withError(path: string, message: string): string {
  const separator = path.includes("?") ? "&" : "?";
  return `${path}${separator}error=${encodeURIComponent(message)}`;
}

function withNotice(path: string, notice: string): string {
  const separator = path.includes("?") ? "&" : "?";
  return `${path}${separator}notice=${encodeURIComponent(notice)}`;
}

async function requireUserId() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  return user.id;
}

export async function signUpAction(formData: FormData) {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  if (!email || !password) {
    redirect(withError("/signup", "入力が不足しています"));
  }

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.auth.signUp({ email, password });
  if (error) {
    redirect(`/signup?error=${encodeURIComponent(error.message)}`);
  }

  redirect("/login?registered=1");
}

export async function signInAction(formData: FormData) {
  try {
    const email = String(formData.get("email") ?? "").trim();
    const password = String(formData.get("password") ?? "");
    if (!email || !password) {
      redirect(withError("/login", "入力が不足しています"));
    }

    const supabase = await createSupabaseServerClient();
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      redirect(`/login?error=${encodeURIComponent(error.message)}`);
    }

    const signedInUserId = data.user?.id ?? null;
    if (signedInUserId) {
      try {
        const { data: profile } = await supabase.from("users").select("role").eq("id", signedInUserId).maybeSingle();
        if (profile?.role === "admin") {
          redirect("/admin");
        }
      } catch {
        // usersテーブル未作成/クエリエラー時は一般ユーザー遷移へフォールバック
      }
    }

    redirect("/");
  } catch {
    redirect(withError("/login", "ログイン処理中にエラーが発生しました"));
  }
}

export async function signOutAction() {
  const supabase = await createSupabaseServerClient();
  await supabase.auth.signOut();
  redirect("/");
}

export async function createPostAction(formData: FormData) {
  const userId = await requireUserId();
  const gameId = String(formData.get("gameId") ?? "");
  const categoryId = String(formData.get("categoryId") ?? "");
  const title = String(formData.get("title") ?? "").trim();
  const body = String(formData.get("body") ?? "").trim();
  const spoilerFlag = formData.get("spoilerFlag") === "on";

  if (!gameId || !categoryId || !body) {
    redirect(withError("/create", "必須項目を入力してください"));
  }

  const supabase = await createSupabaseServerClient();
  const { data: category } = await supabase.from("categories").select("game_id").eq("id", categoryId).maybeSingle();
  if (!category) {
    redirect(withError("/create", "カテゴリが見つかりません"));
  }
  if (category.game_id && category.game_id !== gameId) {
    redirect(withError("/create", "ゲームとカテゴリの組み合わせが正しくありません"));
  }

  const { data, error } = await supabase
    .from("posts")
    .insert({
      user_id: userId,
      game_id: gameId,
      category_id: categoryId,
      title: title || null,
      body,
      spoiler_flag: spoilerFlag
    })
    .select("id")
    .single();

  if (error || !data) {
    redirect(withError("/create", "投稿に失敗しました"));
  }

  revalidatePath("/");
  revalidatePath("/games");
  redirect(`/posts/${data.id}`);
}

export async function addCommentAction(formData: FormData) {
  const userId = await requireUserId();
  const postId = String(formData.get("postId") ?? "");
  const body = String(formData.get("body") ?? "").trim();

  if (!postId || !body) {
    redirect(`/posts/${postId}`);
  }

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.from("comments").insert({
    post_id: postId,
    user_id: userId,
    body
  });
  if (error) {
    redirect(withError(`/posts/${postId}`, "コメント投稿に失敗しました"));
  }

  revalidatePath(`/posts/${postId}`);
  redirect(`/posts/${postId}`);
}

export async function addReactionAction(formData: FormData) {
  const userId = await requireUserId();
  const postId = String(formData.get("postId") ?? "");
  const reactionType = String(formData.get("reactionType") ?? "") as ReactionType;

  if (!postId || !allowedReactions.includes(reactionType)) {
    redirect(`/posts/${postId}`);
  }

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.from("reactions").insert({
    post_id: postId,
    user_id: userId,
    type: reactionType
  });

  if (error && error.code !== "23505") {
    redirect(withError(`/posts/${postId}`, "リアクションに失敗しました"));
  }

  revalidatePath(`/posts/${postId}`);
  revalidatePath("/");
  redirect(`/posts/${postId}`);
}

export async function reportAction(formData: FormData) {
  const userId = await requireUserId();
  const targetType = String(formData.get("targetType") ?? "") as "post" | "comment" | "user";
  const targetId = String(formData.get("targetId") ?? "");
  const reason = String(formData.get("reason") ?? "").trim();

  if (!targetId || !reason || !["post", "comment", "user"].includes(targetType)) {
    redirect("/");
  }

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.from("reports").insert({
    target_type: targetType,
    target_id: targetId,
    user_id: userId,
    reason
  });

  const referer = String(formData.get("redirectTo") ?? "/");
  if (error) {
    redirect(withError(referer, "通報に失敗しました"));
  }
  revalidatePath(referer);
  const separator = referer.includes("?") ? "&" : "?";
  redirect(`${referer}${separator}notice=report_submitted`);
}

export async function updateProfileAction(formData: FormData) {
  const userId = await requireUserId();
  const profileId = String(formData.get("profileId") ?? "");
  const username = String(formData.get("username") ?? "").trim();
  const avatarUrl = String(formData.get("avatarUrl") ?? "").trim();
  const bio = String(formData.get("bio") ?? "").trim();
  const favoriteGamesRaw = String(formData.get("favoriteGames") ?? "").trim();

  if (userId !== profileId) {
    redirect(withError(`/profile/${profileId}`, "他ユーザーの編集はできません"));
  }

  const favoriteGames = favoriteGamesRaw
    ? favoriteGamesRaw
        .split(",")
        .map((value) => value.trim())
        .filter(Boolean)
    : [];

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase
    .from("users")
    .update({
      username: username || "ゲーマーさん",
      avatar_url: avatarUrl || null,
      bio: bio || null,
      favorite_games: favoriteGames.length ? favoriteGames : null
    })
    .eq("id", userId);

  if (error) {
    redirect(withError(`/profile/${profileId}`, "更新に失敗しました"));
  }

  revalidatePath(`/profile/${profileId}`);
  redirect(`/profile/${profileId}`);
}

export async function adminDeletePostAction(formData: FormData) {
  const { supabase } = await requireAdmin();
  const postId = String(formData.get("postId") ?? "");
  const redirectTo = String(formData.get("redirectTo") ?? "/admin/reports");

  if (!postId) {
    redirect(withError(redirectTo, "投稿IDが不正です"));
  }

  const { error } = await supabase.from("posts").delete().eq("id", postId);
  if (error) {
    redirect(withError(redirectTo, "投稿削除に失敗しました"));
  }

  revalidatePath("/admin/reports");
  revalidatePath("/");
  redirect(withNotice(redirectTo, "post_deleted"));
}

export async function adminDeleteCommentAction(formData: FormData) {
  const { supabase } = await requireAdmin();
  const commentId = String(formData.get("commentId") ?? "");
  const redirectTo = String(formData.get("redirectTo") ?? "/admin/reports");

  if (!commentId) {
    redirect(withError(redirectTo, "コメントIDが不正です"));
  }

  const { error } = await supabase.from("comments").delete().eq("id", commentId);
  if (error) {
    redirect(withError(redirectTo, "コメント削除に失敗しました"));
  }

  revalidatePath("/admin/reports");
  revalidatePath("/");
  redirect(withNotice(redirectTo, "comment_deleted"));
}
