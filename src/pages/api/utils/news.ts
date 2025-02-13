import { getCollection, type CollectionEntry } from "astro:content";

const newsletters = await getCollection("newsletters");

// URL Parameter
// - `start`: string || null : 掲載開始日
// - `end`: string || null : 掲載終了日
// - `long`: boolean || null : False OR Nullでは内容を省略
export function GET(request: Request) {
    const host = new URL(request.url).hostname;
    const { searchParams } = new URL(request.url);
    const startParam = searchParams.get("start");
    const endParam = searchParams.get("end");
    const isLong = searchParams.get("long") === "true";

    const startDate = startParam ? new Date(startParam) : null;
    const endDate = endParam ? new Date(endParam) : null;
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const filteredNewsletters = newsletters
        .filter((entry: CollectionEntry<"newsletters">) => {
            // ホスト名との一致をチェック
            if (host !== "localhost" && entry.data.ターゲット !== host)
                return false;

            const entryStartDate = new Date(entry.data.掲載開始日);
            const entryEndDate = new Date(entry.data.掲載終了日);

            // 掲載開始日のチェック
            if (startDate) {
                if (entryStartDate < startDate) return false;
            } else {
                if (entryStartDate > today) return false;
            }

            // 掲載終了日のチェック
            if (endDate) {
                if (entryEndDate > endDate) return false;
            } else {
                if (entryEndDate < today) return false;
            }

            return true;
        })
        .map((entry) => {
            if (!isLong) {
                entry.data.内容 = "";
            }
            return entry;
        });

    let acao = "https://omu-aikido.com";
    if (host.endsWith("omu-aikido.com")) {
        acao = host;
    }

    return new Response(JSON.stringify(filteredNewsletters), {
        headers: {
            "Cache-Control":
                "max-age=0, s-maxage=14400, stale-while-revalidate=3600",
            "content-type": "application/json",
            "Access-Control-Allow-Origin": acao,
        },
    });
}
