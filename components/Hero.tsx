import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight, PlayCircle, CheckCircle2 } from 'lucide-react';

export function Hero() {
    return (
        <section className="relative overflow-hidden py-24 md:py-32 lg:py-40">
            {/* Background Image */}
            <div className="absolute inset-0 -z-20">
                <Image
                    src="/fondo.jpeg"
                    alt="Fondo Mundo Informática"
                    fill
                    className="object-cover"
                    priority
                />
            </div>

            {/* Gradient Overlay */}
            <div className="absolute inset-0 -z-10 bg-gradient-to-t from-blue-900 via-blue-900/80 to-blue-900/30"></div>

            <div className="container mx-auto px-4 md:px-6 relative z-10">
                <div className="flex flex-col items-center text-center">
                    {/* Badge */}
                    <div className="inline-flex items-center rounded-full border border-yellow-400/30 bg-yellow-400/10 px-3 py-1 text-sm font-medium text-yellow-300 backdrop-blur-sm mb-8 transition-transform hover:scale-105 cursor-default">
                        <span className="relative flex h-2 w-2 mr-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-yellow-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-yellow-500"></span>
                        </span>
                        Inscripciones Abiertas - Ciclo Lectivo 2026
                    </div>

                    <h1 className="max-w-5xl text-4xl font-extrabold tracking-tight text-white sm:text-6xl md:text-7xl lg:text-7xl mb-8">
                        Tu Futuro Profesional <br className="hidden md:block" />
                        Comienza en <span className="text-yellow-400">Mundo Informática</span>
                    </h1>

                    <p className="max-w-2xl text-lg text-zinc-200 md:text-xl mb-10 leading-relaxed">
                        Capacítate en Informática, Administración y Docencia. <span className="font-semibold text-white">Más de 22 años</span> formando profesionales con títulos valorados en el mercado laboral.
                    </p>

                    <div className="flex flex-col gap-4 w-full sm:w-auto sm:flex-row sm:justify-center">
                        <Link
                            href="/courses"
                            className="inline-flex h-14 items-center justify-center rounded-full bg-yellow-500 px-8 text-lg font-bold text-blue-900 shadow-lg shadow-yellow-500/20 transition-all hover:bg-yellow-400 hover:scale-105 hover:shadow-yellow-500/40 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:ring-offset-2 focus:ring-offset-blue-900"
                        >
                            Ver Cursos Disponibles
                            <ArrowRight className="ml-2 h-5 w-5" />
                        </Link>
                        <Link
                            href="/about"
                            className="inline-flex h-14 items-center justify-center rounded-full border border-white/20 bg-white/10 px-8 text-lg font-bold text-white shadow-sm backdrop-blur-sm transition-all hover:bg-white/20 hover:border-white/40 focus:outline-none focus:ring-2 focus:ring-white/50 focus:ring-offset-2 focus:ring-offset-blue-900"
                        >
                            <PlayCircle className="ml-2 h-5 w-5 mr-2" />
                            Conoce el Instituto
                        </Link>
                    </div>

                    <div className="mt-16 flex flex-wrap justify-center gap-x-8 gap-y-4 text-sm font-medium text-zinc-300">
                        {[
                            "+22 años de trayectoria",
                            "+22.000 egresados",
                            "Títulos Oficiales",
                            "Bolsa de Trabajo"
                        ].map((item) => (
                            <div key={item} className="flex items-center gap-2 px-4 py-2 rounded-full bg-blue-950/50 border border-blue-800/50 backdrop-blur-sm">
                                <CheckCircle2 className="h-4 w-4 text-yellow-400 flex-shrink-0" />
                                <span className="font-medium">{item}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
}
