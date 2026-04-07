"use client";

import { useState } from "react";

type SpoilerBodyProps = {
  body: string;
  spoiler: boolean;
};

export function SpoilerBody({ body, spoiler }: SpoilerBodyProps) {
  const [open, setOpen] = useState(!spoiler);

  if (!spoiler) {
    return <p className="whitespace-pre-wrap text-sm leading-7">{body}</p>;
  }

  return (
    <div className="space-y-3">
      {!open ? (
        <>
          <div className="rounded-xl bg-soft p-4 text-sm text-gray-600">
            この投稿にはネタバレが含まれます。表示する場合はボタンを押してください。
          </div>
          <button type="button" className="button-soft" onClick={() => setOpen(true)}>
            ネタバレを表示する
          </button>
        </>
      ) : (
        <>
          <div className="rounded-xl border border-orange-200 bg-white p-4">
            <p className="whitespace-pre-wrap text-sm leading-7">{body}</p>
          </div>
          <button type="button" className="button-soft" onClick={() => setOpen(false)}>
            もう一度隠す
          </button>
        </>
      )}
    </div>
  );
}
