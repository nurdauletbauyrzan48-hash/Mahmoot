import type { CommonStatusDataMap } from "@mahmoot/common/types/game/status"
import CricleCheck from "@mahmoot/web/features/game/components/icons/CricleCheck"
import CricleXmark from "@mahmoot/web/features/game/components/icons/CricleXmark"
import { usePlayerStore } from "@mahmoot/web/features/game/stores/player"
import { SFX_RESULTS_SOUND } from "@mahmoot/web/features/game/utils/constants"
import { useEffect } from "react"
import useSound from "use-sound"

type Props = {
  data: CommonStatusDataMap["SHOW_RESULT"]
}

const Result = ({
  data: { correct, message, points, myPoints, correctCount, totalQuestions, rank, aheadOfMe },
}: Props) => {
  const player = usePlayerStore()

  const [sfxResults] = useSound(SFX_RESULTS_SOUND, { volume: 0.2 })

  useEffect(() => {
    player.updatePoints(myPoints)
    sfxResults()
  }, [sfxResults])

  const accuracy = totalQuestions > 0 ? Math.round((correctCount / totalQuestions) * 100) : 0

  return (
    <section className="anim-show relative mx-auto flex w-full max-w-7xl flex-1 flex-col items-center justify-center gap-2">
      {correct ? (
        <CricleCheck className="aspect-square max-h-48 w-full" />
      ) : (
        <CricleXmark className="aspect-square max-h-48 w-full" />
      )}

      <h2 className="mt-1 text-4xl font-bold text-white drop-shadow-lg">{message}</h2>

      <p className="text-xl font-bold text-white drop-shadow-lg">
        {`Орын: ${rank}${aheadOfMe ? `, алда: ${aheadOfMe}` : ""}`}
      </p>

      {correct && (
        <span className="rounded bg-black/40 px-4 py-2 text-2xl font-bold text-white drop-shadow-lg">
          +{points}
        </span>
      )}

      {/* Статистика */}
      <div className="mt-2 flex gap-3">
        <div className="flex flex-col items-center rounded-lg bg-black/30 px-4 py-2">
          <span className="text-2xl font-bold text-white">{correctCount}</span>
          <span className="text-xs text-white/70">дұрыс</span>
        </div>
        <div className="flex flex-col items-center rounded-lg bg-black/30 px-4 py-2">
          <span className="text-2xl font-bold text-white">{totalQuestions - correctCount}</span>
          <span className="text-xs text-white/70">қате</span>
        </div>
        <div className="flex flex-col items-center rounded-lg bg-black/30 px-4 py-2">
          <span className="text-2xl font-bold text-white">{accuracy}%</span>
          <span className="text-xs text-white/70">дәлдік</span>
        </div>
        <div className="flex flex-col items-center rounded-lg bg-black/30 px-4 py-2">
          <span className="text-2xl font-bold text-white">{myPoints}</span>
          <span className="text-xs text-white/70">ұпай</span>
        </div>
      </div>
    </section>
  )
}

export default Result
