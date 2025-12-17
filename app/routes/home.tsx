import { getAuth } from "@clerk/react-router/server"
import { Link, useFetcher } from "react-router"

import type { Route } from "./+types/home"

import { isDateString } from "@/type/date"
import { Role } from "@/type/role"
import { AddRecord } from "~/components/component/AddRecord"
import { MyRanking } from "~/components/component/MyRanking"
import { NextGrade } from "~/components/component/NextGrade"
import Recents from "~/components/component/Recents"
import { Button } from "~/components/ui/button"
import type { ActivityType } from "~/db/schema"
import { uc } from "~/lib/api-client"
import { timeForNextGrade } from "~/lib/utils"
import { style } from "~/styles/component"
import type { PagePath } from "~/type"

// MARK: Loader
export async function loader(args: Route.LoaderArgs) {
  const auth = await getAuth(args)
  const userId = auth.userId
  if (!userId) throw new Error("User not authenticated")

  const client = uc({ request: args.request })
  const [profileRes, summaryRes, accountRes, rankingRes] = await Promise.all([
    client.profile.$get(),
    client.summary.$get(),
    client.account.$get(),
    client.ranking.$get(),
  ])
  if (!profileRes.ok) throw new Error("Failed to fetch profile")
  const { profile } = await profileRes.json()
  if (!summaryRes.ok) throw new Error("Failed to fetch summary")
  const { summary } = await summaryRes.json()
  if (!accountRes.ok) throw new Error("Failed to fetch account")
  const { user } = await accountRes.json()
  if (!rankingRes.ok) throw new Error("Failed to fetch ranking data")
  const { ranking } = await rankingRes.json()

  const apps: PagePath[] = [
    { name: "記録", href: "/record", desc: "活動の記録" },
    { name: "アカウント", href: "/account", desc: "アカウント設定" },
  ]
  let role: Role | null = null
  if (user) {
    role = Role.fromString(`${user.publicMetadata?.role}`)
    if (role && role.isManagement()) {
      apps.push({ name: "管理者", href: "/admin", desc: "管理者ページ" })
      apps.push({ name: "審査", href: "/admin/norms", desc: "部員の稽古日数" })
    }
  }

  const activityFromPreviousGrade = summary.length > 0 ? summary[0].total / 1.5 : 0
  const grade = profile.grade
  const forNextGrade = timeForNextGrade(grade ? grade : 0)
  const needToNextGrade = Math.max(
    0,
    Math.floor(forNextGrade - activityFromPreviousGrade),
  )
  const gradeData = { grade, needToNextGrade, forNextGrade }

  const recent = summary.at(-1) as ActivityType | undefined

  const rankingdata = ranking

  return { gradeData, apps, recent, rankingdata }
}

// MARK: Meta
export function meta({}: Route.MetaArgs) {
  return [
    { title: "ホーム | ハム大合気ポータル" },
    { name: "description", content: "大阪公立大学合氣道部の活動管理アプリ" },
  ]
}

// MARK: Action
export async function action(args: Route.ActionArgs) {
  const request = args.request
  const client = uc({ request })
  const formData = await request.formData()
  const date = formData.get("date")
  const periodValue = formData.get("period")
  if (typeof date !== "string" || typeof periodValue !== "string") {
    return { error: "日付と稽古時間を入力してください。" }
  }
  if (!isDateString(date)) {
    return { error: "日付の形式が正しくありません。" }
  }
  const period = Number(periodValue)
  if (Number.isNaN(period) || period <= 0) {
    return { error: "稽古時間の形式が正しくありません。" }
  }

  const response = await client.activities.$post({ json: { date, period } })
  if (!response.ok) {
    const data = await response.json().catch(() => null)
    return {
      error: (data as { error?: string } | null)?.error ?? "記録の追加に失敗しました。",
    }
  }
  return { success: true }
}

// MARK: Component
export default function Home({ loaderData }: Route.ComponentProps) {
  const { gradeData, apps, recent, rankingdata } = loaderData
  const fetcher = useFetcher<typeof action>()

  return (
    <>
      <div data-testid="home-next-grade">
        <NextGrade {...gradeData} />
      </div>

      <div data-testid="home-my-ranking">
        <MyRanking props={rankingdata} />
      </div>

      <h1
        className={style.text.sectionTitle() + " mt-4"}
        data-testid="home-section-add-record"
      >
        記録追加
      </h1>

      <AddRecord fetcher={fetcher} />

      <Recents recent={recent} />

      <hr data-testid="home-divider" />
      <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
        {apps.map((app: PagePath) => (
          <Button variant="outline" className="h-24" key={app.href}>
            <Link
              to={app.href}
              className="flex flex-col items-center justify-center gap-2"
            >
              <span className="text-lg font-semibold">{app.name}</span>
              <p className="text-sm text-muted-foreground">{app.desc}</p>
            </Link>
          </Button>
        ))}
      </div>
    </>
  )
}
