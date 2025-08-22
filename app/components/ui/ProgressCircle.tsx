interface ProgressCircleProps {
  title: string
  className?: string
  id?: string
}

export function ProgressCircle({ title, className, id }: ProgressCircleProps) {
  return (
    <div
      className={`fixed top-0 left-0 w-full h-full bg-slate-400/30 dark:bg-slate-600/30 backdrop-blur-sm z-[1000] pointer-events-none ${className}`}
      id={id}
      data-testid="progress-circle-overlay"
    >
      <div
        className="gap-2 flex flex-row justify-items-center justify-center items-center h-full"
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
          className="text-2xl md:text-xl sm:text-lg"
          data-testid="progress-circle-title"
        >
          {title}
        </h1>
      </div>
    </div>
  )
}
