import { Database } from "@/types/database";

export type Game = Database["public"]["Tables"]["games"]["Row"];
export type Category = Database["public"]["Tables"]["categories"]["Row"];
export type UserProfile = Database["public"]["Tables"]["users"]["Row"];
export type Post = Database["public"]["Tables"]["posts"]["Row"];
export type Comment = Database["public"]["Tables"]["comments"]["Row"];

export type ReactionType = "like" | "wakaru" | "suki" | "cried" | "lol" | "helpful";

export type PostListItem = {
  id: string;
  title: string | null;
  body: string;
  spoiler_flag: boolean;
  created_at: string;
  game: Pick<Game, "id" | "slug" | "name">;
  category: Pick<Category, "id" | "name">;
  author: Pick<UserProfile, "id" | "username" | "avatar_url"> | null;
  reaction_count: number;
  comment_count: number;
};

export type PostDetail = PostListItem & {
  comments: Array<{
    id: string;
    body: string;
    created_at: string;
    author: Pick<UserProfile, "id" | "username" | "avatar_url"> | null;
  }>;
  reactions: Array<{
    type: ReactionType;
    count: number;
  }>;
};
