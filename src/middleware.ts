import { clerkMiddleware, createRouteMatcher } from "@clerk/astro/server";
import * as profile from "@/src/lib/query/profile";
import { Role } from "@/src/class";

const isProtectedRoute = createRouteMatcher([
    "/dashboard(.*)",
    "/app(.*)",
    "/account(.*)",
    "/admin(.*)",
]);

const isAdminRoute = createRouteMatcher(["/admin(.*)"]);

export const onRequest = clerkMiddleware(async (auth, context, next) => {
    const { has, redirectToSignIn, userId } = auth();

    if (!userId && isProtectedRoute(context.request)) {
        // Add custom logic to run before redirecting
        return redirectToSignIn();
    } else if (userId) {
        const userProfile = await profile.getProfile({ userId: userId });

        if (userProfile instanceof Response) {
            if (userProfile.status === 404) {
                return context.redirect("/account/setup");
            } else if (userProfile.status === 422) {
                return context.redirect("/account/recovery");
            }
        } else {
            context.locals.profile = userProfile;
            const role = Role.fromString(userProfile.role);
            if (isAdminRoute(context.request) && role && !role.isManagement()) {
                return context.redirect("/dashboard");
            }
        }
    }
    return next();
});
