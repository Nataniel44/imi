import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Navbar } from "@/components/Navbar";
import { getCourseBySlug, getCourses } from "@/lib/wordpress";
import { Clock, BookOpen, Star, CheckCircle, ArrowLeft, PlayCircle } from 'lucide-react';
import { BuyButton } from "@/components/BuyButton";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

interface PageProps {
    params: Promise<{ slug: string }>;
}

export const revalidate = 60;

export default async function CoursePage({ params }: PageProps) {
    const { slug } = await params;
    const course = await getCourseBySlug(slug);
    const session = await getServerSession(authOptions);

    if (!course) {
        notFound();
    }

    // Check if user has purchased the course
    let isPurchased = false;
    if (session?.user?.email) {
        const wpUrl = process.env.NEXT_PUBLIC_WORDPRESS_URL;
        const adminUser = process.env.WP_ADMIN_USER;
        let adminPass = process.env.WP_ADMIN_APP_PASSWORD;

        if (wpUrl && adminUser && adminPass) {
            adminPass = adminPass.replace(/\s/g, '');
            const authHeader = "Basic " + Buffer.from(`${adminUser}:${adminPass}`).toString("base64");

            const usersRes = await fetch(`${wpUrl}/wp-json/wp/v2/users?search=${encodeURIComponent(session.user.email)}&context=edit`, {
                headers: { Authorization: authHeader },
                cache: 'no-store'
            });

            const users = await usersRes.json();
            if (users.length > 0) {
                const purchasedCourses = users[0].acf?.purchased_courses || [];
                isPurchased = purchasedCourses.some((c: any) => {
                    const idOrSlug = (typeof c === 'object' && c !== null) ? (c.ID || c.id || c.post_name) : c;
                    return idOrSlug === course.id || idOrSlug === course.slug;
                });
            }
        }
    }

    // Extract data safely
    const image = course._embedded?.['wp:featuredmedia']?.[0]?.source_url ||
        "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?q=80&w=2070&auto=format&fit=crop";
    const category = course.acf?.category || "General";
    const lessons = course.acf?.lessons || 0;
    const duration = course.acf?.duration || "Consultar";
    const rating = course.acf?.rating || 5.0;
    const price = course.acf?.price || "Consultar";

    return (
        <div className="min-h-screen bg-white dark:bg-black">
            <Navbar />

            <div className="relative h-[400px] w-full overflow-hidden bg-zinc-900">
                <Image
                    src={image}
                    alt={course.title.rendered}
                    fill
                    className="object-cover opacity-50"
                    priority
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-6 md:p-12">
                    <div className="container mx-auto">
                        <Link
                            href="/courses"
                            className="mb-6 inline-flex items-center text-sm font-medium text-zinc-300 hover:text-white"
                        >
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            Volver a cursos
                        </Link>
                        <div className="mb-4 inline-flex items-center rounded-full bg-blue-600/20 px-3 py-1 text-sm font-medium text-blue-400 backdrop-blur-sm">
                            {category}
                        </div>
                        <h1 className="mb-4 text-3xl font-bold text-white md:text-5xl" dangerouslySetInnerHTML={{ __html: course.title.rendered }} />
                        <div className="flex flex-wrap items-center gap-6 text-zinc-300">
                            <div className="flex items-center gap-2">
                                <BookOpen className="h-5 w-5" />
                                <span>{lessons} Lecciones</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <Clock className="h-5 w-5" />
                                <span>{duration}</span>
                            </div>
                            <div className="flex items-center gap-2 text-yellow-400">
                                <Star className="h-5 w-5 fill-current" />
                                <span>{rating} / 5.0</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <main className="container mx-auto grid gap-12 px-4 py-12 md:grid-cols-[2fr_1fr] md:px-6">
                <div className="space-y-12">
                    <section>
                        <h2 className="mb-6 text-2xl font-bold text-zinc-900 dark:text-zinc-50">Descripción del Curso</h2>
                        <div
                            className="prose prose-lg dark:prose-invert text-zinc-600 dark:text-zinc-400"
                            dangerouslySetInnerHTML={{ __html: course.content.rendered }}
                        />
                    </section>

                    <section>
                        <h2 className="mb-6 text-2xl font-bold text-zinc-900 dark:text-zinc-50">Lo que aprenderás</h2>
                        <div className="grid gap-4 sm:grid-cols-2">
                            {[
                                "Fundamentos teóricos y prácticos",
                                "Herramientas profesionales actualizadas",
                                "Metodologías de trabajo reales",
                                "Resolución de problemas complejos",
                                "Mejores prácticas de la industria",
                                "Proyecto final integrador"
                            ].map((item, i) => (
                                <div key={i} className="flex items-start gap-3">
                                    <CheckCircle className="mt-1 h-5 w-5 shrink-0 text-green-500" />
                                    <span className="text-zinc-600 dark:text-zinc-400">{item}</span>
                                </div>
                            ))}
                        </div>
                    </section>
                </div>

                <div className="relative">
                    <div className="sticky top-24 rounded-2xl border border-zinc-200 bg-zinc-50 p-6 dark:border-zinc-800 dark:bg-zinc-900">
                        <div className="mb-6 text-center">
                            <span className="text-3xl font-bold text-zinc-900 dark:text-zinc-50">{isPurchased ? "Adquirido" : price}</span>
                            <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">Acceso de por vida al contenido</p>
                        </div>

                        {isPurchased ? (
                            <Link
                                href={`/courses/${slug}/learn`}
                                className="mb-4 flex w-full items-center justify-center gap-2 rounded-full bg-green-600 py-3 font-bold text-white transition-colors hover:bg-green-700"
                            >
                                <PlayCircle className="h-5 w-5" />
                                Empezar Curso
                            </Link>
                        ) : (
                            <BuyButton
                                courseId={course.slug}
                                title={course.title.rendered}
                                price={price}
                            />
                        )}

                        <button className="w-full rounded-full border border-zinc-200 bg-white py-3 font-bold text-zinc-900 transition-colors hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100 dark:hover:bg-zinc-700">
                            Descargar Temario
                        </button>

                        <div className="mt-6 space-y-4 border-t border-zinc-200 pt-6 text-sm text-zinc-600 dark:border-zinc-800 dark:text-zinc-400">
                            <div className="flex justify-between">
                                <span>Duración</span>
                                <span className="font-medium text-zinc-900 dark:text-zinc-50">{duration}</span>
                            </div>
                            <div className="flex justify-between">
                                <span>Nivel</span>
                                <span className="font-medium text-zinc-900 dark:text-zinc-50">Intermedio</span>
                            </div>
                            <div className="flex justify-between">
                                <span>Certificado</span>
                                <span className="font-medium text-zinc-900 dark:text-zinc-50">Sí, al finalizar</span>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}

export async function generateStaticParams() {
    const courses = await getCourses();
    return courses.map((course: any) => ({
        slug: course.slug,
    }));
}
