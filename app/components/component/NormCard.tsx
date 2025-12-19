import { Clock, TrendingUp, User as UserIcon } from "lucide-react"
import { Link } from "react-router"

import { Card } from "@/app/components/ui/card"
import { translateGrade } from "@/app/lib/utils"

function ProgressBar({
  current,
  max,
  className,
}: {
  current: number
  max: number
  className?: string
}) {
  const percentage = Math.min(100, Math.max(0, (current / max) * 100))

  let colorClass = "bg-blue-600 dark:bg-blue-500"
  if (percentage >= 100) colorClass = "bg-emerald-500 dark:bg-emerald-400"
  else if (percentage < 50) colorClass = "bg-red-500 dark:bg-red-600"
  else if (percentage < 80) colorClass = "bg-amber-500 dark:bg-amber-600"

  return (
    <div
      className={`h-2 w-full overflow-hidden rounded-full bg-slate-200 dark:bg-slate-700 ${className}`}
    >
      <div
        className={`h-2 rounded-full transition-all duration-500 ease-out ${colorClass}`}
        style={{ width: `${percentage}%` }}
      />
    </div>
  )
}

interface NormCardUser {
  id: string
  imageUrl: string
  lastName: string | null
  firstName: string | null
}

interface NormCardProps {
  user: NormCardUser
  norm:
    | {
        userId: string
        current: number
        required: number
        grade: number
        lastPromotionDate: string | null
      }
    | undefined
  progress: number
}

export function NormCard({ user, norm, progress }: NormCardProps) {
  return (
    <Link to={`/admin/user/${user.id}`} className="group block">
      <Card
        className={`h-full overflow-hidden transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg`}
      >
        <div className="space-y-4 p-3">
          <div className="mb-3 flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-full bg-slate-100 text-lg font-bold text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                {user.imageUrl ? (
                  <img
                    src={user.imageUrl}
                    alt=""
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <UserIcon className="h-5 w-5" />
                )}
              </div>
              <div>
                <h3 className="font-bold text-slate-900 transition-colors group-hover:text-blue-600 dark:text-slate-100 dark:group-hover:text-blue-400">
                  {user.lastName} {user.firstName}
                </h3>
                <p className="mt-0.5 font-mono text-xs text-slate-500 dark:text-slate-400">
                  {norm?.grade !== undefined && norm?.grade !== null
                    ? translateGrade(norm.grade)
                    : "未設定"}
                </p>
              </div>
            </div>
            <div className="flex flex-col place-items-end">
              <div className="mt-0.5 flex flex-row items-center gap-1 text-slate-500 dark:text-slate-400">
                <Clock className="h-3 w-3" />
                <span className="text-xs">
                  {norm?.lastPromotionDate
                    ? new Date(norm.lastPromotionDate).toLocaleDateString("ja-JP")
                    : "記録なし"}
                </span>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between text-xs">
              <div className="flex items-center gap-1">
                <span className="flex items-center gap-1 text-slate-500 dark:text-slate-400">
                  <TrendingUp className="h-3 w-3" />
                </span>
                <span className="font-mono font-bold text-slate-900 dark:text-slate-100">
                  {Math.round(progress)}%
                </span>
              </div>
              <span>
                {Math.floor(norm?.current || 0)} / {norm?.required || 0} 回
              </span>
            </div>
            <ProgressBar current={norm?.current || 0} max={norm?.required || 1} />
          </div>
        </div>
      </Card>
    </Link>
  )
}
