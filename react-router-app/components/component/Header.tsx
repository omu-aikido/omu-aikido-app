import { style } from "@/src/styles/component"

interface Link {
  label: string
  href: string
}

interface AuthedHeaderProps {
  title: string
  homelink: string
  textLinks: Link[]
  children: React.ReactNode
}

export function ReactHeader({ title, homelink, textLinks, children }: AuthedHeaderProps) {
  const pathname = typeof window !== "undefined" ? window.location.pathname : "/"
  return (
    <>
      <header className="m-0 py-0 px-6 top-0 z-50 sticky bg-slate-200/70 dark:bg-slate-800/90 text-slate-900 dark:text-slate-200 flex justify-between items-center h-20">
        <h2 className="items-center-safe justify-items-center w-1/6 ">
          <a className="items-center-safe justify-items-center text-xl font-bold" href={homelink}>
            {title.slice(0, 8)}
          </a>
        </h2>
        {textLinks.length > 0 && (
          <div className="hidden sm:flex">
            <nav className={style.header.navigation.block()}>
              {textLinks.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  className={style.header.navigation.link({
                    active: pathname.startsWith(link.href),
                  })}
                  aria-current={
                    link.href === "/"
                      ? pathname === "/"
                        ? "page"
                        : undefined
                      : pathname.startsWith(link.href)
                        ? "page"
                        : undefined
                  }
                >
                  {link.label}
                </a>
              ))}
            </nav>
          </div>
        )}
        {children}
      </header>
      <div className="backdrop-blur-md fixed top-0 left-0 w-full h-20 z-10" />
    </>
  )
}
