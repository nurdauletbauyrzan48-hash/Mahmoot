import type { QuizzWithId } from "@mahmoot/common/types/game"
import Button from "@mahmoot/web/features/game/components/Button"
import { useEvent, useSocket } from "@mahmoot/web/features/game/contexts/socketProvider"
import { useState } from "react"
import toast from "react-hot-toast"

type Question = {
  question: string
  answers: string[]
  solution: number
  time: number
  cooldown: number
  image?: string
}

type Props = {
  quizz: QuizzWithId
  onBack: () => void
}

const EditQuiz = ({ quizz, onBack }: Props) => {
  const { socket } = useSocket()
  const [subject, setSubject] = useState(quizz.subject)
  const [questions, setQuestions] = useState<Question[]>(
    quizz.questions.map((q) => ({ ...q, answers: [...q.answers] }))
  )
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null)

  useEvent("manager:uploadSuccess", () => {
    toast.success("Тест сақталды!")
    onBack()
  })

  useEvent("manager:uploadError", (msg) => toast.error(msg))

  const handleSave = () => {
    if (!subject.trim()) { toast.error("Тест атауын енгіз"); return }
    if (questions.length === 0) { toast.error("Кем дегенде 1 сұрақ болу керек"); return }
    for (let i = 0; i < questions.length; i++) {
      const q = questions[i]
      if (!q.question.trim()) { toast.error(`${i + 1}-сұрақ бос`); return }
      if (q.answers.filter(a => a.trim()).length < 2) { toast.error(`${i + 1}-сұрақта кем дегенде 2 жауап болу керек`); return }
    }
    const content = questions.map((q) => {
      const lines = [`?${q.question}`]
      q.answers.forEach((a, i) => { if (a.trim()) lines.push(`${i === q.solution ? "+" : "-"}${a}`) })
      return lines.join("\n")
    }).join("\n")

    socket?.emit("manager:uploadQuiz", { name: subject.trim(), content })
  }

  const addQuestion = () => {
    setQuestions([...questions, { question: "", answers: ["", "", "", ""], solution: 0, time: 15, cooldown: 5 }])
    setExpandedIndex(questions.length)
  }

  const removeQuestion = (idx: number) => {
    setQuestions(questions.filter((_, i) => i !== idx))
    setExpandedIndex(null)
  }

  const updateQuestion = (idx: number, field: keyof Question, value: any) => {
    setQuestions(questions.map((q, i) => i === idx ? { ...q, [field]: value } : q))
  }

  const updateAnswer = (qIdx: number, aIdx: number, value: string) => {
    setQuestions(questions.map((q, i) => {
      if (i !== qIdx) return q
      const newAnswers = [...q.answers]
      newAnswers[aIdx] = value
      return { ...q, answers: newAnswers }
    }))
  }

  return (
    <div className="z-10 flex w-full max-w-md flex-col gap-3 rounded-md bg-white p-4 shadow-sm max-h-screen overflow-y-auto">
      <div className="flex items-center gap-2">
        <button onClick={onBack} className="text-gray-500 hover:text-gray-800 text-lg font-bold">←</button>
        <h1 className="text-xl font-bold">Тестті өңдеу</h1>
      </div>

      <div className="flex flex-col gap-1">
        <label className="text-xs font-medium text-gray-600">Тест атауы</label>
        <input value={subject} onChange={(e) => setSubject(e.target.value)}
          className="rounded border border-gray-300 p-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
          placeholder="Тест атауы" />
      </div>

      <div className="flex flex-col gap-2">
        {questions.map((q, qIdx) => (
          <div key={qIdx} className="rounded-md border border-gray-200 overflow-hidden">
            <div className="flex items-center justify-between bg-gray-50 px-3 py-2 cursor-pointer"
              onClick={() => setExpandedIndex(expandedIndex === qIdx ? null : qIdx)}>
              <span className="text-sm font-medium text-gray-700 truncate flex-1">
                {qIdx + 1}. {q.question || "Жаңа сұрақ"}
              </span>
              <div className="flex gap-2 items-center">
                <button onClick={(e) => { e.stopPropagation(); removeQuestion(qIdx) }}
                  className="text-red-400 hover:text-red-600 text-xs">🗑</button>
                <span className="text-gray-400">{expandedIndex === qIdx ? "▲" : "▼"}</span>
              </div>
            </div>

            {expandedIndex === qIdx && (
              <div className="p-3 flex flex-col gap-2">
                <input value={q.question} onChange={(e) => updateQuestion(qIdx, "question", e.target.value)}
                  className="w-full rounded border border-gray-300 p-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                  placeholder="Сұрақ мәтіні" />

                <div className="grid grid-cols-2 gap-1">
                  {q.answers.map((a, aIdx) => (
                    <div key={aIdx} className="flex items-center gap-1">
                      <button onClick={() => updateQuestion(qIdx, "solution", aIdx)}
                        className={`w-5 h-5 rounded-full border-2 flex-shrink-0 ${q.solution === aIdx ? "bg-green-500 border-green-500" : "border-gray-300"}`} />
                      <input value={a} onChange={(e) => updateAnswer(qIdx, aIdx, e.target.value)}
                        className="flex-1 rounded border border-gray-200 p-1 text-xs focus:outline-none focus:ring-1 focus:ring-blue-400"
                        placeholder={`Жауап ${aIdx + 1}`} />
                    </div>
                  ))}
                </div>
                <p className="text-xs text-gray-400">● = дұрыс жауап</p>
              </div>
            )}
          </div>
        ))}
      </div>

      <button onClick={addQuestion}
        className="rounded-md border-2 border-dashed border-gray-300 py-2 text-sm text-gray-500 hover:border-blue-400 hover:text-blue-500">
        + Сұрақ қосу
      </button>

      <Button onClick={handleSave}>💾 Сақтау ({questions.length} сұрақ)</Button>
    </div>
  )
}

export default EditQuiz
