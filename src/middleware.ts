import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

const isProtected = createRouteMatcher(["/admin(.*)", "/api/projects(.*)"]);

export default clerkMiddleware(async (auth, req) => {
  // GET /api/projects tetap publik (dipakai frontend); mutation & /admin wajib login.
  const isPublicRead = req.method === "GET" && req.nextUrl.pathname.startsWith("/api/projects");
  if (isProtected(req) && !isPublicRead) {
    await auth.protect();
  }
});

export const config = {
  matcher: [
    "/((?!_next|api/uploads|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|avif|png|gif|svg|ico|woff2?|ttf)).*)",
    "/(api|trpc)(.*)",
  ],
};
