import React, { useState, useEffect } from "react"

const gradeOptions = [
  { grade: "0", name: "無級" },
  { grade: "5", name: "5級" },
  { grade: "3", name: "3級" },
  { grade: "1", name: "1級" },
  { grade: "-1", name: "初段" },
  { grade: "-2", name: "弐段" },
]

const inputClass =
  "w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-md shadow-sm bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"

interface Profile {
  grade: string
  getGradeAt: string | null
  joinedAt: number
  year: string
}

interface ApiResponse {
  success: boolean
  profile?: Profile
  error?: string
}

interface ProfileSetupFormProps {
  userId: string
  patch?: boolean
  put?: boolean
}

function ProfileSetupForm({ userId, patch, put }: ProfileSetupFormProps) {
  const [grade, setGrade] = useState("0")
  const [getGradeAt, setGetGradeAt] = useState("")
  const [joinedAt, setJoinedAt] = useState(new Date().getFullYear().toString())
  const [year, setYear] = useState("b1")
  const [loading, setLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState("")

  useEffect(() => {
    if (patch) {
      fetch(`/api/user/profile?userId=${userId}`)
        .then(async (response) => {
          if (response.ok) {
            const data: ApiResponse = await response.json()

            if (data.success && data.profile) {
              const profile = data.profile
              setGrade(String(profile.grade))
              const gradeDate = profile.getGradeAt
                ? new Date(profile.getGradeAt).toISOString().split("T")[0]
                : ""
              setGetGradeAt(gradeDate)
              setJoinedAt(profile.joinedAt.toString())
              setYear(profile.year || "b1")
            } else {
              setErrorMessage("プロフィールデータの読み込みに失敗しました")
            }
          } else {
            setErrorMessage(`プロフィールが見つかりません (${response.status})`)
          }
        })
        .catch((error) => {
          setErrorMessage(`プロフィールの取得中にエラーが発生しました: ${error.status}`)
        })
    }
  }, [patch, userId])

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
    setLoading(true)
    setErrorMessage("")

    const data = {
      id: userId,
      grade,
      getGradeAt: getGradeAt || null,
      joinedAt: parseInt(joinedAt),
      year,
    }

    let method: "POST" | "PATCH" = "POST"
    if (patch) {
      method = "PATCH"
    } else if (put) {
      method = "PATCH"
    }
    try {
      const response = await fetch("/api/user/profile", {
        method: method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      })

      const responseText = await response.text()
      let result: ApiResponse
      try {
        result = JSON.parse(responseText)
      } catch (parseError) {
        setErrorMessage(`登録エラー`)
        return
      }

      if ((response.status === 200 || response.status === 201) && result.success) {
        window.location.href = "/dashboard"
      } else {
        const msg = result.error || "不明なエラーが発生しました。"
        setErrorMessage(`プロフィールの登録に失敗しました。 ${msg}`)
      }
    } catch (error: any) {
      setErrorMessage(`プロフィールの登録中にエラーが発生しました。 ${error.message}`)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="bg-slate-50 dark:bg-slate-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md mx-auto">
        <form
          className="space-y-6 bg-white dark:bg-slate-800 p-8 rounded-lg shadow-md"
          onSubmit={handleSubmit}
        >
          {errorMessage && <div className="text-red-500 text-center mb-4">{errorMessage}</div>}
          <div>
            <label
              htmlFor="grade"
              className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2"
            >
              所持級段位
              <span className="text-red-600 dark:text-red-400 ml-1">*</span>
            </label>
            <select
              id="grade"
              name="grade"
              required
              className={inputClass}
              value={grade}
              onChange={(e) => setGrade(e.target.value)}
              disabled={loading}
            >
              {gradeOptions.map((g) => (
                <option key={g.grade} value={g.grade}>
                  {g.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label
              htmlFor="getGradeAt"
              className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2"
            >
              級段位取得日
            </label>
            <input
              type="date"
              id="getGradeAt"
              name="getGradeAt"
              className={inputClass}
              value={getGradeAt}
              onChange={(e) => setGetGradeAt(e.target.value)}
              disabled={loading}
            />
          </div>

          <div>
            <label
              htmlFor="joinedAt"
              className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2"
            >
              入部年度
              <span className="text-red-600 dark:text-red-400 ml-1">*</span>
            </label>
            <input
              type="number"
              id="joinedAt"
              name="joinedAt"
              placeholder="4桁の数字"
              required
              className={inputClass}
              value={joinedAt}
              onChange={(e) => setJoinedAt(e.target.value)}
              disabled={loading}
            />
          </div>

          <div>
            <label
              htmlFor="year"
              className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2"
            >
              学年
              <span className="text-red-600 dark:text-red-400 ml-1">*</span>
            </label>
            <select
              id="year"
              name="year"
              required
              className={inputClass}
              value={year}
              onChange={(e) => setYear(e.target.value)}
              disabled={loading}
            >
              <option value="b1">学部 1年</option>
              <option value="b2">学部 2年</option>
              <option value="b3">学部 3年</option>
              <option value="b4">学部 4年</option>
              <option value="m1">修士 1年</option>
              <option value="m2">修士 2年</option>
              <option value="d1">博士 1年</option>
              <option value="d2">博士 2年</option>
            </select>
          </div>

          <button
            type="submit"
            className="cursor-pointer w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 dark:focus:ring-offset-slate-800 transition duration-200"
            disabled={loading}
          >
            {loading ? "送信中..." : patch ? "更新" : "登録"}
          </button>
        </form>
      </div>
    </div>
  )
}

export default ProfileSetupForm
