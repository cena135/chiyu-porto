import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

const isProtected = createRouteMatcher(["/admin(.*)", "/api/projects(.*)"]);

export default clerkMiddleware(async (auth, req) => {
  // GET /api/projects tetap publik (dipakai frontend); mutation & /admin wajib login.
  const isPublicRead = req.method === "GET" && req.nextUrl.pathname.startsWith("/api/projects");
  if (!isProtected(req) || isPublicRead) return;

  if (req.nextUrl.pathname.startsWith("/api/")) {
    // Permintaan API: cukup ditolak. Mengalihkan ke halaman login tidak berguna
    // untuk pemanggil yang mengharapkan JSON.
    await auth.protect();
    return;
  }

  /**
   * Halaman: tujuannya HARUS disebutkan eksplisit.
   *
   * Tanpa `unauthenticatedUrl`, Clerk pada instance PRODUCTION menjawab 404
   * untuk pengunjung yang belum login — bukan mengarahkannya ke halaman login.
   * Di instance development hal ini tidak terlihat karena handshake dev-browser
   * menutupinya. Itulah sebabnya /admin tiba-tiba 404 setelah pindah ke
   * production, padahal kode ini tidak berubah.
   */
  await auth.protect({
    unauthenticatedUrl: new URL("/sign-in", req.url).toString(),
  });
});

export const config = {
  matcher: [
    "/((?!_next|api/uploads|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|avif|png|gif|svg|ico|woff2?|ttf)).*)",
    "/(api|trpc)(.*)",
  ],
};
