import { SignIn } from "@clerk/nextjs";

export const metadata = { title: "Masuk Admin" };

export default function SignInPage() {
  return (
    <main className="flex min-h-dvh flex-col items-center justify-center gap-8 px-6">
      <div className="fade-up text-center">
        <h1 className="font-display text-2xl font-semibold tracking-tight">Panel Admin</h1>
        <p className="mt-2 text-sm text-text-dim">Masuk untuk mengelola proyek portofolio.</p>
      </div>
      <div className="fade-up" style={{ animationDelay: "100ms" }}>
        <SignIn
          appearance={{
            elements: {
              rootBox: "shadow-none",
              card: "bg-white/5 backdrop-blur-xl border border-white/10",
            },
          }}
        />
      </div>
    </main>
  );
}
