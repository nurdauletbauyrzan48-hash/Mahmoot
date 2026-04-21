import type { ManagerStatusDataMap } from "@mahmoot/common/types/game/status"
import {
  SFX_PODIUM_FIRST,
  SFX_PODIUM_SECOND,
  SFX_PODIUM_THREE,
  SFX_SNEAR_ROOL,
} from "@mahmoot/web/features/game/utils/constants"
import useScreenSize from "@mahmoot/web/hooks/useScreenSize"
import clsx from "clsx"
import { useEffect, useState } from "react"
import ReactConfetti from "react-confetti"
import useSound from "use-sound"

type Props = {
  data: ManagerStatusDataMap["FINISHED"]
}

const usePodiumAnimation = (topLength: number) => {
  const [apparition, setApparition] = useState(0)
  const [sfxtThree] = useSound(SFX_PODIUM_THREE, { volume: 0.2 })
  const [sfxSecond] = useSound(SFX_PODIUM_SECOND, { volume: 0.2 })
  const [sfxRool, { stop: sfxRoolStop }] = useSound(SFX_SNEAR_ROOL, { volume: 0.2 })
  const [sfxFirst] = useSound(SFX_PODIUM_FIRST, { volume: 0.2 })

  useEffect(() => {
    const actions: Partial<Record<number, () => void>> = {
      4: () => { sfxRoolStop(); sfxFirst() },
      3: sfxRool,
      2: sfxSecond,
      1: sfxtThree,
    }
    actions[apparition]?.()
  }, [apparition, sfxFirst, sfxSecond, sfxtThree, sfxRool, sfxRoolStop])

  useEffect(() => {
    if (topLength < 3) { setApparition(4); return }
    if (apparition >= 4) return
    const interval = setInterval(() => setApparition((v) => v + 1), 2000)
    return () => clearInterval(interval)
  }, [apparition, topLength])

  return apparition
}

const Podium = ({ data: { subject, top } }: Props) => {
  const podiumTop = top.slice(0, 3)
  const rest = top.slice(3)
  const apparition = usePodiumAnimation(podiumTop.length)
  const { width, height } = useScreenSize()
  const [showAll, setShowAll] = useState(false)

  return (
    <>
      {apparition >= 4 && (
        <ReactConfetti width={width} height={height} className="h-full w-full" />
      )}
      {apparition >= 3 && podiumTop.length >= 3 && (
        <div className="pointer-events-none absolute min-h-dvh w-full overflow-hidden">
          <div className="spotlight"></div>
        </div>
      )}

      <section className="relative mx-auto flex w-full max-w-7xl flex-1 flex-col items-center justify-between overflow-y-auto">
        <h2 className="anim-show text-center text-3xl font-bold text-white drop-shadow-lg md:text-4xl lg:text-5xl">
          {subject}
        </h2>

        {/* Подиум — топ 3 */}
        <div
          style={{ gridTemplateColumns: `repeat(${podiumTop.length}, 1fr)` }}
          className="grid w-full max-w-200 flex-1 items-end justify-center justify-self-end overflow-x-visible overflow-y-hidden"
        >
          {podiumTop[1] && (
            <div className={clsx("z-20 flex h-[50%] w-full translate-y-full flex-col items-center justify-center gap-3 opacity-0 transition-all",
              { "translate-y-0! opacity-100": apparition >= 2 })}>
              <p className={clsx("overflow-visible text-center text-2xl font-bold whitespace-nowrap text-white drop-shadow-lg md:text-4xl",
                { "anim-balanced": apparition >= 4 })}>{podiumTop[1].username}</p>
              <div className="bg-primary flex h-full w-full flex-col items-center gap-4 rounded-t-md pt-6 text-center shadow-2xl">
                <p className="flex aspect-square h-14 items-center justify-center rounded-full border-4 border-zinc-400 bg-zinc-500 text-3xl font-bold text-white drop-shadow-lg">
                  <span className="drop-shadow-md">2</span>
                </p>
                <p className="text-2xl font-bold text-white drop-shadow-lg">{podiumTop[1].points}</p>
                {(podiumTop[1] as any).correctCount !== undefined && (
                  <p className="text-sm text-white/80">{(podiumTop[1] as any).correctCount}/{(podiumTop[1] as any).totalQuestions} дұрыс</p>
                )}
              </div>
            </div>
          )}

          <div className={clsx("z-30 flex h-[60%] w-full translate-y-full flex-col items-center gap-3 opacity-0 transition-all",
            { "translate-y-0! opacity-100": apparition >= 3 },
            { "md:min-w-64": podiumTop.length < 2 })}>
            <p className={clsx("overflow-visible text-center text-2xl font-bold whitespace-nowrap text-white opacity-0 drop-shadow-lg md:text-4xl",
              { "anim-balanced opacity-100": apparition >= 4 })}>{podiumTop[0].username}</p>
            <div className="bg-primary flex h-full w-full flex-col items-center gap-4 rounded-t-md pt-6 text-center shadow-2xl">
              <p className="flex aspect-square h-14 items-center justify-center rounded-full border-4 border-amber-400 bg-amber-300 text-3xl font-bold text-white drop-shadow-lg">
                <span className="drop-shadow-md">1</span>
              </p>
              <p className="text-2xl font-bold text-white drop-shadow-lg">{podiumTop[0].points}</p>
              {(podiumTop[0] as any).correctCount !== undefined && (
                <p className="text-sm text-white/80">{(podiumTop[0] as any).correctCount}/{(podiumTop[0] as any).totalQuestions} дұрыс</p>
              )}
            </div>
          </div>

          {podiumTop[2] && (
            <div className={clsx("z-10 flex h-[40%] w-full translate-y-full flex-col items-center gap-3 opacity-0 transition-all",
              { "translate-y-0! opacity-100": apparition >= 1 })}>
              <p className={clsx("overflow-visible text-center text-2xl font-bold whitespace-nowrap text-white drop-shadow-lg md:text-4xl",
                { "anim-balanced": apparition >= 4 })}>{podiumTop[2].username}</p>
              <div className="bg-primary flex h-full w-full flex-col items-center gap-4 rounded-t-md pt-6 text-center shadow-2xl">
                <p className="flex aspect-square h-14 items-center justify-center rounded-full border-4 border-amber-800 bg-amber-700 text-3xl font-bold text-white drop-shadow-lg">
                  <span className="drop-shadow-md">3</span>
                </p>
                <p className="text-2xl font-bold text-white drop-shadow-lg">{podiumTop[2].points}</p>
                {(podiumTop[2] as any).correctCount !== undefined && (
                  <p className="text-sm text-white/80">{(podiumTop[2] as any).correctCount}/{(podiumTop[2] as any).totalQuestions} дұрыс</p>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Толық нәтиже кестесі */}
        {apparition >= 4 && (
          <div className="w-full max-w-2xl mt-4 mb-4 px-2">
            <button
              onClick={() => setShowAll(!showAll)}
              className="w-full rounded-md bg-black/30 py-2 text-white font-bold hover:bg-black/50 transition-colors mb-2"
            >
              {showAll ? "▲ Жасыру" : "▼ Толық нәтиже көру"}
            </button>
            {showAll && (
              <div className="flex flex-col gap-1 max-h-64 overflow-y-auto">
                <div className="grid grid-cols-5 text-xs text-white/60 px-3 py-1">
                  <span>#</span>
                  <span className="col-span-2">Аты</span>
                  <span className="text-center">Дұрыс</span>
                  <span className="text-right">Ұпай</span>
                </div>
                {top.map((player, index) => {
                  const correct = (player as any).correctCount ?? 0
                  const total = (player as any).totalQuestions ?? 0
                  const acc = total > 0 ? Math.round((correct / total) * 100) : 0
                  return (
                    <div key={player.id}
                      className={clsx("grid grid-cols-5 rounded-md px-3 py-2 text-white font-medium",
                        index === 0 ? "bg-amber-500/70" : index === 1 ? "bg-zinc-500/70" : index === 2 ? "bg-amber-800/70" : "bg-black/30")}>
                      <span>{index + 1}</span>
                      <span className="col-span-2 truncate">{player.username}</span>
                      <span className="text-center text-sm">{correct}/{total} <span className="text-white/60">({acc}%)</span></span>
                      <span className="text-right">{player.points}</span>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        )}
      </section>
    </>
  )
}

export default Podium
