import { z } from "zod";
import { Role } from "./class";

export const profile = z.object({
    grade: z.preprocess((val) => Number(val), z.number()), // 文字列から数値へ変換
    role: Role.type(),
    getGradeAt: z.string(),
    joinedAt: z.preprocess((val) => Number(val), z.number()), // 文字列から数値へ変換
    year: z.string(),
});
