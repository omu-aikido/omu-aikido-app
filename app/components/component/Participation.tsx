// 月間参加時間に応じて装飾を変えるコンポーネント
export function Participation({ month, hour }: { month: number; hour: number }) {
  if (!hour || hour <= 0) return null

  // 最大値を18に制限
  const cappedHour = Math.min(hour, 18)

  // 装飾レベル判定
  let level = 1
  if (cappedHour >= 18) level = 4
  else if (cappedHour >= 12) level = 3
  else if (cappedHour >= 6) level = 2

  const decorations = [
    null,
    {
      bg: "bg-gray-50",
      text: "text-gray-800",
      icon: "🥋",
      border: "border-gray-200",
      effect: "shadow-sm",
    },
    {
      bg: "bg-blue-50",
      text: "text-blue-800",
      icon: "🥋✨",
      border: "border-blue-300",
      effect: "shadow-md",
    },
    {
      bg: "bg-yellow-50",
      text: "text-yellow-900",
      icon: "🥋🌟",
      border: "border-yellow-300",
      effect: "shadow-lg",
    },
    {
      bg: "bg-gradient-to-r from-pink-100 via-yellow-50 to-green-100",
      text: "text-pink-900",
      icon: "👑🥋🌈",
      border: "border-pink-300",
      effect: "shadow-xl ring-2 ring-pink-200",
    },
  ]

  const deco = decorations[level]!

  return (
    <div
      className={`flex items-center gap-3 px-5 py-3 my-5 rounded-xl border ${deco.bg} ${deco.text} ${deco.border} ${deco.effect}`}
      title={`${Number(month)}月の参加時間: ${Number(cappedHour)}時間`}
      role="status"
      aria-label={`${Number(month)}月の参加時間は${Number(cappedHour)}時間`}
    >
      <span className="text-2xl" aria-hidden="true">
        {deco.icon}
      </span>
      <span className="font-semibold text-base md:text-lg">
        {Number(month)}月の参加時間: {Number(cappedHour)} 時間
      </span>
    </div>
  )
}
