import Link from "next/link";
import { signOutAction } from "@/app/actions";

type SiteHeaderProps = {
  loggedIn: boolean;
  currentUserId: string | null;
  isAdmin: boolean;
};

export function SiteHeader({ loggedIn, currentUserId, isAdmin }: SiteHeaderProps) {
  return (
    <header className="sticky top-0 z-20 border-b border-orange-100 bg-white/90 backdrop-blur">
      <div className="mx-auto flex w-full max-w-5xl flex-wrap items-center justify-between gap-2 px-4 py-3 sm:flex-nowrap sm:gap-0 sm:px-6">
        <Link href="/" className="font-semibold text-ink">
          ゲーム感想コミュニティ
        </Link>
        <nav className="flex flex-wrap items-center justify-end gap-2 text-sm">
          <Link href="/games" className="button-soft">
            ゲーム一覧
          </Link>
          <Link href="/create" className="button-soft">
            投稿する
          </Link>
          {isAdmin ? (
            <Link href="/admin" className="button-soft">
              管理画面
            </Link>
          ) : null}
          {loggedIn && currentUserId ? (
            <>
              <Link href={`/profile/${currentUserId}`} className="button-primary">
                マイページ
              </Link>
              <form action={signOutAction}>
                <button type="submit" className="button-soft">
                  ログアウト
                </button>
              </form>
            </>
          ) : (
            <Link href="/login" className="button-primary">
              ログイン
            </Link>
          )}
        </nav>
      </div>
    </header>
  );
}
