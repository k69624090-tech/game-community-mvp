import { addReactionAction } from "@/app/actions";
import { REACTION_LABELS } from "@/lib/constants";
import { ReactionType } from "@/types/models";

type ReactionButtonsProps = {
  postId: string;
  summary: Record<ReactionType, number>;
  canReact: boolean;
};

const reactionTypes = Object.keys(REACTION_LABELS) as ReactionType[];
const REACTION_COUNT_CLASS: Record<ReactionType, string> = {
  like: "text-rose-500",
  wakaru: "text-sky-500",
  suki: "text-fuchsia-500",
  cried: "text-indigo-500",
  lol: "text-amber-500",
  helpful: "text-emerald-600"
};

export function ReactionButtons({ postId, summary, canReact }: ReactionButtonsProps) {
  return (
    <div className="space-y-2">
      <p className="text-sm font-semibold">共感リアクション</p>
      <div className="flex flex-wrap gap-2">
        {reactionTypes.map((reactionType) => (
          <form key={reactionType} action={addReactionAction}>
            <input type="hidden" name="postId" value={postId} />
            <input type="hidden" name="reactionType" value={reactionType} />
            <button className="button-soft text-xs" type="submit" disabled={!canReact}>
              {REACTION_LABELS[reactionType]} (
              <span className={`font-semibold ${REACTION_COUNT_CLASS[reactionType]}`}>{summary[reactionType] ?? 0}</span>
              )
            </button>
          </form>
        ))}
      </div>
      {!canReact ? <p className="text-xs text-gray-500">リアクションにはログインが必要です。</p> : null}
    </div>
  );
}
