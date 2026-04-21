import type { QuizzWithId } from "@mahmoot/common/types/game"
import { STATUS } from "@mahmoot/common/types/game/status"
import EditQuiz from "@mahmoot/web/features/game/components/create/EditQuiz"
import ManagerPassword from "@mahmoot/web/features/game/components/create/ManagerPassword"
import QuizOptions from "@mahmoot/web/features/game/components/create/QuizOptions"
import SelectQuizz from "@mahmoot/web/features/game/components/create/SelectQuizz"
import UploadQuiz from "@mahmoot/web/features/game/components/create/UploadQuiz"
import {
  useEvent,
  useSocket,
} from "@mahmoot/web/features/game/contexts/socketProvider"
import { useManagerStore } from "@mahmoot/web/features/game/stores/manager"
import { useState } from "react"
import { useNavigate } from "react-router"

type View = "password" | "select" | "upload" | "options" | "edit"

const ManagerAuthPage = () => {
  const { setGameId, setStatus } = useManagerStore()
  const navigate = useNavigate()
  const { socket } = useSocket()

  const [view, setView] = useState<View>("password")
  const [quizzList, setQuizzList] = useState<QuizzWithId[]>([])
  const [selectedQuizz, setSelectedQuizz] = useState<QuizzWithId | null>(null)

  useEvent("manager:quizzList", (list) => {
    setQuizzList(list)
    setView((prev) => (prev === "password" ? "select" : prev))
  })

  useEvent("manager:gameCreated", ({ gameId, inviteCode }) => {
    setGameId(gameId)
    setStatus(STATUS.SHOW_ROOM, { text: "Waiting for the players", inviteCode })
    navigate("/party/manager/" + gameId)
  })

  const handleAuth = (password: string) => {
    socket?.emit("manager:auth", password)
  }

  const handleOptions = (quizz: QuizzWithId) => {
    setSelectedQuizz(quizz)
    setView("options")
  }

  const handleEdit = (quizz: QuizzWithId) => {
    setSelectedQuizz(quizz)
    setView("edit")
  }

  if (view === "password") return <ManagerPassword onSubmit={handleAuth} />
  if (view === "upload") return <UploadQuiz onBack={() => setView("select")} />
  if (view === "options" && selectedQuizz) return <QuizOptions quizz={selectedQuizz} onBack={() => setView("select")} />
  if (view === "edit" && selectedQuizz) return <EditQuiz quizz={selectedQuizz} onBack={() => setView("select")} />

  return (
    <SelectQuizz
      quizzList={quizzList}
      onSelect={() => {}}
      onUpload={() => setView("upload")}
      onOptions={handleOptions}
      onEdit={handleEdit}
    />
  )
}

export default ManagerAuthPage
