import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { getCourseBySlug, getLessonsByCourseId } from "@/lib/wordpress";
import LearnClient from "./LearnClient";

export const dynamic = 'force-dynamic';

interface PageProps {
    params: Promise<{ slug: string }>;
}

export default async function LearnPage({ params }: PageProps) {
    const session = await getServerSession(authOptions);
    const { slug } = await params;

    if (!session) {
        redirect(`/login?callbackUrl=/courses/${slug}/learn`);
    }

    try {
        const course = await getCourseBySlug(slug);
        if (!course) {
            redirect('/courses');
        }

        const lessons = await getLessonsByCourseId(course.id);

        return (
            <LearnClient
                course={course}
                lessons={lessons}
                slug={slug}
            />
        );
    } catch (error) {
        console.error("Error loading classroom data on server:", error);
        return (
            <div className="flex min-h-screen flex-col items-center justify-center bg-white dark:bg-black p-4 text-center">
                <h1 className="text-2xl font-bold text-red-600">Error al cargar el aula</h1>
                <p className="mt-2 text-zinc-500">No pudimos conectar con el servidor de contenido. Por favor, intenta de nuevo más tarde.</p>
                <a href={`/courses/${slug}`} className="mt-6 text-blue-600 hover:underline">Volver al curso</a>
            </div>
        );
    }
}
