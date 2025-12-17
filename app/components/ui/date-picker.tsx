import { Button } from "app/components/ui/button"
import { Calendar } from "app/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "app/components/ui/popover"
import { cn } from "app/lib/utils"
import { format } from "date-fns"
import { CalendarIcon } from "lucide-react"

interface DatePickerProps {
  date?: Date
  onSelect?: (date: Date | undefined) => void
  placeholder?: string
  className?: string
  disabled?: boolean
}

export function DatePicker({
  date,
  onSelect,
  placeholder = "日付を選択",
  className,
  disabled,
}: DatePickerProps) {
  return (
    <Popover>
      <PopoverTrigger>
        <Button
          variant="outline"
          className={cn(
            "w-full justify-start text-left font-normal",
            !date && "text-muted-foreground",
            className,
          )}
          disabled={disabled}
        >
          <CalendarIcon className="mr-2 h-4 w-4" />
          {date ? format(date, "yyyy年MM月dd日") : <span>{placeholder}</span>}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar
          mode="single"
          selected={date}
          onSelect={onSelect}
          captionLayout="dropdown"
        />
      </PopoverContent>
    </Popover>
  )
}
