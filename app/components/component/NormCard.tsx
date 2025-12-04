import {
  Clock,
  TrendingUp,
  User as UserIcon,
} from "lucide-react"
import { Link } from "react-router"

import { Card } from "~/components/ui/card"
import { translateGrade } from "~/lib/utils"

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
      className={`w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2 overflow-hidden ${className}`}
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
    <Link to={`/admin/user/${user.id}`} className="block group">
      <Card
        className={`h-full overflow-hidden transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5`}
      >
        <div className="p-3 space-y-4">
          <div className="flex justify-between items-start mb-3">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-600 dark:text-slate-300 font-bold text-lg overflow-hidden">
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
                <h3 className="font-bold text-slate-900 dark:text-slate-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                  {user.lastName} {user.firstName}
                </h3>
                <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400 font-mono">
                  {norm?.grade ? translateGrade(norm.grade) : "未設定"}
                </p>
              </div>
            </div>
            <div className="flex flex-col place-items-end">
              <div className="mt-0.5 flex flex-row items-center gap-1 text-slate-500 dark:text-slate-400">
                <Clock className="h-3 w-3" />
                <span className="text-xs ">
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
                <span className="text-slate-500 dark:text-slate-400 flex items-center gap-1">
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
