import { tv } from "tailwind-variants"

export const ProgressIndicator = ({
  step,
}: {
  step: "basic" | "personal" | "profile"
}) => {
  const steps = ["基本情報", "個人情報", "プロファイル"]
  const currentIndex =
    step === "basic" ? 0 : step === "personal" ? 1 : step === "profile" ? 2 : 2

  const indicator = tv({
    base: "w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold",
    variants: {
      step: {
        current: "bg-blue-600 text-white",
        completed: "border-2 border-green-600 text-green-600",
        upcoming: "bg-slate-200 text-slate-500 dark:bg-slate-600 dark:text-slate-200",
      },
    },
  })

  return (
    <div className="mb-6 flex justify-center">
      {steps.map((label, idx) => (
        <div key={label} className="flex items-center">
          <div
            className={indicator({
              step:
                idx < currentIndex
                  ? "completed"
                  : idx === currentIndex
                    ? "current"
                    : "upcoming",
            })}
          >
            {idx + 1}
          </div>
          {idx < steps.length - 1 && (
            <div className="w-6 h-0.5 bg-slate-400 dark:bg-slate-500 mx-2" />
          )}
        </div>
      ))}
    </div>
  )
}
