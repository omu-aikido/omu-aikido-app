import { useAuth } from "@clerk/react-router"
import React, { useCallback, useEffect, useRef, useState } from "react"
import type { FetcherWithComponents } from "react-router"
import { toast } from "sonner"

import { Button } from "~/components/ui/button"
import { DatePicker } from "~/components/ui/date-picker"
import { Input } from "~/components/ui/input"
import { Label } from "~/components/ui/label"
import { style } from "~/styles/component"

interface AddRecordProps {
  fetcher: FetcherWithComponents<unknown>
}

export const AddRecord = React.memo<AddRecordProps>(function AddRecord({ fetcher }) {
  const { userId } = useAuth()
  const submitting = fetcher.state === "submitting"
  const today = new Date()
  const [selectedDate, setSelectedDate] = useState<Date>(today)
  const [period, setPeriod] = useState("1.5")
  const wasSubmitting = useRef(submitting)

  const handlePeriodChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setPeriod(e.target.value)
  }, [])

  const formatDateForInput = useCallback((date: Date) => {
    return [
      date.getFullYear(),
      String(date.getMonth() + 1).padStart(2, "0"),
      String(date.getDate()).padStart(2, "0"),
    ].join("-")
  }, [])

  useEffect(() => {
    if (wasSubmitting.current && !submitting) {
      const data = fetcher.data as { error?: string } | null
      if (!data?.error) {
        toast("記録が追加されました。", {
          description: `日付: ${formatDateForInput(selectedDate)}, 稽古時間: ${period}時間`,
        })
      }
    }
    wasSubmitting.current = submitting
  }, [submitting, fetcher.data, selectedDate, period, formatDateForInput])

  return (
    <>
      <fetcher.Form
        method="post"
        className={style.form.container({ vertical: true })}
        data-testid="add-record-form"
      >
        <input
          type="hidden"
          name="userId"
          value={userId ?? ""}
          data-testid="add-record-input-userid"
        />
        <input
          type="hidden"
          name="date"
          value={formatDateForInput(selectedDate)}
          data-testid="add-record-input-date"
        />
        <Label className="col-span-1" data-testid="add-record-label-date">
          日付
        </Label>
        <div className="col-span-3">
          <DatePicker
            date={selectedDate}
            onSelect={date => date && setSelectedDate(date)}
            placeholder="日付を選択してください"
          />
        </div>
        <Label
          htmlFor="timeInput"
          className="col-span-1"
          data-testid="add-record-label-period"
        >
          稽古時間
        </Label>
        <Input
          id="timeInput"
          name="period"
          autoComplete="off"
          step="0.5"
          type="number"
          min="1"
          max="5"
          value={period}
          onChange={handlePeriodChange}
          className="col-span-3"
          data-testid="add-record-input-period"
        />
        <Button
          disabled={submitting}
          type="submit"
          id="submitAddRecord"
          className={style.form.button({ class: "col-span-4 mt-2" })}
          data-testid="add-record-button-submit"
        >
          {submitting ? "送信中..." : "追加"}
        </Button>
      </fetcher.Form>
    </>
  )
})
