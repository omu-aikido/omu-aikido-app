import { iconPaths } from "./IconPaths" // Assuming IconPaths.ts is in the same directory

interface IconProps {
  icon: keyof typeof iconPaths
  color?: string
  gradient?: boolean
  size?: string
  className?: string
}

export function Icon({
  icon,
  color = "currentColor",
  gradient,
  size,
  className,
}: IconProps) {
  const iconPath = iconPaths[icon]

  // For React, you typically pass styles as an object
  const style: React.CSSProperties = {}
  if (size) {
    style.width = size
    style.height = size
    style.margin = `calc(${size} / 2)` // Adjust margin based on size
  } else {
    style.width = "1em"
    style.height = "1em"
    style.margin = "0.5em"
  }

  // Create a unique ID for the gradient if needed
  const gradientId = gradient
    ? `icon-gradient-${Math.random().toString(36).substring(2, 9)}`
    : undefined

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="40" // Default width/height, can be overridden by 'size' prop via style
      height="40" // Default width/height, can be overridden by 'size' prop via style
      viewBox="0 0 256 256"
      aria-hidden="true"
      stroke={gradient ? `url(#${gradientId})` : color}
      fill={gradient ? `url(#${gradientId})` : color}
      className={className}
      style={style}
    >
      {gradient && (
        <defs>
          {/* Define your gradient here if needed.
              The original Astro component didn't define the gradient, it just used a URL.
              You'd need to define the actual gradient (e.g., linearGradient) here
              if 'gradient' prop is meant to apply a specific SVG gradient.
              For now, I'm just creating the defs tag.
          */}
          {/* Example:
          <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="red" />
            <stop offset="100%" stopColor="blue" />
          </linearGradient>
          */}
        </defs>
      )}
      {/* dangerouslySetInnerHTML is used to inject the SVG path.
          Ensure iconPath content is sanitized if it comes from untrusted sources.
          In this case, it comes from a local file, so it should be safe.
      */}
      <g dangerouslySetInnerHTML={{ __html: iconPath }} />
    </svg>
  )
}
