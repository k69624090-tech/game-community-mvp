import Link from "next/link";
import { signInAction } from "@/app/actions";

export default async function LoginPage({
  searchParams
}: {
  searchParams: Promise<{ error?: string; registered?: string }>;
}) {
  const { error, registered } = await searchParams;

  return (
    <div className="mx-auto max-w-md space-y-4">
      <h1 className="text-2xl font-bold">ログイン</h1>
      <p className="text-sm text-gray-600">投稿・コメント・リアクションはログイン後に利用できます。</p>
      {registered ? (
        <p className="rounded-xl bg-mint/20 p-3 text-sm text-emerald-700">
          登録ありがとうございます。ログインして始めましょう。
        </p>
      ) : null}
      {error ? <p className="rounded-xl bg-rose-50 p-3 text-sm text-rose-700">{decodeURIComponent(error)}</p> : null}
      <form action={signInAction} className="card space-y-3">
        <div>
          <label className="mb-1 block text-sm font-semibold">メールアドレス</label>
          <input type="email" name="email" className="input" required />
        </div>
        <div>
          <label className="mb-1 block text-sm font-semibold">パスワード</label>
          <input type="password" name="password" className="input" required minLength={6} />
        </div>
        <button type="submit" className="button-primary w-full">
          ログイン
        </button>
      </form>
      <p className="text-sm text-gray-600">
        アカウントをお持ちでない場合は{" "}
        <Link href="/signup" className="text-accent underline-offset-2 hover:underline">
          新規登録
        </Link>
      </p>
    </div>
  );
}
