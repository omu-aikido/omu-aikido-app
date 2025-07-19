import { getAuth } from "@clerk/react-router/ssr.server"
import { redirect, useFetcher } from "react-router"

import type { Route } from "./+types/home"

import { AddRecord } from "~/components/component/AddRecord"
import { NextGrade } from "~/components/component/NextGrade"
import Recents from "~/components/component/Recents"
import { AppIcon } from "~/components/ui/AppIcon"
import Grid from "~/components/ui/Grid"
import { createActivity, recentlyActivity, userActivity } from "~/lib/query/activity"
import { getAccount, getProfile } from "~/lib/query/profile"
import { timeForNextGrade } from "~/lib/utils"
import { Role } from "~/lib/zod"
import { style } from "~/styles/component"
import type { ActionResult, PagePath } from "~/type"

export function meta({}: Route.MetaArgs) {
  return [
    { title: "ハム大合気ポータル" },
    { name: "description", content: "大阪公立大学合氣道部の活動管理アプリ" },
  ]
}

// MARK: Loader
export async function loader(args: Route.LoaderArgs) {
  const auth = await getAuth(args)
  const userId = auth.userId
  if (!userId) return redirect("/sign-in?redirect_url=" + args.request.url)

  const env = args.context.cloudflare.env

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
  const activityFromPreviousGrade = await userActivity({
    userId,
    start: new Date(profile?.getGradeAt ? profile.getGradeAt : new Date(profile!.joinedAt, 3, 1)),
    end: new Date(),
    env,
  })
  const grade = profile?.grade ? profile.grade : 0
  const forNextGrade = timeForNextGrade(grade ? grade : 0)
  const needToNextGrade = Math.max(
    0,
    Math.floor(
      forNextGrade -
        activityFromPreviousGrade.map(record => record.period).reduce((a, b) => a + b, 0) / 1.5,
    ),
  )
  const gradeData = { grade, needToNextGrade, forNextGrade }

  const recent = await recentlyActivity({ userId: userId!, limit: 1, env })

  return { gradeData, apps, recent }
}

// MARK: Action
export async function action(args: Route.ActionArgs): Promise<ActionResult> {
  const request = args.request
  const env = args.context.cloudflare.env
  const formData = await request.formData()
  const userId = formData.get("userId") as string
  const date = formData.get("date") as string
  const period = formData.get("period") as unknown as number
  if (!date || !period)
    return {
      data: null,
      result: false,
    }
  const response = await createActivity({ userId, activity: { id: "", date, userId, period }, env })
  const result = {
    row: response.rows,
    count: response.rowsAffected,
  }
  return {
    data: result,
    result: result.count == 1,
  }
}

// MARK: Component
export default function Home({ loaderData }: Route.ComponentProps) {
  const { gradeData, apps, recent } = loaderData
  const fetcher = useFetcher()
  return (
    <>
      <NextGrade {...gradeData} />

      <h1 className={style.text.sectionTitle() + " mt-4"}>記録追加</h1>

      <AddRecord fetcher={fetcher} />

      <Recents recent={recent[0]} />

      <hr />
      <Grid>
        {apps.map((app: PagePath) => (
          <AppIcon key={app.href} title={app.name} id={app.href} desc={app.desc} />
        ))}
      </Grid>
    </>
  )
}
