import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
  InputOTPSeparator,
} from "app/components/ui/input-otp"
import * as React from "react"

interface OTPInputProps {
  value?: string
  onChange?: (value: string) => void
  maxLength?: number
  disabled?: boolean
  className?: string
  placeholder?: string
}

export function OTPInput({
  value,
  onChange,
  maxLength = 6,
  disabled,
  className,
}: OTPInputProps) {
  return (
    <InputOTP
      maxLength={maxLength}
      value={value}
      onChange={onChange}
      disabled={disabled}
      className={className}
    >
      <InputOTPGroup>
        {Array.from({ length: Math.min(maxLength, 3) }, (_, i) => (
          <InputOTPSlot key={i} index={i} />
        ))}
      </InputOTPGroup>
      {maxLength > 3 && (
        <>
          <InputOTPSeparator />
          <InputOTPGroup>
            {Array.from({ length: maxLength - 3 }, (_, i) => (
              <InputOTPSlot key={i + 3} index={i + 3} />
            ))}
          </InputOTPGroup>
        </>
      )}
    </InputOTP>
  )
}
