import { z } from "astro/zod";

export type RoleType =
    | "admin"
    | "captain"
    | "vice-captain"
    | "treasurer"
    | "member";
export type Year = "b1" | "b2" | "b3" | "b4" | "m1" | "m2" | "d1" | "d2";
export type Grade = 0 | 5 | 4 | 3 | 2 | 1 | -1 | -2;
