import type { Project } from "@prisma/client";

const initials = (title: string) =>
  title
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? "")
    .join("");

export function ProjectCard({ project, index = 0 }: { project: Project; index?: number }) {
  const href = project.liveUrl || project.repoUrl || undefined;
  const Wrapper = href ? "a" : "div";

  return (
    <Wrapper
      {...(href ? { href, target: "_blank", rel: "noopener noreferrer" } : {})}
      className="glass card-hover reveal group block overflow-hidden rounded-3xl"
      style={{ animationDelay: `${Math.min(index, 12) * 60}ms` }}
    >
      <div className="card-media relative aspect-[16/10] overflow-hidden bg-ink-800">
        {project.imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={project.imageUrl}
            alt={project.title}
            loading={index < 3 ? "eager" : "lazy"}
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-ink-800 to-ink-900">
            <span className="font-display text-5xl font-semibold text-mist-400/40">
              {initials(project.title)}
            </span>
          </div>
        )}

        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-ink-950 via-ink-950/10 to-transparent" />

        {project.featured && (
          <span className="absolute left-4 top-4 rounded-full border border-white/15 bg-black/40 px-3 py-1 text-[11px] font-medium tracking-wide text-aurora backdrop-blur-md">
            Unggulan
          </span>
        )}
      </div>

      <div className="space-y-4 p-6">
        <div className="space-y-2">
          <h3 className="font-display text-xl font-semibold tracking-tight text-mist-200 transition-colors group-hover:text-aurora">
            {project.title}
          </h3>
          <p className="line-clamp-3 text-sm leading-relaxed text-mist-400">{project.description}</p>
        </div>

        {project.techStack.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {project.techStack.slice(0, 5).map((tech) => (
              <span
                key={tech}
                className="rounded-full border border-white/8 bg-white/4 px-2.5 py-1 text-[11px] text-mist-400 transition-colors group-hover:border-white/15"
              >
                {tech}
              </span>
            ))}
          </div>
        )}

        {(project.liveUrl || project.repoUrl) && (
          <div className="flex items-center gap-4 pt-1 text-xs font-medium">
            {project.liveUrl && (
              <span className="inline-flex items-center gap-1.5 text-aurora">
                Lihat Live
                <span className="transition-transform duration-300 group-hover:translate-x-1">→</span>
              </span>
            )}
            {project.repoUrl && <span className="text-mist-400">Source</span>}
          </div>
        )}
      </div>
    </Wrapper>
  );
}
