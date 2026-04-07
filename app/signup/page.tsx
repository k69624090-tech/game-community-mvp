import Link from "next/link";
import { signUpAction } from "@/app/actions";

export default async function SignupPage({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  const { error } = await searchParams;

  return (
    <div className="mx-auto max-w-md space-y-4">
      <h1 className="text-2xl font-bold">新規登録</h1>
      <p className="text-sm text-gray-600">メールアドレスでアカウントを作成して投稿に参加できます。</p>
      {error ? <p className="rounded-xl bg-rose-50 p-3 text-sm text-rose-700">{decodeURIComponent(error)}</p> : null}
      <form action={signUpAction} className="card space-y-3">
        <div>
          <label className="mb-1 block text-sm font-semibold">メールアドレス</label>
          <input type="email" name="email" className="input" required />
        </div>
        <div>
          <label className="mb-1 block text-sm font-semibold">パスワード（6文字以上）</label>
          <input type="password" name="password" className="input" required minLength={6} />
        </div>
        <button type="submit" className="button-primary w-full">
          登録する
        </button>
      </form>
      <p className="text-sm text-gray-600">
        すでにアカウントをお持ちの方は{" "}
        <Link href="/login" className="text-accent underline-offset-2 hover:underline">
          ログイン
        </Link>
      </p>
    </div>
  );
}
