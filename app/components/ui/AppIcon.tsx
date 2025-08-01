import { Link } from "react-router"

interface AppIconProps {
  title: string
  id: string
  desc: string
}

export function AppIcon({ title, id, desc }: AppIconProps) {
  return (
    <Link to={id} className="group block touch-manipulation">
      <div className="relative overflow-hidden bg-white dark:bg-slate-800 rounded-xl hover:border hover:border-blue-400 shadow-md active:shadow-lg transition-all duration-200 ease-out active:scale-[0.98] border border-slate-200 dark:border-slate-700 min-h-[120px]">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-slate-800 dark:to-slate-900 opacity-0 group-active:opacity-100 transition-opacity duration-200" />
        <div className="relative p-4 sm:p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-md">
                <svg
                  className="w-5 h-5 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M13 10V3L4 14h7v7l9-11h-7z"
                  />
                </svg>
              </div>
              <h4 className="text-lg font-semibold text-slate-900 dark:text-white group-active:text-blue-600 dark:group-active:text-blue-400 transition-colors duration-200 leading-tight">
                {title}
              </h4>
            </div>
          </div>
          <p className="text-slate-600 dark:text-slate-300 text-base leading-relaxed mb-5">
            {desc}
          </p>
          <div className="flex items-center text-blue-600 dark:text-blue-400 text-base font-medium">
            詳細を見る
            <svg
              className="w-5 h-5 ml-2 transform group-active:translate-x-1 transition-transform duration-200"
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
        </div>
      </div>
    </Link>
  )
}
