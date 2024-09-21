import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

const isPublicRoute = createRouteMatcher([
  "/signin",
  "/signup",
  "/",
  "/home"
])

const isPublicApiRoute = createRouteMatcher([
  "/api/videos"
])

export default clerkMiddleware((auth, req) => {
  const {userId} = auth()
  const currentUrl = new URL(req.url)
  const isAccessingDashboard = currentUrl.pathname === "/home"
  const isApiResquest = currentUrl.pathname.startsWith("/api")

  // if the user is logged in
  if (userId && isPublicRoute(req) && !isAccessingDashboard) {
    return NextResponse.redirect(new URL("/home", req.url))
  }
  
  // not logged in
  if (!userId) {
    // if user isn't logged in and trying to get acccess a protected route
    if (!isPublicApiRoute(req) && !isPublicApiRoute(req)) {
      return NextResponse.redirect(new URL("/signin", req.url))
    }
    
    // if the request is for a protected API and the user is not logged in
    if (isApiResquest && !isPublicApiRoute(req)) {
      return NextResponse.redirect(new URL("/signin", req.url))
    }
  }

  return NextResponse.next()
});

export const config = {
  matcher: ["/((?!.*\\..*|_next).*)", "/", "/(api|trpc)(.*)"],
};