import { reportAction } from "@/app/actions";

type ReportFormProps = {
  targetType: "post" | "comment" | "user";
  targetId: string;
  disabled: boolean;
  redirectTo: string;
};

export function ReportForm({ targetType, targetId, disabled, redirectTo }: ReportFormProps) {
  return (
    <form action={reportAction} className="flex flex-wrap items-center gap-2">
      <input type="hidden" name="targetType" value={targetType} />
      <input type="hidden" name="targetId" value={targetId} />
      <input type="hidden" name="redirectTo" value={redirectTo} />
      <select name="reason" className="input max-w-56 text-xs" required disabled={disabled}>
        <option value="">通報理由を選択</option>
        <option value="誹謗中傷">誹謗中傷</option>
        <option value="ネタバレ配慮不足">ネタバレ配慮不足</option>
        <option value="スパム・宣伝">スパム・宣伝</option>
        <option value="その他">その他</option>
      </select>
      <button type="submit" className="button-soft text-xs" disabled={disabled}>
        通報
      </button>
    </form>
  );
}
