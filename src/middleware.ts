import { clerkMiddleware, createRouteMatcher } from "@clerk/astro/server";
import * as profile from "@/src/lib/query/profile";
import { grade, year } from "@/src/utils";
import { Role } from "@/src/class";

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
                return userProfile;
            }
            if (
                Role.fromString(userProfile.role)?.isManagement() &&
                isAdminRoute(context.request)
            ) {
                context.redirect("/dashboard");
            }
        });
    }
});
