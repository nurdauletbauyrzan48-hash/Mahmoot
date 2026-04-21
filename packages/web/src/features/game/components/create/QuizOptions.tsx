import type { QuizzWithId } from "@mahmoot/common/types/game"
import Button from "@mahmoot/web/features/game/components/Button"
import { useSocket } from "@mahmoot/web/features/game/contexts/socketProvider"
import { useState } from "react"
import toast from "react-hot-toast"

type Props = {
  quizz: QuizzWithId
  onBack: () => void
}

const TIME_OPTIONS = [10, 15, 20, 30, 60]

const Toggle = ({ value, onChange, label, desc }: { value: boolean; onChange: () => void; label: string; desc: string }) => (
  <label className="flex items-center justify-between rounded-md border border-gray-200 p-3 cursor-pointer">
    <div>
      <p className="font-medium text-sm">{label}</p>
      <p className="text-xs text-gray-400">{desc}</p>
    </div>
    <div
      onClick={onChange}
      className={`w-11 h-6 rounded-full transition-colors ${value ? "bg-blue-500" : "bg-gray-300"} relative cursor-pointer flex-shrink-0`}
    >
      <div className={`absolute top-1 w-4 h-4 rounded-full bg-white shadow transition-transform ${value ? "translate-x-6" : "translate-x-1"}`} />
    </div>
  </label>
)

const QuizOptions = ({ quizz, onBack }: Props) => {
  const { socket } = useSocket()
  const total = quizz.questions.length

  const [shuffleQuestions, setShuffleQuestions] = useState(false)
  const [shuffleAnswers, setShuffleAnswers] = useState(false)
  const [useRange, setUseRange] = useState(false)
  const [rangeStart, setRangeStart] = useState("1")
  const [rangeEnd, setRangeEnd] = useState(String(total))
  const [useCustomTime, setUseCustomTime] = useState(false)
  const [customTime, setCustomTime] = useState(15)
  const [questionCount, setQuestionCount] = useState(String(total))
  const [useRandomCount, setUseRandomCount] = useState(false)

  const handleStart = () => {
    let range: { start: number; end: number } | null = null

    if (useRange) {
      const start = parseInt(rangeStart)
      const end = parseInt(rangeEnd)
      if (isNaN(start) || isNaN(end) || start < 1 || end > total || start > end) {
        toast.error(`Диапазон 1-${total} аралығында болу керек`)
        return
      }
      range = { start, end }
    }

    let randomCount: number | null = null
    if (useRandomCount) {
      const cnt = parseInt(questionCount)
      if (isNaN(cnt) || cnt < 1 || cnt > total) {
        toast.error(`Сұрақ саны 1-${total} аралығында болу керек`)
        return
      }
      randomCount = cnt
    }

    socket?.emit("game:createWithOptions", {
      quizzId: quizz.id,
      shuffleQuestions,
      shuffleAnswers,
      range,
      randomCount,
      customTime: useCustomTime ? customTime : null,
    })
  }

  const selectedCount = useRange
    ? Math.max(0, Math.min(parseInt(rangeEnd) || 0, total) - Math.max(parseInt(rangeStart) || 1, 1) + 1)
    : useRandomCount
    ? parseInt(questionCount) || total
    : total

  return (
    <div className="z-10 flex w-full max-w-md flex-col gap-3 rounded-md bg-white p-4 shadow-sm overflow-y-auto max-h-screen">
      <div className="flex items-center gap-2">
        <button onClick={onBack} className="text-gray-500 hover:text-gray-800 text-lg font-bold">←</button>
        <div>
          <h1 className="text-xl font-bold">{quizz.subject}</h1>
          <p className="text-xs text-gray-400">Барлығы: {total} сұрақ</p>
        </div>
      </div>

      <Toggle value={shuffleQuestions} onChange={() => setShuffleQuestions(!shuffleQuestions)}
        label="Сұрақтарды араластыру" desc="Сұрақтар кездейсоқ ретпен шығады" />

      <Toggle value={shuffleAnswers} onChange={() => setShuffleAnswers(!shuffleAnswers)}
        label="Жауаптарды араластыру" desc="Әр сұрақтың жауаптары кездейсоқ орналасады" />

      <Toggle value={useRange} onChange={() => { setUseRange(!useRange); setUseRandomCount(false) }}
        label="Диапазон таңдау" desc="Белгілі нөмірлі сұрақтар ғана шығады" />

      {useRange && (
        <div className="flex items-center gap-2 rounded-md bg-gray-50 p-3">
          <div className="flex flex-col items-center flex-1">
            <label className="text-xs text-gray-500 mb-1">Бастап</label>
            <input type="number" min={1} max={total} value={rangeStart}
              onChange={(e) => setRangeStart(e.target.value)}
              className="w-full rounded border border-gray-300 p-2 text-center text-sm focus:outline-none focus:ring-2 focus:ring-blue-400" />
          </div>
          <span className="text-gray-400 mt-4">—</span>
          <div className="flex flex-col items-center flex-1">
            <label className="text-xs text-gray-500 mb-1">Дейін</label>
            <input type="number" min={1} max={total} value={rangeEnd}
              onChange={(e) => setRangeEnd(e.target.value)}
              className="w-full rounded border border-gray-300 p-2 text-center text-sm focus:outline-none focus:ring-2 focus:ring-blue-400" />
          </div>
          <div className="flex flex-col items-center mt-4">
            <span className="text-xs text-gray-400">Саны</span>
            <span className="font-bold text-blue-600">{selectedCount}</span>
          </div>
        </div>
      )}

      <Toggle value={useRandomCount} onChange={() => { setUseRandomCount(!useRandomCount); setUseRange(false) }}
        label="Рандом сұрақ саны" desc="Тесттен кездейсоқ N сұрақ таңдалады" />

      {useRandomCount && (
        <div className="flex items-center gap-3 rounded-md bg-gray-50 p-3">
          <label className="text-sm text-gray-600 flex-1">Қанша сұрақ?</label>
          <input type="number" min={1} max={total} value={questionCount}
            onChange={(e) => setQuestionCount(e.target.value)}
            className="w-24 rounded border border-gray-300 p-2 text-center text-sm focus:outline-none focus:ring-2 focus:ring-blue-400" />
          <span className="text-xs text-gray-400">/ {total}</span>
        </div>
      )}

      <Toggle value={useCustomTime} onChange={() => setUseCustomTime(!useCustomTime)}
        label="Уақытты өзгерту" desc="Барлық сұрақтарға бір уақыт белгіле" />

      {useCustomTime && (
        <div className="flex gap-2 flex-wrap rounded-md bg-gray-50 p-3">
          {TIME_OPTIONS.map((t) => (
            <button key={t} onClick={() => setCustomTime(t)}
              className={`rounded-md px-3 py-2 text-sm font-bold border transition-colors ${customTime === t ? "bg-blue-500 text-white border-blue-500" : "bg-white text-gray-700 border-gray-300 hover:border-blue-400"}`}>
              {t}с
            </button>
          ))}
        </div>
      )}

      <Button onClick={handleStart}>
        🚀 Бастау ({selectedCount} сұрақ{useCustomTime ? `, ${customTime}с` : ""})
      </Button>
    </div>
  )
}

export default QuizOptions
