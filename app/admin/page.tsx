import Link from "next/link";
import { requireAdmin } from "@/lib/admin";

export default async function AdminTopPage() {
  await requireAdmin();

  return (
    <div className="mx-auto max-w-3xl space-y-4">
      <h1 className="text-2xl font-bold">管理画面</h1>
      <p className="text-sm text-gray-600">このページは管理者のみアクセスできます。</p>
      <div className="card space-y-3">
        <p className="text-sm">まずは通報対応を行います。</p>
        <Link href="/admin/reports" className="button-primary inline-block">
          通報一覧を見る
        </Link>
      </div>
    </div>
  );
}
