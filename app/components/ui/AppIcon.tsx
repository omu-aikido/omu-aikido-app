import { Link } from "react-router"

import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card"

interface AppIconProps {
  title: string
  id: string
  desc: string
}

export function AppIcon({ title, id, desc }: AppIconProps) {
  return (
    <Link
      to={id}
      className="group block touch-manipulation"
      data-testid={`app-icon-link-${id.replace(/\//g, "")}`}
    >
      <Card className="relative min-h-30 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-md transition-all duration-200 ease-out hover:border hover:border-blue-400 active:scale-[0.98] active:shadow-lg dark:border-slate-700 dark:bg-slate-800">
        <div className="absolute inset-0 bg-linear-to-br from-blue-50 to-indigo-100 opacity-0 transition-opacity duration-200 group-active:opacity-100 dark:from-slate-800 dark:to-slate-900" />
        <CardHeader>
          <CardTitle className="text-lg leading-tight font-semibold text-slate-900 transition-colors duration-200 group-active:text-blue-600 dark:text-white dark:group-active:text-blue-400">
            {title}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="mb-5 text-base leading-relaxed text-slate-600 dark:text-slate-300">
            {desc}
          </p>
          <div className="flex items-center text-base font-medium text-blue-600 dark:text-blue-400">
            詳細を見る
            <svg
              className="ml-2 h-5 w-5 transform transition-transform duration-200 group-active:translate-x-1"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M9 5l7 7-7 7"
              />
            </svg>
          </div>
        </CardContent>
      </Card>
    </Link>
  )
}
