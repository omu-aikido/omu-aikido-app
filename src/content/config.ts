// src/content/config.ts
import { defineCollection } from "astro:content";
import { sheetLoader } from "astro-sheet-loader";
import { z } from "astro/zod";

const newsletters = defineCollection({
    loader: sheetLoader({
        document: "1DgzrtZRnkOAhHSw2R85lRutATlXB-K9p-W9HiHfzF2Q",
        gid: 1001191532,
    }),
    schema: z.object({
        タイムスタンプ: z.coerce.date(),
        メールアドレス: z.string().email(),
        掲載開始日: z.coerce.date(),
        掲載終了日: z.coerce.date(),
        ターゲット: z.enum(["omu-aikido.com", "app.omu-aikido.com"]),
        重要度: z.enum(["High", "Medium", "Low", "Caution"]),
        題名: z.string(),
        要約: z.string().optional(),
        内容: z.string(),
    }),
});

export const collections = { newsletters };
