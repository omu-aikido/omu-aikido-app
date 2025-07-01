import type { Route } from "@/./.react-router/types/app/+types/root"
export const links: Route.LinksFunction = () => [
  { rel: "sitemap", href: "/sitemap-index.xml" },
  { rel: "icon", type: "image/svg+xml", href: "/favicon.svg" },
]

export function Head({ title }: { title: string }) {
  return (
    <>
      <meta charSet="UTF-8" />
      <meta name="viewport" content="width=device-width initial-scale=1" />
      <meta name="description" content="大阪公立大学合氣道部 活動管理アプリ" />
      <link rel="sitemap" href="/sitemap-index.xml" />
      <link rel="canonical" href="https://app.omu-aikido.com" />
      <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
      <title>{title}</title>
    </>
  )
}
