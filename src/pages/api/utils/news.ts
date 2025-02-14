import { getCollection, type CollectionEntry } from "astro:content";
import { AstroError } from "astro/errors";
import type { JSONData } from "@/src/type";
import { z } from "astro/zod";
import { sheetSchemaToZodSchema } from "astro-sheet-loader";

// URL Parameter
// - `start`: string || null : 掲載開始日
// - `end`: string || null : 掲載終了日
// - `long`: boolean || null : False OR Nullでは内容を省略
export async function GET(request: Request) {
    const host = new URL(request.url).hostname;
    const { searchParams } = new URL(request.url);
    const startParam = searchParams.get("start");
    const endParam = searchParams.get("end");
    const isLong = searchParams.get("long") === "true";

    const url =
        "https://docs.google.com/spreadsheets/d/1DgzrtZRnkOAhHSw2R85lRutATlXB-K9p-W9HiHfzF2Q/gviz/tq?tqx=out:json";

    const startDate = startParam ? new Date(startParam) : null;
    const endDate = endParam ? new Date(endParam) : null;
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const newsletters = await sheetToJson(url).then(parseSheet);

    const filteredNewsletters = newsletters
        .filter((entry) => {
            // ホスト名との一致をチェック
            if (host !== "localhost" && entry.target !== host) return false;

            const entryStartDate = new Date(entry.startDate);
            const entryEndDate = new Date(entry.endDate);

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
                entry.body = "";
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

// ref: https://github.com/AlphaJack/astro-sheet-loader/commit/98f626e5b925525b54d8ac264751259958833a26
export async function sheetToJson(url: string): Promise<JSONData> {
    const response = await fetchJSON(url);
    const text = await response.text();
    return parseJSON(text, url);
}
async function fetchJSON(url: string): Promise<Response> {
    return fetch(url).catch((error: Error) => {
        throw new AstroError(`Error fetching ${url}: ${error}`);
    });
}
async function parseJSON(text: string, url?: string): Promise<JSONData> {
    //const document = url?.split("/")[5];
    if (text.startsWith("<!DOCTYPE html>")) {
        throw new AstroError(
            `Error fetching JSON data for '${url}', check the ID and share settings of the document.`
        );
    }
    let jsonObject: JSONData;
    const jsonString = text.slice(47, -2);
    try {
        jsonObject = JSON.parse(jsonString);
    } catch (error) {
        throw new AstroError(`Error parsing JSON data for '${url}': ${error}`);
    }
    if (jsonObject.status === "error") {
        throw new AstroError(
            `Error in JSON data for '${url}': ${jsonObject.errors?.[0]?.detailed_message ?? "Unknown error"}`
        );
    }
    return jsonObject;
}

const newsSchema = z.object({
    A: z.string(), //更新日
    B: z.string().email(), // 作成者
    C: z.string(), // 掲載開始日
    D: z.string(), // 掲載終了日
    E: z.enum(["omu-aikido.com", "app.omu-aikido.com"]), // ターゲット
    F: z.enum(["High", "Medium", "Low", "Caution"]), // 重要度
    G: z.string(), // タイトル
    H: z.string().optional(), // 概要
    I: z.string(), // 本文
});

export const newsCollection = z.object({
    updatedAt: z.date(),
    createdBy: z.string().email(),
    startDate: z.date(),
    endDate: z.date(),
    target: z.enum(["omu-aikido.com", "app.omu-aikido.com"]),
    priority: z.enum(["High", "Medium", "Low", "Caution"]),
    title: z.string(),
    summary: z.string().optional(),
    body: z.string(),
});

async function parseSheet(
    data: JSONData
): Promise<z.infer<typeof newsCollection>[]> {
    const rows = data.table.rows;
    // ヘッダー行をスキップ
    const dataRows = rows.slice(1);

    const entries = dataRows.map((row) => {
        const entry: any = {};
        row.c.forEach((cell, index) => {
            const column = data.table.cols[index].id;
            if (cell) {
                entry[column] = cell.v;
            }
        });
        return entry;
    });

    return entries.map((entry) => {
        const validatedEntry = newsSchema.parse(entry);

        return newsCollection.parse({
            updatedAt: new Date(validatedEntry.A),
            createdBy: validatedEntry.B,
            startDate: new Date(validatedEntry.C),
            endDate: new Date(validatedEntry.D),
            target: validatedEntry.E,
            priority: validatedEntry.F,
            title: validatedEntry.G,
            summary: validatedEntry.H,
            body: validatedEntry.I,
        });
    });
}