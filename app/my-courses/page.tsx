import { Navbar } from "@/components/Navbar";
import { CourseCard } from "@/components/CourseCard";
import { getCourseBySlug, getCourseById } from "@/lib/wordpress";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function MyCoursesPage() {
    const session = await getServerSession(authOptions);

    if (!session) {
        redirect('/login');
    }

    // Get user's purchased courses from WordPress
    const wpUrl = process.env.NEXT_PUBLIC_WORDPRESS_URL;
    if (!wpUrl) {
        return <div>Error: WordPress URL not configured</div>;
    }

    const adminUser = process.env.WP_ADMIN_USER;
    let adminPass = process.env.WP_ADMIN_APP_PASSWORD;

    if (!adminUser || !adminPass) {
        return <div>Error: Admin credentials not configured</div>;
    }

    adminPass = adminPass.replace(/\s/g, '');
    const authHeader = "Basic " + Buffer.from(`${adminUser}:${adminPass}`).toString("base64");

    // Get user by email
    const usersRes = await fetch(`${wpUrl}/wp-json/wp/v2/users?search=${encodeURIComponent(session.user?.email || '')}&context=edit`, {
        headers: {
            Authorization: authHeader,
        },
        cache: 'no-store'
    });

    const users = await usersRes.json();

    let purchasedCourses: any[] = [];

    if (users.length > 0) {
        const rawPurchasedCourses = users[0].acf?.purchased_courses || [];

        // Handle both IDs (numbers) and Slugs (strings)
        for (const item of rawPurchasedCourses) {
            let course = null;

            // If it's an object (sometimes ACF returns objects), extract ID
            const idOrSlug = (typeof item === 'object' && item !== null) ? (item.ID || item.id) : item;

            if (typeof idOrSlug === 'number' || !isNaN(Number(idOrSlug))) {
                console.log(`Fetching course by ID: ${idOrSlug}`);
                course = await getCourseById(Number(idOrSlug));
            } else if (typeof idOrSlug === 'string') {
                console.log(`Fetching course by Slug: ${idOrSlug}`);
                course = await getCourseBySlug(idOrSlug);
            }

            if (course) {
                purchasedCourses.push(course);
            }
        }
    }

    return (
        <div className="min-h-screen bg-zinc-50 dark:bg-black">
            <Navbar />
            <main className="container mx-auto px-4 py-12 md:px-6">
                <div className="mb-12">
                    <h1 className="text-4xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">Mis Cursos</h1>
                    <p className="mt-4 text-lg text-zinc-600 dark:text-zinc-400">
                        Cursos que has adquirido y a los que tienes acceso completo.
                    </p>
                </div>

                {purchasedCourses.length === 0 ? (
                    <div className="rounded-2xl border border-zinc-200 bg-white p-12 text-center dark:border-zinc-800 dark:bg-zinc-900">
                        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-zinc-100 dark:bg-zinc-800">
                            <span className="text-3xl">📚</span>
                        </div>
                        <h2 className="mb-2 text-xl font-bold text-zinc-900 dark:text-zinc-50">
                            Aún no has comprado ningún curso
                        </h2>
                        <p className="mb-6 text-zinc-600 dark:text-zinc-400">
                            Explora nuestro catálogo y comienza tu formación profesional
                        </p>
                        <a
                            href="/courses"
                            className="inline-flex rounded-full bg-blue-600 px-6 py-3 font-bold text-white transition-colors hover:bg-blue-700"
                        >
                            Ver Cursos Disponibles
                        </a>
                    </div>
                ) : (
                    <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
                        {purchasedCourses.map((course: any) => {
                            const image = course._embedded?.['wp:featuredmedia']?.[0]?.source_url ||
                                "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?q=80&w=2070&auto=format&fit=crop";
                            const description = course.excerpt?.rendered?.replace(/<[^>]+>/g, '') || "";

                            return (
                                <CourseCard
                                    key={course.id}
                                    title={course.title.rendered}
                                    slug={course.slug}
                                    image={image}
                                    category={course.acf?.category || "General"}
                                    description={description}
                                    lessons={course.acf?.lessons || 0}
                                    duration={course.acf?.duration || "Consultar"}
                                    rating={course.acf?.rating || 5.0}
                                    price="Adquirido"
                                />
                            );
                        })}
                    </div>
                )}
            </main>
        </div>
    );
}
