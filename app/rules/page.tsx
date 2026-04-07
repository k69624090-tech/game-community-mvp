export default function RulesPage() {
  return (
    <div className="mx-auto max-w-3xl space-y-4">
      <h1 className="text-2xl font-bold">利用規約 / コミュニティルール</h1>
      <div className="card space-y-3 text-sm leading-7">
        <p>このコミュニティは「初心者でも気軽に語れる」ことを大切にしています。</p>
        <p>以下の行為は禁止です。</p>
        <ul className="list-disc space-y-1 pl-5">
          <li>人格否定、煽り、マウント、差別的表現</li>
          <li>過度なネタバレの強要や配慮のない投稿</li>
          <li>スパム、宣伝、外部サービスへの誘導のみを目的とした投稿</li>
          <li>個人情報の公開、プライバシー侵害</li>
        </ul>
        <p>不適切な投稿・コメントは通報機能をご利用ください。運営判断で削除等を行う場合があります。</p>
      </div>
    </div>
  );
}
