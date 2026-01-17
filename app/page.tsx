import Image from "next/image";
import Link from "next/link";
import { Navbar } from "@/components/Navbar";
import { Hero } from "@/components/Hero";
import { CourseCard } from "@/components/CourseCard";
import { getCourses, fixWordPressUrls } from "@/lib/wordpress";
import { Star, Quote, ArrowRight, Users, GraduationCap, Building2 } from 'lucide-react';

export const revalidate = 60;

export default async function Home() {
  const allCourses = await getCourses();
  const featuredCourses = allCourses.slice(0, 3);

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-black">
      <Navbar />
      <main>
        <Hero />

        {/* Stats Section */}
        <section className="border-y border-zinc-200 bg-white py-12 dark:border-zinc-800 dark:bg-zinc-900/50">
          <div className="container mx-auto px-4 md:px-6">
            <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
              {[
                { label: "Egresados", value: "+22k", icon: Users },
                { label: "Años de Experiencia", value: "22", icon: Building2 },
                { label: "Cursos Disponibles", value: "15+", icon: GraduationCap },
                { label: "Satisfacción", value: "4.9/5", icon: Star },
              ].map((stat, i) => (
                <div key={i} className="flex flex-col items-center justify-center text-center">
                  <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400">
                    <stat.icon className="h-6 w-6" />
                  </div>
                  <div className="text-3xl font-black tracking-tight text-zinc-900 dark:text-zinc-50 md:text-4xl">
                    {stat.value}
                  </div>
                  <div className="mt-1 text-sm font-medium text-zinc-500 dark:text-zinc-400">
                    {stat.label}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Featured Courses */}
        <section className="py-24">
          <div className="container mx-auto px-4 md:px-6">
            <div className="mb-12 flex items-end justify-between">
              <div>
                <h2 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50 md:text-4xl">Cursos Destacados</h2>
                <p className="mt-4 text-lg text-zinc-600 dark:text-zinc-400">Capacitación profesional con rápida salida laboral.</p>
              </div>
              <Link href="/courses" className="hidden group items-center gap-2 text-sm font-bold text-blue-600 hover:text-blue-700 dark:text-blue-400 md:flex">
                Ver todos los cursos
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Link>
            </div>

            <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
              {featuredCourses.map((course: any) => {
                const image = fixWordPressUrls(course._embedded?.['wp:featuredmedia']?.[0]?.source_url ||
                  "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?q=80&w=2070&auto=format&fit=crop");
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
              <Link href="/courses" className="inline-flex items-center gap-2 text-sm font-bold text-blue-600 hover:text-blue-700 dark:text-blue-400">
                Ver todos los cursos <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </section>

        {/* Why Choose Us */}
        <section className="bg-white py-24 dark:bg-zinc-900/50">
          <div className="container mx-auto px-4 md:px-6">
            <div className="grid gap-16 lg:grid-cols-2 items-center">
              <div className="order-2 lg:order-1">
                <div className="relative aspect-square lg:aspect-[4/3] rounded-3xl overflow-hidden shadow-2xl">
                  <Image
                    src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?q=80&w=2071&auto=format&fit=crop"
                    alt="Estudiantes colaborando"
                    fill
                    className="object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                  <div className="absolute bottom-8 left-8 right-8 text-white">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="flex -space-x-2">
                        {[1, 2, 3, 4].map(i => (
                          <div key={i} className="h-8 w-8 rounded-full border-2 border-white bg-zinc-200 dark:border-zinc-800" />
                        ))}
                      </div>
                      <span className="text-sm font-medium">+2000 alumnos activos</span>
                    </div>
                    <p className="text-lg font-medium">"La mejor decisión para mi carrera profesional."</p>
                  </div>
                </div>
              </div>
              <div className="order-1 lg:order-2">
                <h2 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50 md:text-4xl">¿Por qué elegir <br /><span className="text-blue-600">Mundo Informática</span>?</h2>
                <p className="mt-4 text-lg text-zinc-600 dark:text-zinc-400">
                  Nos diferenciamos por ofrecer una educación práctica, actualizada y orientada a resultados reales.
                </p>

                <div className="mt-10 space-y-8">
                  {[
                    { title: "Certificación Profesional", desc: "Nuestros títulos son valorados en empresas, bancos y fuerzas de seguridad.", icon: GraduationCap, color: "blue" },
                    { title: "Salida Laboral Rápida", desc: "Programas diseñados específicamente para cubrir las necesidades del mercado actual.", icon: Building2, color: "purple" },
                    { title: "Para Todas las Edades", desc: "Desde cursos para niños de primaria hasta capacitación para adultos mayores.", icon: Users, color: "green" }
                  ].map((feature, i) => (
                    <div key={i} className="flex gap-4">
                      <div className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-${feature.color}-50 text-${feature.color}-600 dark:bg-${feature.color}-900/20 dark:text-${feature.color}-400`}>
                        <feature.icon className="h-7 w-7" />
                      </div>
                      <div>
                        <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-50">{feature.title}</h3>
                        <p className="mt-1 text-zinc-600 dark:text-zinc-400">{feature.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Testimonials */}
        <section className="py-24 bg-zinc-50 dark:bg-black">
          <div className="container mx-auto px-4 md:px-6">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50 md:text-4xl">Lo que dicen nuestros alumnos</h2>
              <p className="mt-4 text-lg text-zinc-600 dark:text-zinc-400">Historias reales de personas que transformaron su futuro.</p>
            </div>

            <div className="grid gap-8 md:grid-cols-3">
              {[
                { name: "María González", role: "Administrativa", text: "Gracias al curso de Secretariado Administrativo conseguí trabajo en una clínica a la semana de recibirme." },
                { name: "Juan Pérez", role: "Técnico en PC", text: "La práctica que se ve en el curso es increíble. Aprendí a reparar computadoras desde cero y hoy tengo mi propio taller." },
                { name: "Sofía Rodríguez", role: "Diseñadora", text: "El ambiente de estudio es excelente y los profesores siempre están dispuestos a ayudar. Muy recomendado." }
              ].map((testimonial, i) => (
                <div key={i} className="relative rounded-3xl bg-white p-8 shadow-sm transition-shadow hover:shadow-md dark:bg-zinc-900">
                  <Quote className="absolute right-8 top-8 h-8 w-8 text-blue-100 dark:text-blue-900/30" />
                  <div className="flex items-center gap-1 text-yellow-500 mb-4">
                    {[1, 2, 3, 4, 5].map(star => <Star key={star} className="h-4 w-4 fill-current" />)}
                  </div>
                  <p className="mb-6 text-zinc-600 dark:text-zinc-300">"{testimonial.text}"</p>
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-zinc-200 dark:bg-zinc-800" />
                    <div>
                      <div className="font-bold text-zinc-900 dark:text-zinc-50">{testimonial.name}</div>
                      <div className="text-xs text-zinc-500 dark:text-zinc-400">{testimonial.role}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="relative overflow-hidden bg-blue-600 py-24">
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff12_1px,transparent_1px),linear-gradient(to_bottom,#ffffff12_1px,transparent_1px)] bg-[size:24px_24px]"></div>
          <div className="container relative mx-auto px-4 text-center md:px-6">
            <h2 className="mb-6 text-3xl font-bold tracking-tight text-white md:text-5xl">¿Listo para empezar tu carrera?</h2>
            <p className="mx-auto mb-10 max-w-2xl text-lg text-blue-100 md:text-xl">
              Inscríbete hoy y da el primer paso hacia un futuro profesional exitoso. Cupos limitados.
            </p>
            <Link
              href="/register"
              className="inline-flex h-14 items-center justify-center rounded-full bg-white px-8 text-lg font-bold text-blue-600 shadow-lg transition-all hover:bg-blue-50 hover:scale-105"
            >
              Inscribirme Ahora
            </Link>
          </div>
        </section>
      </main>

      <footer className="border-t border-zinc-200 bg-white py-16 dark:border-zinc-800 dark:bg-black">
        <div className="container mx-auto px-4 md:px-6">
          <div className="grid gap-12 sm:grid-cols-2 md:grid-cols-4">
            <div>
              <div className="flex items-center gap-2 mb-6">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600 text-white font-bold text-xl">
                  M
                </div>
                <span className="text-xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
                  Mundo Informática
                </span>
              </div>
              <p className="text-sm leading-relaxed text-zinc-500 dark:text-zinc-400">
                Institución líder en capacitación profesional con más de dos décadas de trayectoria formando expertos.
              </p>
            </div>
            <div>
              <h3 className="mb-6 font-bold text-zinc-900 dark:text-zinc-50">Cursos</h3>
              <ul className="space-y-3 text-sm text-zinc-600 dark:text-zinc-400">
                <li><Link href="/courses" className="hover:text-blue-600 transition-colors">Técnicaturas</Link></li>
                <li><Link href="/courses" className="hover:text-blue-600 transition-colors">Cursos Cortos</Link></li>
                <li><Link href="/courses" className="hover:text-blue-600 transition-colors">Para Niños</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="mb-6 font-bold text-zinc-900 dark:text-zinc-50">Institución</h3>
              <ul className="space-y-3 text-sm text-zinc-600 dark:text-zinc-400">
                <li><Link href="/about" className="hover:text-blue-600 transition-colors">Sobre Nosotros</Link></li>
                <li><Link href="/contact" className="hover:text-blue-600 transition-colors">Contacto</Link></li>
                <li><Link href="/location" className="hover:text-blue-600 transition-colors">Ubicación</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="mb-6 font-bold text-zinc-900 dark:text-zinc-50">Alumnos</h3>
              <ul className="space-y-3 text-sm text-zinc-600 dark:text-zinc-400">
                <li><Link href="/campus" className="hover:text-blue-600 transition-colors">Campus Virtual</Link></li>
                <li><Link href="/resources" className="hover:text-blue-600 transition-colors">Recursos</Link></li>
              </ul>
            </div>
          </div>
          <div className="mt-16 border-t border-zinc-200 pt-8 text-center text-sm text-zinc-500 dark:border-zinc-800 dark:text-zinc-400">
            © {new Date().getFullYear()} Instituto Mundo Informática. Todos los derechos reservados.
          </div>
        </div>
      </footer>
    </div>
  );
}
