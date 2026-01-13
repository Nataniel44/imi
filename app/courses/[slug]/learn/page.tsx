"use client";

import { Navbar } from "@/components/Navbar";
import {
    PlayCircle,
    CheckSquare,
    Download,
    ChevronRight,
    ChevronDown,
    Clock,
    ArrowLeft,
    ArrowRight,
    FileText,
    ExternalLink,
    MessageCircle,
    Layout
} from 'lucide-react';
import Link from "next/link";
import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter, useParams } from "next/navigation";

export default function LearnPage() {
    const { data: session, status } = useSession();
    const router = useRouter();
    const params = useParams();
    const slug = params.slug as string;

    const [course, setCourse] = useState<any>(null);
    const [lessons, setLessons] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeLesson, setActiveLesson] = useState<any>(null);
    const [activeTab, setActiveTab] = useState<'contenido' | 'recursos' | 'comunidad'>('contenido');
    const [expandedModules, setExpandedModules] = useState<string[]>([]);

    useEffect(() => {
        if (status === "unauthenticated") {
            router.push(`/login?callbackUrl=/courses/${slug}/learn`);
        }

        if (status === "authenticated" && slug) {
            fetchData();
        }
    }, [status, slug]);

    async function fetchData() {
        try {
            const wpUrl = process.env.NEXT_PUBLIC_WORDPRESS_URL || 'http://localhost:8000';

            const courseRes = await fetch(`${wpUrl}/wp-json/wp/v2/cursos?slug=${slug}&_embed&acf_format=standard`);
            const courses = await courseRes.json();

            if (courses.length === 0) {
                router.push('/courses');
                return;
            }
            const currentCourse = courses[0];
            setCourse(currentCourse);

            const lessonsRes = await fetch(`${wpUrl}/wp-json/wp/v2/lecciones?_embed&acf_format=standard&per_page=100`);
            const allLessons = await lessonsRes.json();

            const filteredLessons = allLessons.filter((lesson: any) => {
                const rel = lesson.acf?.curso_relacionado;
                const relId = typeof rel === 'object' ? rel.ID : rel;
                return relId === currentCourse.id;
            });

            // Ordenar lecciones (puedes añadir un campo 'orden' en ACF para esto)
            setLessons(filteredLessons);

            if (filteredLessons.length > 0) {
                setActiveLesson(filteredLessons[0]);
                // Expandir el primer módulo por defecto
                const firstModule = filteredLessons[0].acf?.modulo || "General";
                setExpandedModules([firstModule]);
            }

            setLoading(false);
        } catch (error) {
            console.error("Error fetching data:", error);
            setLoading(false);
        }
    }

    const groupedLessons = lessons.reduce((acc: any, lesson: any) => {
        const moduleName = lesson.acf?.modulo || "General";
        if (!acc[moduleName]) acc[moduleName] = [];
        acc[moduleName].push(lesson);
        return acc;
    }, {});

    const toggleModule = (moduleName: string) => {
        setExpandedModules(prev =>
            prev.includes(moduleName)
                ? prev.filter(m => m !== moduleName)
                : [...prev, moduleName]
        );
    };

    const goToNextLesson = () => {
        const currentIndex = lessons.findIndex(l => l.id === activeLesson.id);
        if (currentIndex < lessons.length - 1) {
            const next = lessons[currentIndex + 1];
            setActiveLesson(next);
            if (!expandedModules.includes(next.acf?.modulo || "General")) {
                setExpandedModules(prev => [...prev, next.acf?.modulo || "General"]);
            }
        }
    };

    const goToPrevLesson = () => {
        const currentIndex = lessons.findIndex(l => l.id === activeLesson.id);
        if (currentIndex > 0) {
            const prev = lessons[currentIndex - 1];
            setActiveLesson(prev);
            if (!expandedModules.includes(prev.acf?.modulo || "General")) {
                setExpandedModules(prev => [...prev, prev.acf?.modulo || "General"]);
            }
        }
    };

    if (loading) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-white dark:bg-black">
                <div className="h-12 w-12 animate-spin rounded-full border-4 border-blue-600 border-t-transparent"></div>
            </div>
        );
    }

    const currentIndex = lessons.findIndex(l => l.id === activeLesson?.id);
    const progress = Math.round(((currentIndex + 1) / lessons.length) * 100);

    return (
        <div className="min-h-screen bg-zinc-50 dark:bg-black">
            <Navbar />

            <main className="mx-auto max-w-[1600px] px-0 py-0 md:px-4 md:py-8 lg:px-8">
                <div className="grid gap-0 md:gap-8 lg:grid-cols-[1fr_400px]">
                    <div className="flex flex-col space-y-0 md:space-y-6">
                        {/* Video Player Container */}
                        <div className="relative aspect-video w-full overflow-hidden bg-zinc-900 md:rounded-2xl md:shadow-2xl">
                            {activeLesson?.acf?.tipo === 'video' && activeLesson?.acf?.url_video ? (
                                <iframe
                                    src={activeLesson.acf.url_video.replace("watch?v=", "embed/").split("&")[0]}
                                    className="h-full w-full"
                                    allowFullScreen
                                />
                            ) : (
                                <div className="absolute inset-0 flex flex-col items-center justify-center bg-gradient-to-br from-zinc-800 to-zinc-950 text-white px-4 text-center">
                                    <div className="mb-6 rounded-full bg-white/5 p-8 backdrop-blur-xl border border-white/10">
                                        {activeLesson?.acf?.tipo === 'tarea' ? (
                                            <CheckSquare className="h-16 w-16 text-blue-400" />
                                        ) : (
                                            <FileText className="h-16 w-16 text-zinc-400" />
                                        )}
                                    </div>
                                    <h2 className="text-2xl font-bold md:text-3xl">{activeLesson?.title?.rendered}</h2>
                                    <p className="mt-2 text-zinc-400 max-w-md">
                                        {activeLesson?.acf?.tipo === 'tarea' ? "Esta es una tarea práctica. Revisa las instrucciones en la pestaña de recursos." : "Esta lección no contiene video."}
                                    </p>
                                </div>
                            )}
                        </div>

                        {/* Navigation Buttons */}
                        <div className="flex items-center justify-between bg-white p-4 dark:bg-zinc-900/50 md:rounded-xl md:border md:border-zinc-200 dark:md:border-zinc-800">
                            <button
                                onClick={goToPrevLesson}
                                disabled={currentIndex === 0}
                                className="flex items-center gap-2 text-sm font-bold text-zinc-600 transition-opacity hover:text-blue-600 disabled:opacity-30 dark:text-zinc-400"
                            >
                                <ArrowLeft className="h-4 w-4" /> Anterior
                            </button>
                            <div className="hidden text-xs font-bold text-zinc-400 uppercase tracking-widest sm:block">
                                Lección {currentIndex + 1} de {lessons.length}
                            </div>
                            <button
                                onClick={goToNextLesson}
                                disabled={currentIndex === lessons.length - 1}
                                className="flex items-center gap-2 text-sm font-bold text-blue-600 transition-opacity hover:text-blue-700 disabled:opacity-30"
                            >
                                Siguiente <ArrowRight className="h-4 w-4" />
                            </button>
                        </div>

                        {/* Content Info Card */}
                        <div className="border-b border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900/50 md:rounded-2xl md:border md:p-8">
                            <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                                <div>
                                    <Link href={`/courses/${slug}`} className="mb-2 flex items-center gap-1 text-xs font-medium text-blue-600 hover:underline">
                                        <Layout className="h-3 w-3" /> Panel del Curso
                                    </Link>
                                    <h1 className="text-xl font-bold text-zinc-900 md:text-2xl dark:text-zinc-50">
                                        {activeLesson?.title?.rendered}
                                    </h1>
                                </div>
                                <div className="flex flex-wrap gap-2">
                                    {activeLesson?.acf?.archivo_descargable && (
                                        <a
                                            href={typeof activeLesson.acf.archivo_descargable === 'object' ? activeLesson.acf.archivo_descargable.url : activeLesson.acf.archivo_descargable}
                                            download
                                            className="flex flex-1 items-center justify-center gap-2 rounded-full bg-green-600 px-4 py-2 text-xs font-bold text-white transition-all hover:bg-green-700 sm:flex-none"
                                        >
                                            <Download className="h-4 w-4" /> Material
                                        </a>
                                    )}
                                </div>
                            </div>

                            <div className="scrollbar-hide -mx-4 overflow-x-auto border-b border-zinc-200 px-4 dark:border-zinc-800 md:mx-0 md:px-0">
                                <nav className="flex min-w-max gap-6 md:gap-8">
                                    {['contenido', 'recursos', 'comunidad'].map((tab) => (
                                        <button
                                            key={tab}
                                            onClick={() => setActiveTab(tab as any)}
                                            className={`relative pb-4 text-sm font-bold capitalize transition-all ${activeTab === tab ? 'text-blue-600' : 'text-zinc-500 hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-200'}`}
                                        >
                                            {tab}
                                            {activeTab === tab && <span className="absolute -bottom-[2px] left-0 h-[2px] w-full bg-blue-600 shadow-[0_0_8px_rgba(37,99,235,0.5)]" />}
                                        </button>
                                    ))}
                                </nav>
                            </div>

                            <div className="mt-8 prose prose-sm prose-zinc dark:prose-invert max-w-none md:prose-base break-words overflow-hidden">
                                {activeTab === 'contenido' && (
                                    <div dangerouslySetInnerHTML={{ __html: activeLesson?.content?.rendered || activeLesson?.acf?.contenido || "Sin descripción." }} />
                                )}

                                {activeTab === 'recursos' && (
                                    <div className="space-y-6 not-prose">
                                        {activeLesson?.acf?.instrucciones_tarea && (
                                            <div className="rounded-xl border border-blue-100 bg-blue-50/50 p-6 dark:border-blue-900/30 dark:bg-blue-900/10">
                                                <h3 className="mb-3 flex items-center gap-2 font-bold text-blue-900 dark:text-blue-400">
                                                    <CheckSquare className="h-5 w-5" /> Instrucciones de la Tarea
                                                </h3>
                                                <div className="prose prose-sm dark:prose-invert" dangerouslySetInnerHTML={{ __html: activeLesson.acf.instrucciones_tarea }} />
                                            </div>
                                        )}
                                        {/* ... (recursos links) ... */}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Sidebar: Accordion Content */}
                    <div className="order-last space-y-6 p-4 md:order-none md:p-0">
                        <div className="rounded-2xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900/50">
                            <div className="mb-6">
                                <div className="flex items-center justify-between mb-2">
                                    <h2 className="text-lg font-bold text-zinc-900 dark:text-zinc-50">Contenido</h2>
                                    <span className="text-xs font-bold text-blue-600">{progress}%</span>
                                </div>
                                <div className="h-1.5 w-full overflow-hidden rounded-full bg-zinc-100 dark:bg-zinc-800">
                                    <div className="h-full bg-blue-600 transition-all duration-500" style={{ width: `${progress}%` }} />
                                </div>
                            </div>

                            <div className="space-y-2">
                                {Object.keys(groupedLessons).map((moduleName, i) => {
                                    const isExpanded = expandedModules.includes(moduleName);
                                    return (
                                        <div key={i} className="overflow-hidden rounded-xl border border-zinc-100 dark:border-zinc-800">
                                            <button
                                                onClick={() => toggleModule(moduleName)}
                                                className={`flex w-full items-center justify-between p-4 text-left transition-colors ${isExpanded ? 'bg-zinc-50 dark:bg-zinc-800/50' : 'hover:bg-zinc-50 dark:hover:bg-zinc-800/30'}`}
                                            >
                                                <span className="text-xs font-black text-zinc-500 dark:text-zinc-400 uppercase tracking-tighter">
                                                    {moduleName}
                                                </span>
                                                {isExpanded ? <ChevronDown className="h-4 w-4 text-zinc-400" /> : <ChevronRight className="h-4 w-4 text-zinc-400" />}
                                            </button>

                                            {isExpanded && (
                                                <div className="space-y-1 bg-white p-2 dark:bg-transparent">
                                                    {groupedLessons[moduleName].map((lesson: any, j: number) => (
                                                        <button
                                                            key={j}
                                                            onClick={() => setActiveLesson(lesson)}
                                                            className={`group flex w-full items-center gap-3 rounded-lg p-3 text-left transition-all ${activeLesson?.id === lesson.id
                                                                    ? 'bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400'
                                                                    : 'hover:bg-zinc-50 dark:hover:bg-zinc-800'
                                                                }`}
                                                        >
                                                            <div className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-md ${activeLesson?.id === lesson.id
                                                                    ? 'bg-blue-100 dark:bg-blue-900/40'
                                                                    : 'bg-zinc-100 dark:bg-zinc-800'
                                                                }`}>
                                                                {lesson.acf?.tipo === 'tarea' ? <CheckSquare className="h-3.5 w-3.5" /> : <PlayCircle className="h-3.5 w-3.5" />}
                                                            </div>
                                                            <div className="flex-1 overflow-hidden">
                                                                <p className="truncate text-sm font-semibold leading-tight">{lesson.title.rendered}</p>
                                                                <p className="mt-0.5 text-[10px] opacity-50">{lesson.acf?.duracion || "00:00"}</p>
                                                            </div>
                                                        </button>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
