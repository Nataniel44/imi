import { Navbar } from "@/components/Navbar";
import { CourseCard } from "@/components/CourseCard";
import { getCourses } from "@/lib/wordpress";

export const revalidate = 60; // Revalidate every 60 seconds

export default async function CoursesPage() {
    const courses = await getCourses();

    return (
        <div className="min-h-screen bg-zinc-50 dark:bg-black">
            <Navbar />
            <main className="container mx-auto px-4 py-12 md:px-6">
                <div className="mb-12">
                    <h1 className="text-4xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">Nuestros Cursos</h1>
                    <p className="mt-4 text-lg text-zinc-600 dark:text-zinc-400">
                        Formación profesional adaptada a las necesidades del mercado laboral actual.
                    </p>
                </div>

                <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
                    {courses.map((course: any) => {
                        // Extract featured image safely
                        const image = course._embedded?.['wp:featuredmedia']?.[0]?.source_url ||
                            "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?q=80&w=2070&auto=format&fit=crop";

                        // Strip HTML from excerpt
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
                                price={course.acf?.price || "Consultar"}
                            />
                        );
                    })}
                </div>
            </main>
        </div>
    );
}
