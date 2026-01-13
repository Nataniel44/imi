import Image from "next/image";
import { Navbar } from "@/components/Navbar";
import { Hero } from "@/components/Hero";
import { CourseCard } from "@/components/CourseCard";
import { getCourses } from "@/lib/wordpress";

export const revalidate = 60;

export default async function Home() {
  const allCourses = await getCourses();
  // Take first 3 courses
  const featuredCourses = allCourses.slice(0, 3);

  return (
    <div className="min-h-screen bg-white dark:bg-black">
      <Navbar />
      <main>
        <Hero />

        <section className="py-20">
          <div className="container mx-auto px-4 md:px-6">
            <div className="mb-12 flex items-end justify-between">
              <div>
                <h2 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">Cursos Destacados</h2>
                <p className="mt-2 text-zinc-600 dark:text-zinc-400">Capacitación profesional con rápida salida laboral.</p>
              </div>
              <a href="/courses" className="hidden text-sm font-medium text-blue-600 hover:text-blue-500 dark:text-blue-400 md:block">
                Ver todos los cursos &rarr;
              </a>
            </div>

            <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
              {featuredCourses.map((course: any) => {
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
                    price={course.acf?.price || "Consultar"}
                  />
                );
              })}
            </div>

            <div className="mt-12 text-center md:hidden">
              <a href="/courses" className="text-sm font-medium text-blue-600 hover:text-blue-500 dark:text-blue-400">
                Ver todos los cursos &rarr;
              </a>
            </div>
          </div>
        </section>

        <section className="bg-zinc-50 py-20 dark:bg-zinc-900/30">
          <div className="container mx-auto px-4 md:px-6">
            <div className="grid gap-12 lg:grid-cols-2 items-center">
              <div>
                <h2 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">¿Por qué elegir Mundo Informática?</h2>
                <div className="mt-8 space-y-6">
                  <div className="flex gap-4">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400">
                      🎓
                    </div>
                    <div>
                      <h3 className="font-bold text-zinc-900 dark:text-zinc-50">Certificación Profesional</h3>
                      <p className="mt-2 text-zinc-600 dark:text-zinc-400">Nuestros títulos son valorados en empresas, bancos y fuerzas de seguridad.</p>
                    </div>
                  </div>
                  <div className="flex gap-4">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400">
                      💼
                    </div>
                    <div>
                      <h3 className="font-bold text-zinc-900 dark:text-zinc-50">Salida Laboral Rápida</h3>
                      <p className="mt-2 text-zinc-600 dark:text-zinc-400">Programas diseñados específicamente para cubrir las necesidades del mercado actual.</p>
                    </div>
                  </div>
                  <div className="flex gap-4">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400">
                      👶
                    </div>
                    <div>
                      <h3 className="font-bold text-zinc-900 dark:text-zinc-50">Para Todas las Edades</h3>
                      <p className="mt-2 text-zinc-600 dark:text-zinc-400">Desde cursos para niños de primaria hasta capacitación para adultos mayores.</p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="relative aspect-square lg:aspect-auto lg:h-[600px] rounded-2xl overflow-hidden bg-zinc-200 dark:bg-zinc-800">
                {/* Placeholder for feature image */}
                <div className="absolute inset-0 flex items-center justify-center text-zinc-400">
                  <span className="text-6xl">🏫</span>
                </div>
                <Image
                  src="https://images.unsplash.com/photo-1531482615713-2afd69097998?q=80&w=2070&auto=format&fit=crop"
                  alt="Estudiantes aprendiendo"
                  fill
                  unoptimized
                  className="object-cover"
                />
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-zinc-200 bg-white py-12 dark:border-zinc-800 dark:bg-black">
        <div className="container mx-auto px-4 md:px-6">
          <div className="grid gap-8 sm:grid-cols-2 md:grid-cols-4">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600 text-white font-bold">
                  M
                </div>
                <span className="text-lg font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
                  Mundo Informática
                </span>
              </div>
              <p className="text-sm text-zinc-500 dark:text-zinc-400">
                Formando profesionales para el futuro.
              </p>
            </div>
            <div>
              <h3 className="mb-4 font-bold text-zinc-900 dark:text-zinc-50">Cursos</h3>
              <ul className="space-y-2 text-sm text-zinc-600 dark:text-zinc-400">
                <li><a href="/courses" className="hover:text-blue-600">Técnicaturas</a></li>
                <li><a href="/courses" className="hover:text-blue-600">Cursos Cortos</a></li>
                <li><a href="/courses" className="hover:text-blue-600">Para Niños</a></li>
              </ul>
            </div>
            <div>
              <h3 className="mb-4 font-bold text-zinc-900 dark:text-zinc-50">Institución</h3>
              <ul className="space-y-2 text-sm text-zinc-600 dark:text-zinc-400">
                <li><a href="#" className="hover:text-blue-600">Sobre Nosotros</a></li>
                <li><a href="#" className="hover:text-blue-600">Contacto</a></li>
                <li><a href="#" className="hover:text-blue-600">Ubicación</a></li>
              </ul>
            </div>
            <div>
              <h3 className="mb-4 font-bold text-zinc-900 dark:text-zinc-50">Alumnos</h3>
              <ul className="space-y-2 text-sm text-zinc-600 dark:text-zinc-400">
                <li><a href="#" className="hover:text-blue-600">Campus Virtual</a></li>
                <li><a href="#" className="hover:text-blue-600">Recursos</a></li>
              </ul>
            </div>
          </div>
          <div className="mt-12 border-t border-zinc-200 pt-8 text-center text-sm text-zinc-500 dark:border-zinc-800 dark:text-zinc-400">
            © {new Date().getFullYear()} Instituto Mundo Informática. Todos los derechos reservados.
          </div>
        </div>
      </footer>
    </div>
  );
}
