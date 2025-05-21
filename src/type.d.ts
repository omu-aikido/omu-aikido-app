import { z } from "astro/zod";
import { clerkUserSchema, clerkUsers, profile } from "@/src/zod";

export type Year = "b1" | "b2" | "b3" | "b4" | "m1" | "m2" | "d1" | "d2";
export type Grade = 0 | 5 | 4 | 3 | 2 | 1 | -1 | -2;

export interface JSONData {
    version: string;
    reqId: string;
    status: string;
    errors?: ErrorData[];
    sig: string;
    table: TableData;
}

export interface ErrorData {
    reason: string;
    message: string;
    detailed_message: string;
}

export interface TableData {
    cols: Column[];
    rows: Row[];
}

export interface Row {
    c: (Cell | null)[];
}

export interface Column {
    id: string;
    label: string;
    type: string;
    pattern?: string;
}

export interface Cell {
    f?: string;
    v: string | number | null;
}

export type Account = z.infer<typeof clerkUserSchema>;
export type Accounts = z.infer<typeof clerkUsers>;
export type Profile = z.infer<typeof profile>;