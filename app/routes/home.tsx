import { getAuth } from "@clerk/react-router/ssr.server"
import type { ResultSet } from "@libsql/client"
import { Link, useFetcher } from "react-router"
import { CloudflareContext } from "workers/app"

import type { Route } from "./+types/home"

import { AddRecord } from "~/components/component/AddRecord"
import { MyRanking } from "~/components/component/MyRanking"
import { NextGrade } from "~/components/component/NextGrade"
import Recents from "~/components/component/Recents"
import { Button } from "~/components/ui/button"
import type { ActivityType } from "~/db/schema"
import {
  createActivity,
  getUserMonthlyRank,
  userActivitySummaryAndRecent,
} from "~/lib/query/activity"
import { getAccount, getProfile } from "~/lib/query/profile"
import { getJST, timeForNextGrade } from "~/lib/utils"
import { Role } from "~/lib/zod"
import { style } from "~/styles/component"
import type { PagePath } from "~/type"

// MARK: Loader
export async function loader(args: Route.LoaderArgs) {
  const auth = await getAuth(args)
  const userId = auth.userId
  if (!userId) throw new Error("User not authenticated")

  const env = args.context.get(CloudflareContext).env

  const apps: PagePath[] = [
    { name: "記録", href: "/record", desc: "活動の記録をつけよう" },
    { name: "アカウント", href: "/account", desc: "アカウント設定ページ" },
  ]
  let role: Role | null = null
  const user = await getAccount({ userId, env })
  if (user) {
    role = Role.fromString(`${user.publicMetadata?.role}`)
    if (role && role.isManagement()) {
      apps.push({ name: "管理者", href: "/admin", desc: "管理者ページ" })
    }
  }

  const profile = await getProfile({ userId, env })
  if (!profile) throw new Error("Profile not found")
  const summary = await userActivitySummaryAndRecent({
    userId,
    start: profile.getGradeAt
      ? getJST(new Date(profile.getGradeAt))
      : getJST(new Date(profile.joinedAt, 3, 1)),
    end: getJST(new Date()),
    env,
  })
  const activityFromPreviousGrade = summary.length > 0 ? summary[0].total / 1.5 : 0
  const grade = profile.grade
  const forNextGrade = timeForNextGrade(grade ? grade : 0)
  const needToNextGrade = Math.max(
    0,
    Math.floor(forNextGrade - activityFromPreviousGrade),
  )
  const gradeData = { grade, needToNextGrade, forNextGrade }

  const recent = summary.pop() as ActivityType

  const rankingdata = await getUserMonthlyRank({
    userId,
    year: new Date().getUTCFullYear(),
    month: new Date().getUTCMonth(),
    env,
  })

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
export async function action(
  args: Route.ActionArgs,
): Promise<{ response: ResultSet | null; result: boolean }> {
  const request = args.request
  const env = args.context.get(CloudflareContext).env
  const formData = await request.formData()
  const userId = formData.get("userId") as string
  const date = formData.get("date") as string
  const period = formData.get("period") as unknown as number
  if (!date || !period) return { response: null, result: false }
  const response = await createActivity({
    userId,
    activity: { id: "", date, userId, period },
    env,
  })
  const result = { response, count: response.rowsAffected }
  return { response: result.response, result: result.count === 1 }
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
          <Button asChild variant="outline" className="h-24" key={app.href}>
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
