import { ActionError, defineAction } from "astro:actions";
import { z } from "astro/zod";
import { createProfile, updateProfile } from "@/src/lib/query/profile";

export const user = {
    profile: {
        add: defineAction({
            accept: "form",
            input: z.object({
                id: z.string(),
                grade: z.string(),
                getGradeAt: z.string().optional(),
                joinedAt: z.string(),
                year: z.string(),
            }),
            handler: async (input, context) => {
                const userId = context.locals.auth().userId;
                if (!userId || userId !== input.id) {
                    throw new ActionError({
                        code: "UNAUTHORIZED",
                        message: "Something went wrong!",
                    });
                }
                const result = await createProfile({
                    id: input.id,
                    grade: Number(input.grade),
                    getGradeAt: new Date(input.getGradeAt ?? new Date()),
                    joinedAt: Number(input.joinedAt),
                    year: input.year,
                });
                if (result instanceof Error) {
                    throw new ActionError({
                        code: "UNAUTHORIZED",
                        message: "Failed to create profile",
                    });
                }
                return result;
            },
        }),
        update: defineAction({
            accept: "form",
            input: z.object({
                id: z.string(),
                grade: z.string(),
                getGradeAt: z.string(),
                joinedAt: z.string(),
                year: z.string(),
                role: z.string(),
            }),
            handler: async (input, context) => {
                const userId = context.locals.auth().userId;
                const role = context.locals.profile?.role;
                if (!userId || userId !== input.id) {
                    throw new ActionError({
                        code: "UNAUTHORIZED",
                        message: "Something went wrong!",
                    });
                }
                const result = await updateProfile({
                    id: input.id,
                    grade: Number(input.grade),
                    getGradeAt: new Date(input.getGradeAt),
                    joinedAt: Number(input.joinedAt),
                    year: input.year,
                    role: role || "member",
                });
                if (result instanceof Error) {
                    throw new ActionError({
                        code: "UNAUTHORIZED",
                        message: "Failed to update profile",
                    });
                }
                return { success: true };
            },
        }),
    },
    // add: defineAction({
    //     handler: (input, context) => {
    //         return { success: true };
    //     },
    // }),
    // update: defineAction({}),
    // delete: defineAction({}),
};
