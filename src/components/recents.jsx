import { useEffect, useState } from "react"
import { resentlyActivity } from "@/src/lib/query/activity"

const Recents = () => {
  const [recents, setRecents] = useState([])

  useEffect(() => {
    const fetchRecents = async () => {
      const userId = Astro.locals.auth().userId
      const data = await resentlyActivity({ userId, limit: 1 })
      setRecents(data)
    }

    fetchRecents()
  }, [])

  const relativeTime = (createAt) => {
    const now = Date.now()
    const diff = now - new Date(createAt).getTime()
    const secondsUnit = 1000
    const minutesUnit = 60 * secondsUnit
    const hoursUnit = 60 * minutesUnit
    const daysUnit = 24 * hoursUnit
    const weeksUnit = 7 * daysUnit
    const monthsUnit = 4 * weeksUnit
    const yearsUnit = 12 * monthsUnit
    let text = ""
    if (diff < 60 * secondsUnit) {
      text = "たった 今"
    } else if (diff < 60 * minutesUnit) {
      text = Math.floor(diff / minutesUnit) + "分前"
    } else if (diff < 24 * hoursUnit) {
      text = Math.floor(diff / hoursUnit) + "時間前"
    } else if (diff < 7 * daysUnit) {
      text = Math.floor(diff / daysUnit) + "日前"
    } else if (diff < 4 * weeksUnit) {
      text = Math.floor(diff / weeksUnit) + "週間前"
    } else if (diff < 12 * monthsUnit) {
      text = Math.floor(diff / monthsUnit) + "ヶ月前"
    } else {
      text = Math.floor(diff / yearsUnit) + "年前"
    }
    return text
  }

  if (recents.length === 0) return null

  return (
    <div className="bg-slate-200 dark:bg-slate-800 border border-slate-600/90 p-4 rounded-lg mt-4">
      <h2 className="text-lg text-[rgb(var(--text))] mb-2 mt-0">
        最近追加した項目:
        <small
          id="relative-time"
          data-timestamp={new Date(recents[0].createAt).getTime()}
          className="text-sm"
        >
          {relativeTime(recents[0].createAt)}
        </small>
      </h2>
      <div className="flex justify-between text-sm text-slate-600 dark:text-slate-300 md:flex-row flex-col">
        <span className="mr-2">
          追加日時: {new Date(recents[0].createAt).toLocaleString("ja-JP")}
        </span>
        <span className="mr-2">日付: {new Date(recents[0].date).toLocaleDateString("ja-JP")}</span>
        <span>{recents[0].period}時間</span>
      </div>
    </div>
  )
}

export default Recents
