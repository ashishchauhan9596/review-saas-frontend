import { clerkMiddleware, createRouteMatcher, clerkClient } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

// Define the allowed admin email
const ADMIN_EMAIL = "ashishchauhan9596@gmail.com";

// Public routes - these must always be accessible so the sign-out can happen on the client
const isPublicRoute = createRouteMatcher(["/", "/sign-in(.*)", "/sign-up(.*)", "/sso-callback(.*)"]);

export const proxy = clerkMiddleware(async (auth, req) => {
  try {
    const { userId } = await auth();

    // 1. Always allow public routes to load (so client-side signOut can run)
    if (isPublicRoute(req)) {
      if (userId && req.nextUrl.pathname === "/" && !req.nextUrl.searchParams.has("error")) {
        try {
          const client = await clerkClient();
          const user = await client.users.getUser(userId);
          const email = user.emailAddresses.find(e => e.id === user.primaryEmailAddressId)?.emailAddress;

          if (email === ADMIN_EMAIL) {
            return NextResponse.redirect(new URL("/dashboard", req.url));
          } else {
            console.warn(`Unauthorized user on home page. Redirecting to sign out: ${email}`);
            return NextResponse.redirect(new URL("/?error=unauthorized", req.url));
          }
        } catch {
          // Ignore lookup failures on home page
        }
      }
      return NextResponse.next();
    }

    // 2. For protected routes (like /dashboard): strict checks
    if (!userId) {
      return NextResponse.redirect(new URL("/sign-in", req.url));
    }

    // 3. Verify user email for protected routes
    const client = await clerkClient();
    const user = await client.users.getUser(userId);
    const email = user.emailAddresses.find(e => e.id === user.primaryEmailAddressId)?.emailAddress;

    if (email !== ADMIN_EMAIL) {
      console.warn(`Blocking unauthorized login attempt from: ${email}`);
      return NextResponse.redirect(new URL("/?error=unauthorized", req.url));
    }

    return NextResponse.next();
  } catch (error: unknown) {
    console.error("Critical Auth Error in Middleware:", error);
    // If Clerk throws an authorization_invalid or any other error, redirect gracefully
    return NextResponse.redirect(new URL("/?error=unauthorized", req.url));
  }
});

export const config = {
  matcher: [
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    '/(api|trpc)(.*)',
  ],
};
