import Room from "@mahmoot/web/features/game/components/join/Room"
import Username from "@mahmoot/web/features/game/components/join/Username"
import {
  useEvent,
  useSocket,
} from "@mahmoot/web/features/game/contexts/socketProvider"
import { usePlayerStore } from "@mahmoot/web/features/game/stores/player"
import { useEffect } from "react"
import toast from "react-hot-toast"

const PlayerAuthPage = () => {
  const { isConnected, connect } = useSocket()
  const { player } = usePlayerStore()

  useEffect(() => {
    if (!isConnected) {
      connect()
    }
  }, [connect, isConnected])

  useEvent("game:errorMessage", (message) => {
    toast.error(message)
  })

  if (player) {
    return <Username />
  }

  return <Room />
}

export default PlayerAuthPage
