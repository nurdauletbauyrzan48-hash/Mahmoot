import Button from "@mahmoot/web/features/game/components/Button"
import Input from "@mahmoot/web/features/game/components/Input"
import { useEvent, useSocket } from "@mahmoot/web/features/game/contexts/socketProvider"
import { useRef, useState } from "react"
import toast from "react-hot-toast"

type Props = {
  onBack: () => void
}

const FORMAT_HINT = `Формат:
?Сұрақ мәтіні
+Дұрыс жауап
-Қате жауап 1
-Қате жауап 2`

const UploadQuiz = ({ onBack }: Props) => {
  const { socket } = useSocket()
  const [name, setName] = useState("")
  const [content, setContent] = useState("")
  const [fileName, setFileName] = useState("")
  const [loading, setLoading] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)

  useEvent("manager:uploadSuccess", () => {
    setLoading(false)
    toast.success("Тест сәтті жүктелді!")
    onBack()
  })

  useEvent("manager:uploadError", (message) => {
    setLoading(false)
    toast.error(message)
  })

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setFileName(file.name)
    if (!name) {
      setName(file.name.replace(/\.[^.]+$/, ""))
    }

    const reader = new FileReader()
    reader.onload = (ev) => {
      setContent(ev.target?.result as string)
    }
    reader.readAsText(file, "utf-8")
  }

  const handleSubmit = () => {
    if (!name.trim()) {
      toast.error("Тест атауын енгіз")
      return
    }
    if (!content.trim()) {
      toast.error("Файл таңда немесе мәтін енгіз")
      return
    }
    setLoading(true)
    socket?.emit("manager:uploadQuiz", { name: name.trim(), content })
  }

  return (
    <div className="z-10 flex w-full max-w-md flex-col gap-4 rounded-md bg-white p-4 shadow-sm">
      <div className="flex items-center gap-2">
        <button
          onClick={onBack}
          className="text-gray-500 hover:text-gray-800 text-lg font-bold"
        >
          ←
        </button>
        <h1 className="text-2xl font-bold">Жаңа тест жүктеу</h1>
      </div>

      <div className="flex flex-col gap-1">
        <label className="text-sm font-medium text-gray-700">Тест атауы</label>
        <Input
          type="text"
          placeholder="Мысалы: Тарих, Математика..."
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
      </div>

      <div className="flex flex-col gap-1">
        <label className="text-sm font-medium text-gray-700">
          .txt файл таңдау
        </label>
        <div
          className="flex cursor-pointer items-center justify-between rounded-md border border-dashed border-gray-300 p-3 hover:border-gray-500"
          onClick={() => fileRef.current?.click()}
        >
          <span className="text-sm text-gray-500">
            {fileName || "Файл таңда..."}
          </span>
          <span className="text-xs text-gray-400">📄</span>
        </div>
        <input
          ref={fileRef}
          type="file"
          accept=".txt"
          className="hidden"
          onChange={handleFile}
        />
      </div>

      <div className="flex flex-col gap-1">
        <label className="text-sm font-medium text-gray-700">
          Немесе мәтін енгіз
        </label>
        <textarea
          className="h-40 w-full rounded-md border border-gray-300 p-2 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-blue-400 resize-none"
          placeholder={FORMAT_HINT}
          value={content}
          onChange={(e) => setContent(e.target.value)}
        />
      </div>

      <div className="rounded-md bg-gray-50 p-3 text-xs text-gray-500 whitespace-pre-line">
        {FORMAT_HINT}
      </div>

      <Button onClick={handleSubmit} disabled={loading}>
        {loading ? "Жүктелуде..." : "Сақтау"}
      </Button>
    </div>
  )
}

export default UploadQuiz
