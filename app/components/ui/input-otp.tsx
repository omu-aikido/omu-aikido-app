import { cn } from "app/lib/utils"
import { OTPInput, OTPInputContext } from "input-otp"
import { MinusIcon } from "lucide-react"
import * as React from "react"

function InputOTP({
  className,
  containerClassName,
  ...props
}: React.ComponentProps<typeof OTPInput> & { containerClassName?: string }) {
  return (
    <OTPInput
      data-slot="input-otp"
      containerClassName={cn(
        "cn-input-otp flex items-center has-disabled:opacity-50",
        containerClassName,
      )}
      spellCheck={false}
      className={cn("tw:disabled:cursor-not-allowed", className)}
      {...props}
    />
  )
}

function InputOTPGroup({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="input-otp-group"
      className={cn(
        "tw:has-aria-invalid:ring-destructive/20 tw:dark:has-aria-invalid:ring-destructive/40 tw:has-aria-invalid:border-destructive tw:rounded-md tw:has-aria-invalid:ring-[3px] tw:flex tw:items-center",
        className,
      )}
      {...props}
    />
  )
}

function InputOTPSlot({
  index,
  className,
  ...props
}: React.ComponentProps<"div"> & { index: number }) {
  const inputOTPContext = React.useContext(OTPInputContext)
  const { char, hasFakeCaret, isActive } = inputOTPContext?.slots[index] ?? {}

  return (
    <div
      data-slot="input-otp-slot"
      data-active={isActive}
      className={cn(
        "tw:dark:bg-input/30 tw:border-input tw:data-[active=true]:border-ring tw:data-[active=true]:ring-ring/50 tw:data-[active=true]:aria-invalid:ring-destructive/20 tw:dark:data-[active=true]:aria-invalid:ring-destructive/40 tw:aria-invalid:border-destructive tw:data-[active=true]:aria-invalid:border-destructive tw:size-9 tw:border-y tw:border-r tw:text-sm tw:shadow-xs tw:transition-all tw:outline-none tw:first:rounded-l-md tw:first:border-l tw:last:rounded-r-md tw:data-[active=true]:ring-[3px] tw:relative tw:flex tw:items-center tw:justify-center tw:data-[active=true]:z-10",
        className,
      )}
      {...props}
    >
      {char}
      {hasFakeCaret && (
        <div className="tw:pointer-events-none tw:absolute tw:inset-0 tw:flex tw:items-center tw:justify-center">
          <div className="tw:animate-caret-blink tw:bg-foreground tw:h-4 tw:w-px tw:duration-1000 tw:bg-foreground tw:h-4 tw:w-px" />
        </div>
      )}
    </div>
  )
}

function InputOTPSeparator({ ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="input-otp-separator"
      className="tw:[&_svg:not([class*=size-])]:size-4 tw:flex tw:items-center"
      role="separator"
      {...props}
    >
      <MinusIcon />
    </div>
  )
}

export { InputOTP, InputOTPGroup, InputOTPSlot, InputOTPSeparator }
