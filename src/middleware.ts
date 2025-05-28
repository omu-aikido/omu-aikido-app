import { clerkMiddleware, createRouteMatcher } from "@clerk/astro/server";
import * as profile from "@/src/lib/query/profile";
import { Role } from "@/src/class";
import { profile as userProfile } from "@/src/zod";
import type { z } from "astro/zod";

declare global {
    namespace App {
        interface Locals {
            user: z.infer<typeof userProfile>;
        }
    }
}

const isProtectedRoute = createRouteMatcher([
    "/dashboard(.*)",
    "/app(.*)",
    "/account(.*)",
    "/admin(.*)",
]);

const isAdminRoute = createRouteMatcher(["/admin(.*)"]);

export const onRequest = clerkMiddleware((auth, context) => {
    const { has, redirectToSignIn, userId } = auth();

    if (!userId && isProtectedRoute(context.request)) {
        // Add custom logic to run before redirecting
        return redirectToSignIn();
    } else if (userId) {
        profile.getProfile({ userId: userId }).then((userProfile) => {
            if (userProfile instanceof Response) {
                if (userProfile.status === 404) {
                    context.redirect("account/setup");
                } else if (userProfile.status === 422) {
                    context.redirect("account/recovery");
                }
            } else {
                context.locals.user = userProfile;
                const role = Role.fromString(userProfile.role);
                if (isAdminRoute(context.request) && role && !role.isManagement()) {
                    context.redirect("/dashboard");
                }
            }
        });
    }
});
