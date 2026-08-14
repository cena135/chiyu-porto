import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { PUBLIC_WHERE, WITH_IMAGES } from "@/lib/projects";
import { ProjectModal } from "@/components/ProjectModal";

type Props = { params: Promise<{ slug: string }> };

async function getProject(slug: string) {
  try {
    return await prisma.project.findFirst({
      where: { slug, ...PUBLIC_WHERE },
      include: WITH_IMAGES,
    });
  } catch {
    return null;
  }
}

export default async function ProjectModalPage({ params }: Props) {
  const { slug } = await params;
  const project = await getProject(slug);
  
  if (!project) notFound();

  return <ProjectModal project={project} />;
}
