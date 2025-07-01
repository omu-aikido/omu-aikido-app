import React, { useEffect, useState, useRef, useCallback, useMemo } from "react"

interface NewsItem {
  title: string
  timestamp: string
  importance?: "Caution" | "High" | "Medium" | "Low"
  summary?: string
  body?: string
}

interface NewsReaderProps {
  content: "long" | "short"
  path?: string
  source: string
}

// Custom hook for fetching news data
const useNewsData = (source: string, isLong: boolean) => {
  const [newsData, setNewsData] = useState<NewsItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchNews = async () => {
      try {
        setLoading(true)
        setError(null)
        const response = await fetch(
          `https://api.omu-aikido.com/${source}${isLong ? "?long=true" : ""}`,
        )

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`)
        }

        const data = await response.json()
        setNewsData(data as NewsItem[])
      } catch (err) {
        console.error("Error fetching news:", err)
        setError("Error loading news.")
      } finally {
        setLoading(false)
      }
    }

    fetchNews()
  }, [source, isLong])

  return { newsData, loading, error }
}

// Custom hook for handling URL-based navigation and scrolling
const useNewsNavigation = (
  newsData: NewsItem[],
  isLong: boolean,
  containerRef: React.RefObject<HTMLDivElement | null>,
) => {
  useEffect(() => {
    if (!isLong || newsData.length === 0) return

    const params = new URLSearchParams(window.location.search)
    const selectedId = params.get("id")

    if (selectedId && containerRef.current) {
      const targetItem = containerRef.current.querySelector(`[data-id="${selectedId}"]`)
      if (targetItem) {
        const detailsEl = targetItem.querySelector("details")
        if (detailsEl) detailsEl.open = true
        targetItem.scrollIntoView({
          behavior: "smooth",
          block: "center",
        })
      }
    }
  }, [newsData, isLong, containerRef])
}

// Utility function for getting importance color
const getImportanceColor = (importance?: string): string => {
  const colorMap: Record<string, string> = {
    Caution: "rgb(var(--maroon))",
    High: "rgb(var(--flamingo))",
    Medium: "rgb(var(--yellow))",
    Low: "rgb(var(--green))",
  }
  return colorMap[importance || ""] || "inherit"
}

// Component for rendering news item header
const NewsItemHeader: React.FC<{
  title: string
  importance?: string
  timestamp: string
}> = ({ title, importance, timestamp }) => {
  const titleColor = getImportanceColor(importance)
  const updatedAt = useMemo(() => new Date(timestamp).toLocaleDateString(), [timestamp])

  return (
    <h3 className="newsTitle" style={{ color: titleColor }}>
      {title}
      <small
        className="newsUpdate"
        style={{
          color: "rgb(var(--subtext0))",
          fontSize: "0.6em",
          float: "right",
        }}
      >
        更新日: {updatedAt}
      </small>
    </h3>
  )
}

// Component for rendering news item summary
const NewsItemSummary: React.FC<{ summary?: string }> = ({ summary }) => {
  if (!summary) return null

  return (
    <p className="newsDesc" style={{ paddingLeft: "1rem", marginBlock: "0" }}>
      {summary}
    </p>
  )
}

// Component for rendering long format news item
const LongNewsItem: React.FC<{
  item: NewsItem
  index: number
}> = ({ item, index }) => (
  <div className="newsItem" data-id={index.toString()}>
    <NewsItemHeader title={item.title} importance={item.importance} timestamp={item.timestamp} />
    <NewsItemSummary summary={item.summary} />
    <details>
      <p className="newsbody">{item.body}</p>
    </details>
    <hr />
  </div>
)

// Component for rendering short format news item
const ShortNewsItem: React.FC<{
  item: NewsItem
  index: number
  path: string
}> = ({ item, index, path }) => (
  <div className="newsItemContainer">
    <div className="newsItem">
      <NewsItemHeader title={item.title} importance={item.importance} timestamp={item.timestamp} />
      <NewsItemSummary summary={item.summary} />
    </div>
    <a href={`/${path}?id=${index}`}>詳細</a>
  </div>
)

// Component for rendering news header
const NewsHeader: React.FC<{
  content: "long" | "short"
  path: string
}> = ({ content, path }) => (
  <h2>
    お知らせ{" "}
    {content === "short" && (
      <small style={{ fontSize: "0.6em" }}>
        <a href={`/${path}`}>全て見る&gt;&gt;&gt;</a>
      </small>
    )}
  </h2>
)

// Loading component
const LoadingSpinner: React.FC = () => <div>Loading...</div>

// Error component
const ErrorMessage: React.FC<{ error: string }> = ({ error }) => <p>{error}</p>

// Main NewsReader component
const NewsReader: React.FC<NewsReaderProps> = ({ content, path = "news", source }) => {
  const containerRef = useRef<HTMLDivElement>(null)
  const isLong = content === "long"

  const { newsData, loading, error } = useNewsData(source, isLong)
  useNewsNavigation(newsData, isLong, containerRef)

  const renderNewsItem = useCallback(
    (item: NewsItem, index: number) => {
      if (isLong) {
        return <LongNewsItem key={index} item={item} index={index} />
      } else {
        return <ShortNewsItem key={index} item={item} index={index} path={path} />
      }
    },
    [isLong, path],
  )

  if (loading) return <LoadingSpinner />
  if (error) return <ErrorMessage error={error} />
  if (newsData.length === 0) return null

  return (
    <div id="news-block">
      <NewsHeader content={content} path={path} />
      <div className="news-container" ref={containerRef}>
        {newsData.map(renderNewsItem)}
      </div>
    </div>
  )
}

export default NewsReader
