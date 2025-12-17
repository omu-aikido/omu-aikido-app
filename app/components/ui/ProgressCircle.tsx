interface ProgressCircleProps {
  title: string
  className?: string
  id?: string
}

export function ProgressCircle({ title, className, id }: ProgressCircleProps) {
  return (
    <div
      className={`pointer-events-none fixed top-0 left-0 z-1000 h-full w-full bg-slate-400/30 backdrop-blur-sm dark:bg-slate-600/30 ${className}`}
      id={id}
      data-testid="progress-circle-overlay"
    >
      <div
        className="flex h-full flex-row items-center justify-center justify-items-center gap-2"
        data-testid="progress-circle-content"
      >
        <svg
          className="size-5 animate-spin text-slate-800 dark:text-slate-100"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          data-testid="progress-circle-spinner"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          />
        </svg>
        <h1
          className="text-2xl sm:text-lg md:text-xl"
          data-testid="progress-circle-title"
        >
          {title}
        </h1>
      </div>
    </div>
  )
}
