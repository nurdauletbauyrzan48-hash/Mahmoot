import { QuizzWithId } from "@mahmoot/common/types/game"
import fs from "fs"
import { resolve } from "path"

const inContainerPath = process.env.CONFIG_PATH

const getPath = (path: string = "") =>
  inContainerPath
    ? resolve(inContainerPath, path)
    : resolve(process.cwd(), "../../config", path)

class Config {
  static init() {
    const isConfigFolderExists = fs.existsSync(getPath())

    if (!isConfigFolderExists) {
      fs.mkdirSync(getPath())
    }

    const isGameConfigExists = fs.existsSync(getPath("game.json"))

    if (!isGameConfigExists) {
      fs.writeFileSync(
        getPath("game.json"),
        JSON.stringify(
          {
            managerPassword: "PASSWORD",
          },
          null,
          2,
        ),
      )
    }

    const isQuizzExists = fs.existsSync(getPath("quizz"))

    if (!isQuizzExists) {
      fs.mkdirSync(getPath("quizz"))

      fs.writeFileSync(
        getPath("quizz/example.json"),
        JSON.stringify(
          {
            subject: "Example Quizz",
            questions: [
              {
                question: "What is good answer ?",
                answers: ["No", "Good answer", "No", "No"],
                solution: 1,
                cooldown: 5,
                time: 15,
              },
              {
                question: "What is good answer with image ?",
                answers: ["No", "No", "No", "Good answer"],
                image: "https://placehold.co/600x400.png",
                solution: 3,
                cooldown: 5,
                time: 20,
              },
              {
                question: "What is good answer with two answers ?",
                answers: ["Good answer", "No"],
                image: "https://placehold.co/600x400.png",
                solution: 0,
                cooldown: 5,
                time: 20,
              },
            ],
          },
          null,
          2,
        ),
      )
    }
  }

  static game() {
    const isExists = fs.existsSync(getPath("game.json"))

    if (!isExists) {
      throw new Error("Game config not found")
    }

    try {
      const config = fs.readFileSync(getPath("game.json"), "utf-8")

      return JSON.parse(config)
    } catch (error) {
      console.error("Failed to read game config:", error)
    }

    return {}
  }

  static quizz() {
    const isExists = fs.existsSync(getPath("quizz"))

    if (!isExists) {
      return []
    }

    try {
      const files = fs
        .readdirSync(getPath("quizz"))
        .filter((file) => file.endsWith(".json"))

      const quizz: QuizzWithId[] = files.map((file) => {
        const data = fs.readFileSync(getPath(`quizz/${file}`), "utf-8")
        const config = JSON.parse(data)

        const id = file.replace(".json", "")

        return {
          id,
          ...config,
        }
      })

      return quizz || []
    } catch (error) {
      console.error("Failed to read quizz config:", error)

      return []
    }
  }

  /**
   * Txt мазмұнын парсингтеп JSON форматта сақтайды.
   * Формат:
   *   ?Сұрақ мәтіні
   *   +Дұрыс жауап
   *   -Қате жауап
   */
  static saveQuizFromText(name: string, content: string): string {
    const lines = content.split("\n").map((l) => l.trim()).filter(Boolean)

    const questions: any[] = []
    let i = 0

    while (i < lines.length) {
      if (lines[i].startsWith("?")) {
        const qText = lines[i].slice(1).trim()
        i++
        const answers: string[] = []
        let correctIndex: number | null = null

        while (
          i < lines.length &&
          (lines[i].startsWith("+") || lines[i].startsWith("-"))
        ) {
          const answerText = lines[i].slice(1).trim()
          if (lines[i].startsWith("+")) {
            correctIndex = answers.length
          }
          answers.push(answerText)
          i++
        }

        if (correctIndex !== null && answers.length >= 2) {
          // Жауап санын 4-ке шектеу
          const fixedAnswers = answers.slice(0, 4)
          const correctAnswer = answers[correctIndex]
          const fixedCorrect = fixedAnswers.includes(correctAnswer)
            ? fixedAnswers.indexOf(correctAnswer)
            : Math.min(correctIndex, fixedAnswers.length - 1)

          questions.push({
            question: qText,
            answers: fixedAnswers,
            solution: fixedCorrect,
            cooldown: 5,
            time: 15,
          })
        }
      } else {
        i++
      }
    }

    if (questions.length === 0) {
      throw new Error("Файлда дұрыс сұрақтар табылмады. ? + - форматын тексер.")
    }

    // Файл атын қауіпсіз id-ге айналдыру
    const safeId = name
      .replace(/[^a-zA-Z0-9а-яА-ЯәіңғүұқөһӘІҢҒҮҰҚӨҺ\s_-]/g, "")
      .trim()
      .replace(/\s+/g, "_")
      || `quiz_${Date.now()}`

    const quizzData = { subject: name, questions }
    const filePath = getPath(`quizz/${safeId}.json`)

    fs.writeFileSync(filePath, JSON.stringify(quizzData, null, 2), "utf-8")

    return safeId
  }

  static deleteQuiz(quizzId: string): void {
    const filePath = getPath(`quizz/${quizzId}.json`)

    if (!fs.existsSync(filePath)) {
      throw new Error("Quiz табылмады")
    }

    fs.unlinkSync(filePath)
  }
}

export default Config
