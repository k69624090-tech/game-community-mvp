"use client";

import { useMemo, useState } from "react";
import { createPostAction } from "@/app/actions";

type GameOption = {
  id: string;
  name: string;
};

type CategoryOption = {
  id: string;
  game_id: string | null;
  name: string;
};

type CreatePostFormProps = {
  games: GameOption[];
  categories: CategoryOption[];
  error?: string;
};

export function CreatePostForm({ games, categories, error }: CreatePostFormProps) {
  const [gameId, setGameId] = useState("");
  const [categoryId, setCategoryId] = useState("");

  const filteredCategories = useMemo(() => {
    if (!gameId) {
      return [];
    }
    return categories.filter((category) => category.game_id === null || category.game_id === gameId);
  }, [categories, gameId]);

  return (
    <>
      {error ? <p className="rounded-xl bg-rose-50 p-3 text-sm text-rose-700">{decodeURIComponent(error)}</p> : null}
      <form action={createPostAction} className="card space-y-3">
        <div>
          <label className="mb-1 block text-sm font-semibold">ゲーム</label>
          <select
            name="gameId"
            className="input"
            required
            value={gameId}
            onChange={(event) => {
              setGameId(event.target.value);
              setCategoryId("");
            }}
          >
            <option value="">選択してください</option>
            {games.map((game) => (
              <option key={game.id} value={game.id}>
                {game.name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="mb-1 block text-sm font-semibold">カテゴリ</label>
          <select
            name="categoryId"
            className="input"
            required
            disabled={!gameId}
            value={categoryId}
            onChange={(event) => setCategoryId(event.target.value)}
          >
            <option value="">{gameId ? "選択してください" : "先にゲームを選択してください"}</option>
            {filteredCategories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.game_id ? `ゲーム別: ${category.name}` : `共通: ${category.name}`}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="mb-1 block text-sm font-semibold">タイトル（任意）</label>
          <input name="title" className="input" maxLength={80} placeholder="例: 今日はこのシーンで泣いた" />
        </div>
        <div>
          <label className="mb-1 block text-sm font-semibold">本文</label>
          <textarea name="body" className="textarea" required maxLength={2000} placeholder="感想や雑談を自由に書いてください。" />
        </div>
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" name="spoilerFlag" className="h-4 w-4 rounded border-orange-200" />
          ネタバレを含む
        </label>
        <button type="submit" className="button-primary">
          投稿する
        </button>
      </form>
    </>
  );
}
