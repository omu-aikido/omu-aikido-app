import { useEffect, useRef, useState } from "react"

const TabBarScrollHide = ({ children }: { children: React.ReactNode }) => {
  const [visible, setVisible] = useState(true)
  const lastScrollY = useRef(typeof window !== "undefined" ? window.scrollY : 0)

  useEffect(() => {
    if (typeof window === "undefined") return

    const handleScroll = () => {
      const currentY = window.scrollY
      if (currentY > lastScrollY.current + 10) {
        setVisible(false)
      } else if (currentY < lastScrollY.current - 10) {
        setVisible(true)
      }
      lastScrollY.current = currentY
    }
    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  return (
    <div
      style={{
        transition: "transform 0.3s cubic-bezier(.4,0,.2,1)",
        transform: visible ? "translateY(0)" : "translateY(100%)",
        willChange: "transform",
      }}
    >
      {children}
    </div>
  )
}

export default TabBarScrollHide
