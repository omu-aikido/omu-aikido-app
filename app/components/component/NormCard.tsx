import {
  AlertTriangle,
  CheckCircle,
  Clock,
  TrendingUp,
  User as UserIcon,
} from "lucide-react"
import { Link } from "react-router"
import { tv } from "tailwind-variants"

import { Card } from "~/components/ui/card"
import { translateGrade } from "~/lib/utils"

const badgeStyles = tv({
  base: "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  variants: {
    variant: {
      default:
        "border-transparent bg-slate-900 text-slate-50 hover:bg-slate-900/80 dark:bg-slate-50 dark:text-slate-900 dark:hover:bg-slate-50/80",
      secondary:
        "border-transparent bg-slate-100 text-slate-900 hover:bg-slate-100/80 dark:bg-slate-800 dark:text-slate-50 dark:hover:bg-slate-800/80",
      destructive:
        "border-transparent bg-red-500 text-slate-50 hover:bg-red-500/80 dark:bg-red-900 dark:text-slate-50 dark:hover:bg-red-900/80",
      outline: "text-slate-950 dark:text-slate-50",
      success:
        "border-transparent bg-emerald-500 text-white hover:bg-emerald-600 dark:bg-emerald-600 dark:hover:bg-emerald-700",
      warning:
        "border-transparent bg-amber-500 text-white hover:bg-amber-600 dark:bg-amber-600 dark:hover:bg-amber-700",
    },
  },
  defaultVariants: { variant: "default" },
})

function Badge({
  className,
  variant,
  ...props
}: React.HTMLAttributes<HTMLDivElement> & {
  variant?: keyof typeof badgeStyles.variants.variant
}) {
  return <div className={badgeStyles({ variant, className })} {...props} />
}

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
  isMet: boolean
}

export function NormCard({ user, norm, progress, isMet }: NormCardProps) {
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
              {isMet ? (
                <Badge variant="success" className="gap-1">
                  <CheckCircle className="h-3 w-3" />
                  達成
                </Badge>
              ) : (
                <Badge
                  variant={progress < 50 ? "destructive" : "warning"}
                  className="gap-1"
                >
                  <AlertTriangle className="h-3 w-3" />
                  {progress < 50 ? "要注意" : "進行中"}
                </Badge>
              )}
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
