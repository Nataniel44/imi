import Link from 'next/link';
import { ArrowRight, PlayCircle, CheckCircle2 } from 'lucide-react';

export function Hero() {
    return (
        <section className="relative overflow-hidden bg-white dark:bg-black py-20 md:py-32">
            <div className="absolute inset-0 -z-10 bg-[radial-gradient(45%_40%_at_50%_60%,rgba(59,130,246,0.1),rgba(255,255,255,0))] dark:bg-[radial-gradient(45%_40%_at_50%_60%,rgba(59,130,246,0.15),rgba(0,0,0,0))]" />

            <div className="container mx-auto px-4 md:px-6">
                <div className="flex flex-col items-center text-center">
                    <div className="inline-flex items-center rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-sm font-medium text-blue-800 dark:border-blue-900 dark:bg-blue-900/30 dark:text-blue-300 mb-6">
                        <span className="flex h-2 w-2 rounded-full bg-blue-600 mr-2 animate-pulse"></span>
                        Inscripciones Abiertas - Ciclo Lectivo 2026
                    </div>

                    <h1 className="max-w-4xl text-4xl font-extrabold tracking-tight text-zinc-900 dark:text-zinc-50 sm:text-5xl md:text-6xl lg:text-7xl">
                        Tu Futuro Profesional Comienza en <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-cyan-500">Mundo Informática</span>
                    </h1>

                    <p className="mt-6 max-w-2xl text-lg text-zinc-600 dark:text-zinc-400 md:text-xl">
                        Capacítate en Informática, Administración y Docencia. Cursos técnicos con rápida salida laboral y títulos valorados en el mercado.
                    </p>

                    <div className="mt-10 flex flex-col gap-4 sm:flex-row sm:justify-center">
                        <Link
                            href="/courses"
                            className="inline-flex h-12 items-center justify-center rounded-full bg-blue-600 px-8 text-base font-medium text-white transition-colors hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-black"
                        >
                            Ver Cursos Disponibles
                            <ArrowRight className="ml-2 h-4 w-4" />
                        </Link>
                        <Link
                            href="/about"
                            className="inline-flex h-12 items-center justify-center rounded-full border border-zinc-200 bg-white px-8 text-base font-medium text-zinc-900 transition-colors hover:bg-zinc-50 hover:text-blue-600 focus:outline-none focus:ring-2 focus:ring-zinc-500 focus:ring-offset-2 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-100 dark:hover:bg-zinc-800 dark:focus:ring-offset-black"
                        >
                            <PlayCircle className="ml-2 h-4 w-4 mr-2" />
                            Conoce el Instituto
                        </Link>
                    </div>

                    <div className="mt-12 flex flex-wrap justify-center gap-x-8 gap-y-4 text-sm text-zinc-600 dark:text-zinc-400">
                        {[
                            "+22 años de trayectoria",
                            "+22 mil egresados",
                            "Todas las modalidades",
                            "Diferentes edades",
                            "Becas y descuentos exclusivos"
                        ].map((item) => (
                            <div key={item} className="flex items-center gap-2">
                                <CheckCircle2 className="h-5 w-5 text-green-500 flex-shrink-0" />
                                <span className="font-medium">{item}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
}
