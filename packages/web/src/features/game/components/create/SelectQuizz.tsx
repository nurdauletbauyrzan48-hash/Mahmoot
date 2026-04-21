import type { QuizzWithId } from "@mahmoot/common/types/game"
import Button from "@mahmoot/web/features/game/components/Button"
import { useEvent, useSocket } from "@mahmoot/web/features/game/contexts/socketProvider"
import clsx from "clsx"
import { useState } from "react"
import toast from "react-hot-toast"

type Props = {
  quizzList: QuizzWithId[]
  onSelect: (_id: string) => void
  onUpload: () => void
  onOptions: (_quizz: QuizzWithId) => void
  onEdit: (_quizz: QuizzWithId) => void
}

const SelectQuizz = ({ quizzList, onUpload, onOptions, onEdit }: Props) => {
  const { socket } = useSocket()
  const [selected, setSelected] = useState<string | null>(null)
  const [list, setList] = useState<QuizzWithId[]>(quizzList)

  useEvent("manager:quizzList", (updated) => setList(updated))

  const handleSelect = (id: string) => () => {
    setSelected(selected === id ? null : id)
  }

  const handleSubmit = () => {
    if (!selected) { toast.error("Тест таңда"); return }
    const quizz = list.find((q) => q.id === selected)
    if (!quizz) return
    onOptions(quizz)
  }

  const handleDelete = (id: string) => (e: React.MouseEvent) => {
    e.stopPropagation()
    if (!confirm('"' + id + '" тестін өшіресің бе?')) return
    socket?.emit("manager:deleteQuiz", id)
    if (selected === id) setSelected(null)
  }

  const handleEdit = (quizz: QuizzWithId) => (e: React.MouseEvent) => {
    e.stopPropagation()
    onEdit(quizz)
  }

  return (
    <div className="z-10 flex w-full max-w-md flex-col gap-4 rounded-md bg-white p-4 shadow-sm">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Тест таңда</h1>
        <button onClick={onUpload}
          className="rounded-md bg-blue-50 px-3 py-1 text-sm font-medium text-blue-600 hover:bg-blue-100">
          + Жаңа тест
        </button>
      </div>

      <div className="w-full space-y-2 max-h-96 overflow-y-auto">
        {list.length === 0 && (
          <p className="text-center text-sm text-gray-400 py-4">
            Тест жоқ. «+ Жаңа тест» батырмасын басып жүктеңіз.
          </p>
        )}
        {list.map((quizz) => (
          <button key={quizz.id}
            className={clsx("flex w-full items-center justify-between rounded-md p-3 outline outline-gray-300",
              selected === quizz.id && "outline-blue-400 bg-blue-50")}
            onClick={handleSelect(quizz.id)}>
            <div className="flex flex-col items-start text-left">
              <span className="font-medium">{quizz.subject}</span>
              <span className="text-xs text-gray-400">{quizz.questions.length} сұрақ</span>
            </div>
            <div className="flex items-center gap-2">
              <div className={clsx("h-5 w-5 rounded outline outline-offset-3 outline-gray-300",
                selected === quizz.id && "bg-primary border-primary/80 shadow-inset")} />
              <button onClick={handleEdit(quizz)} className="text-blue-400 hover:text-blue-600 text-xs px-1" title="Өңдеу">✏️</button>
              <button onClick={handleDelete(quizz.id)} className="text-red-400 hover:text-red-600 text-xs px-1" title="Өшіру">🗑</button>
            </div>
          </button>
        ))}
      </div>

      <Button onClick={handleSubmit}>Келесі →</Button>
    </div>
  )
}

export default SelectQuizz
