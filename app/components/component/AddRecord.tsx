import { useAuth } from "@clerk/react-router"
import React, { useState } from "react"
import type { FetcherWithComponents } from "react-router"

import { style } from "~/styles/component"

interface AddRecordProps {
  fetcher: FetcherWithComponents<unknown>
}

export const AddRecord = React.memo<AddRecordProps>(function AddRecord({ fetcher }) {
  const { userId } = useAuth()
  const submitting = fetcher.state === "submitting"
  const [formState, setFormState] = useState({
    date: new Date().toLocaleDateString(),
    period: "1.5",
  })

  const handleDateChange = React.useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setFormState(prev => ({ ...prev, date: e.target.value }))
  }, [])

  const handlePeriodChange = React.useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setFormState(prev => ({ ...prev, period: e.target.value }))
    },
    [],
  )

  return (
    <>
      <fetcher.Form method="post" className={style.form.container({ vertical: true })}>
        <input type="hidden" name="userId" value={userId ?? ""} />
        <label
          htmlFor="dateDaypicker"
          className={style.form.label({ necessary: true, class: "col-span-1" })}
        >
          日付
        </label>
        <input
          id="dateDaypicker"
          name="date"
          autoComplete="off"
          type="date"
          className={style.form.input({ class: "col-span-2" })}
          value={formState.date}
          onChange={handleDateChange}
        />
        <label
          htmlFor="timeInput"
          className={style.form.label({ necessary: true, class: "col-span-1" })}
        >
          稽古時間
        </label>
        <input
          id="timeInput"
          name="period"
          autoComplete="off"
          step="0.5"
          type="number"
          className={style.form.input({ class: "col-span-2" })}
          min="1"
          max="5"
          value={formState.period}
          onChange={handlePeriodChange}
        />
        <button
          disabled={submitting}
          type="submit"
          id="submitAddRecord"
          className={style.form.button({ class: "col-span-3 mt-2" })}
        >
          {submitting ? "送信中..." : "追加"}
        </button>
      </fetcher.Form>
    </>
  )
})
