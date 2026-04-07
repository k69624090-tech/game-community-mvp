import Link from "next/link";

export default function NotFound() {
  return (
    <div className="card text-center">
      <h1 className="text-lg font-bold">ページが見つかりません</h1>
      <p className="mt-2 text-sm text-gray-600">URLが間違っているか、削除された可能性があります。</p>
      <Link href="/" className="button-primary mt-4 inline-block">
        トップへ戻る
      </Link>
    </div>
  );
}
