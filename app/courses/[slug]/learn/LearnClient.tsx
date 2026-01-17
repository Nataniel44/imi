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
    Layout,
    Reply,
    X
} from 'lucide-react';
import Link from "next/link";
import Image from "next/image";
import { useState, useMemo, useEffect } from "react";
import { getComments, createComment, fixWordPressUrls } from "@/lib/wordpress";
import { useSession } from "next-auth/react";
import { MessageSquare, Send, User as UserIcon } from 'lucide-react';
import dynamic from "next/dynamic";
import confetti from 'canvas-confetti';
import { Menu, CheckCircle2 } from 'lucide-react';

// Importación dinámica de ReactPlayer para evitar errores de SSR
const ReactPlayer = dynamic(() => import("react-player"), { ssr: false }) as any;

interface LearnClientProps {
    course: any;
    lessons: any[];
    slug: string;
}

export default function LearnClient({ course, lessons, slug }: LearnClientProps) {
    // Estados
    const [activeLesson, setActiveLesson] = useState<any>(lessons.length > 0 ? lessons[0] : null);
    const [activeTab, setActiveTab] = useState<'contenido' | 'recursos' | 'comunidad'>('contenido');
    const [expandedModules, setExpandedModules] = useState<string[]>(
        lessons.length > 0 ? [lessons[0].acf?.modulo || "General"] : []
    );
    const [comments, setComments] = useState<any[]>([]);
    const [isFetchingComments, setIsFetchingComments] = useState(false);
    const [newComment, setNewComment] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [replyingTo, setReplyingTo] = useState<any>(null);
    const [completedLessons, setCompletedLessons] = useState<number[]>([]);
    const [showMobileMenu, setShowMobileMenu] = useState(false);
    const { data: session } = useSession();

    // Cargar progreso
    useEffect(() => {
        if (session?.user?.email) {
            const saved = localStorage.getItem(`progress_${slug}_${session.user.email}`);
            if (saved) {
                try {
                    setCompletedLessons(JSON.parse(saved));
                } catch (e) {
                    console.error("Error parsing progress", e);
                }
            }
        }
    }, [slug, session]);

    // Guardar progreso
    useEffect(() => {
        if (session?.user?.email) {
            localStorage.setItem(`progress_${slug}_${session.user.email}`, JSON.stringify(completedLessons));
        }
    }, [completedLessons, slug, session]);

    const toggleCompletion = (lessonId: number) => {
        setCompletedLessons(prev => {
            const isCompleted = prev.includes(lessonId);
            const newProgress = isCompleted
                ? prev.filter(id => id !== lessonId)
                : [...prev, lessonId];

            if (!isCompleted && newProgress.length === lessons.length) {
                confetti({
                    particleCount: 150,
                    spread: 70,
                    origin: { y: 0.6 },
                    colors: ['#2563eb', '#3b82f6', '#60a5fa', '#ffffff']
                });
            }
            return newProgress;
        });
    };

    // Helper para organizar comentarios jerárquicamente
    const nestedComments = useMemo(() => {
        const map = new Map();
        comments.forEach(c => map.set(c.id, { ...c, children: [] }));
        const roots: any[] = [];
        comments.forEach(c => {
            if (c.parent && map.has(c.parent)) {
                map.get(c.parent).children.push(map.get(c.id));
            } else {
                roots.push(map.get(c.id));
            }
        });
        return roots;
    }, [comments]);

    // Fetch comments when active lesson changes or community tab is selected
    useEffect(() => {
        if (activeLesson && activeTab === 'comunidad') {
            fetchComments();
        }
    }, [activeLesson, activeTab]);

    const fetchComments = async () => {
        if (!activeLesson) return;
        setIsFetchingComments(true);
        try {
            const data = await getComments(activeLesson.id);
            setComments(data);
        } catch (error) {
            console.error("Error fetching comments:", error);
        } finally {
            setIsFetchingComments(false);
        }
    };

    const handlePostComment = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newComment.trim() || !activeLesson || isSubmitting) return;

        setIsSubmitting(true);
        try {
            await createComment(
                activeLesson.id,
                newComment,
                (session as any)?.accessToken,
                replyingTo?.id
            );
            setNewComment("");
            setReplyingTo(null);
            await fetchComments(); // Refresh comments
        } catch (error: any) {
            alert(error.message || "Error al publicar el comentario");
        } finally {
            setIsSubmitting(false);
        }
    };

    // Agrupación de lecciones memoizada
    const groupedLessons = useMemo(() => {
        return lessons.reduce((acc: Record<string, any[]>, lesson) => {
            const moduleName = lesson.acf?.modulo || "General";
            if (!acc[moduleName]) acc[moduleName] = [];
            acc[moduleName].push(lesson);
            return acc;
        }, {});
    }, [lessons]);

    // Lógica de navegación
    // Lógica de navegación
    const currentIndex = lessons.findIndex(l => l.id === activeLesson?.id);
    const progress = lessons.length > 0 ? Math.round((completedLessons.length / lessons.length) * 100) : 0;

    const handleNavigation = (direction: 'next' | 'prev') => {
        const newIndex = direction === 'next' ? currentIndex + 1 : currentIndex - 1;
        if (newIndex >= 0 && newIndex < lessons.length) {
            const target = lessons[newIndex];
            setActiveLesson(target);
            const targetModule = target.acf?.modulo || "General";
            if (!expandedModules.includes(targetModule)) {
                setExpandedModules(prev => [...prev, targetModule]);
            }
        }
    };

    // Normalización de tipo de lección
    const lessonType = useMemo(() => {
        const raw = activeLesson?.acf?.tipo;
        if (typeof raw === 'object' && raw !== null) return (raw.value || "").toLowerCase();
        return (raw || "").toString().toLowerCase();
    }, [activeLesson]);

    return (
        <div className="min-h-screen bg-zinc-50 dark:bg-black">
            <Navbar />

            <main className="mx-auto max-w-[1200px] px-0 py-0 md:px-4 md:py-8 lg:px-8">
                <div className="grid gap-0 md:gap-8 lg:grid-cols-[1fr_400px]">

                    {/* Área Principal */}
                    <div className="flex flex-col space-y-0 md:space-y-6">

                        {/* Reproductor de Video */}
                        <div className="relative aspect-video w-full overflow-hidden bg-black md:rounded-2xl md:shadow-2xl">
                            {lessonType === 'video' && activeLesson?.acf?.url_video ? (
                                <ReactPlayer
                                    src={fixWordPressUrls(activeLesson.acf.url_video)}
                                    width="100%"
                                    height="100%"
                                    controls
                                    playing={false}
                                    onEnded={() => !completedLessons.includes(activeLesson.id) && toggleCompletion(activeLesson.id)}
                                />
                            ) : (
                                <div className="absolute inset-0 flex flex-col items-center justify-center bg-gradient-to-br from-zinc-800 to-zinc-950 text-white px-4 text-center">
                                    <div className="mb-6 rounded-full bg-white/5 p-8 backdrop-blur-xl border border-white/10">
                                        {lessonType === 'tarea' ? <CheckSquare className="h-16 w-16 text-blue-400" /> : <FileText className="h-16 w-16 text-zinc-400" />}
                                    </div>
                                    <h2 className="text-2xl font-bold md:text-3xl">{activeLesson?.title?.rendered}</h2>
                                    <p className="mt-2 text-zinc-400 max-w-md">
                                        {lessonType === 'tarea' ? "Esta es una tarea práctica. Revisa las instrucciones abajo." : "Esta lección no tiene un video configurado."}
                                    </p>
                                </div>
                            )}
                        </div>

                        {/* Navegación y Controles */}
                        <div className="flex flex-col gap-4 bg-white p-4 dark:bg-zinc-900/50 md:rounded-xl md:border md:border-zinc-200 dark:md:border-zinc-800">
                            <div className="flex items-center justify-between">
                                <button
                                    onClick={() => handleNavigation('prev')}
                                    disabled={currentIndex <= 0}
                                    className="flex items-center gap-2 text-sm font-bold text-zinc-600 transition-all hover:text-blue-600 disabled:opacity-30 dark:text-zinc-400"
                                >
                                    <ArrowLeft className="h-4 w-4" /> <span className="hidden sm:inline">Anterior</span>
                                </button>

                                <button
                                    onClick={() => activeLesson && toggleCompletion(activeLesson.id)}
                                    className={`flex items-center gap-2 rounded-full px-6 py-2 text-sm font-bold transition-all ${activeLesson && completedLessons.includes(activeLesson.id)
                                        ? 'bg-green-100 text-green-700 hover:bg-green-200 dark:bg-green-900/30 dark:text-green-400'
                                        : 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-300'
                                        }`}
                                >
                                    {activeLesson && completedLessons.includes(activeLesson.id) ? (
                                        <>
                                            <CheckCircle2 className="h-4 w-4" /> Completada
                                        </>
                                    ) : (
                                        <>
                                            <div className="h-4 w-4 rounded-full border-2 border-current" /> Marcar como vista
                                        </>
                                    )}
                                </button>

                                <button
                                    onClick={() => handleNavigation('next')}
                                    disabled={currentIndex >= lessons.length - 1}
                                    className="flex items-center gap-2 text-sm font-bold text-blue-600 transition-all hover:text-blue-700 disabled:opacity-30"
                                >
                                    <span className="hidden sm:inline">Siguiente</span> <ArrowRight className="h-4 w-4" />
                                </button>
                            </div>
                        </div>

                        {/* Información */}
                        <div className="border-b border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900/50 md:rounded-2xl md:border md:p-8">
                            <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                                <div>
                                    <Link href={`/courses/${slug}`} className="mb-2 flex items-center gap-1 text-xs font-medium text-blue-600 hover:underline">
                                        <Layout className="h-3 w-3" /> Volver al Panel
                                    </Link>
                                    <h1 className="text-xl font-bold text-zinc-900 md:text-2xl dark:text-zinc-50">
                                        {activeLesson?.title?.rendered}
                                    </h1>
                                </div>
                                {activeLesson?.acf?.archivo_descargable && (
                                    <a
                                        href={fixWordPressUrls(typeof activeLesson.acf.archivo_descargable === 'object' ? activeLesson.acf.archivo_descargable.url : activeLesson.acf.archivo_descargable)}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex items-center justify-center gap-2 rounded-full bg-green-600 px-6 py-2 text-xs font-bold text-white transition-all hover:bg-green-700"
                                    >
                                        <Download className="h-4 w-4" /> Descargar Material
                                    </a>
                                )}
                            </div>

                            {/* Pestañas */}
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

                            {/* Contenido */}
                            <div className="mt-8 prose prose-sm prose-zinc dark:prose-invert max-w-none md:prose-base">
                                {activeTab === 'contenido' && (
                                    <div dangerouslySetInnerHTML={{ __html: fixWordPressUrls(activeLesson?.content?.rendered || activeLesson?.acf?.contenido || "Sin descripción.") }} />
                                )}
                                {activeTab === 'recursos' && (
                                    <div className="space-y-6 not-prose">
                                        {activeLesson?.acf?.instrucciones_tarea && (
                                            <div className="rounded-xl border border-blue-100 bg-blue-50/50 p-6 dark:border-blue-900/30 dark:bg-blue-900/10">
                                                <h3 className="mb-3 flex items-center gap-2 font-bold text-blue-900 dark:text-blue-400">
                                                    <CheckSquare className="h-5 w-5" /> Instrucciones
                                                </h3>
                                                <div className="prose prose-sm dark:prose-invert" dangerouslySetInnerHTML={{ __html: fixWordPressUrls(activeLesson.acf.instrucciones_tarea) }} />
                                            </div>
                                        )}
                                        {activeLesson?.acf?.link_recurso_extra && (
                                            <a href={fixWordPressUrls(activeLesson.acf.link_recurso_extra)} target="_blank" rel="noopener noreferrer" className="flex items-center justify-between rounded-xl border border-zinc-200 p-4 hover:bg-zinc-50 dark:border-zinc-800 dark:hover:bg-zinc-800/50">
                                                <div className="flex items-center gap-3">
                                                    <ExternalLink className="h-5 w-5 text-blue-600" />
                                                    <span className="text-sm font-bold">Recurso Adicional</span>
                                                </div>
                                                <ChevronRight className="h-4 w-4 text-zinc-400" />
                                            </a>
                                        )}
                                    </div>
                                )}
                                {activeTab === 'comunidad' && (
                                    <div className="space-y-8 not-prose">
                                        {/* Formulario de Comentario */}
                                        <div id="comment-form" className="rounded-2xl border border-zinc-200 bg-zinc-50/50 p-6 dark:border-zinc-800 dark:bg-zinc-900/30">
                                            <div className="mb-4 flex items-center justify-between">
                                                <h3 className="flex items-center gap-2 text-lg font-bold text-zinc-900 dark:text-zinc-50">
                                                    <MessageSquare className="h-5 w-5 text-blue-600" />
                                                    {replyingTo ? `Respondiendo a ${replyingTo.author_name}` : "Comunidad de la clase"}
                                                </h3>
                                                {replyingTo && (
                                                    <button
                                                        onClick={() => setReplyingTo(null)}
                                                        className="flex items-center gap-1 text-xs font-bold text-zinc-500 hover:text-red-500"
                                                    >
                                                        <X className="h-3 w-3" /> Cancelar
                                                    </button>
                                                )}
                                            </div>
                                            {session ? (
                                                <form onSubmit={handlePostComment} className="space-y-4">
                                                    <textarea
                                                        value={newComment}
                                                        onChange={(e) => setNewComment(e.target.value)}
                                                        placeholder={replyingTo ? "Escribe tu respuesta..." : "Escribe tu duda o comentario aquí..."}
                                                        className="w-full min-h-[100px] rounded-xl border border-zinc-200 bg-white p-4 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
                                                        required
                                                    />
                                                    <div className="flex justify-end">
                                                        <button
                                                            type="submit"
                                                            disabled={isSubmitting || !newComment.trim()}
                                                            className="flex items-center gap-2 rounded-full bg-blue-600 px-6 py-2.5 text-sm font-bold text-white transition-all hover:bg-blue-700 disabled:opacity-50"
                                                        >
                                                            {isSubmitting ? "Publicando..." : (
                                                                <>
                                                                    <Send className="h-4 w-4" /> {replyingTo ? "Responder" : "Publicar Comentario"}
                                                                </>
                                                            )}
                                                        </button>
                                                    </div>
                                                </form>
                                            ) : (
                                                <div className="rounded-xl border border-amber-100 bg-amber-50 p-4 text-center dark:border-amber-900/30 dark:bg-amber-900/10">
                                                    <p className="text-sm text-amber-800 dark:text-amber-400">
                                                        Debes <Link href="/login" className="font-bold underline">iniciar sesión</Link> para participar en la comunidad.
                                                    </p>
                                                </div>
                                            )}
                                        </div>

                                        {/* Lista de Comentarios */}
                                        <div className="space-y-6">
                                            {isFetchingComments ? (
                                                <div className="flex flex-col items-center justify-center py-12 text-zinc-400">
                                                    <div className="h-8 w-8 animate-spin rounded-full border-2 border-blue-600 border-t-transparent" />
                                                    <p className="mt-4 text-sm font-medium">Cargando comentarios...</p>
                                                </div>
                                            ) : nestedComments.length > 0 ? (
                                                <div className="space-y-8">
                                                    {nestedComments.map((comment: any) => (
                                                        <CommentItem
                                                            key={comment.id}
                                                            comment={comment}
                                                            onReply={(c: any) => {
                                                                setReplyingTo(c);
                                                                document.getElementById('comment-form')?.scrollIntoView({ behavior: 'smooth' });
                                                            }}
                                                        />
                                                    ))}
                                                </div>
                                            ) : (
                                                <div className="flex flex-col items-center justify-center py-12 text-center">
                                                    <div className="mb-4 rounded-full bg-zinc-100 p-4 dark:bg-zinc-800">
                                                        <MessageSquare className="h-8 w-8 text-zinc-400" />
                                                    </div>
                                                    <h4 className="font-bold text-zinc-900 dark:text-zinc-50">Aún no hay comentarios</h4>
                                                    <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">¡Sé el primero en preguntar algo sobre esta clase!</p>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Barra Lateral Desktop */}
                    <div className="hidden md:block space-y-6">
                        <SidebarContent
                            progress={progress}
                            groupedLessons={groupedLessons}
                            expandedModules={expandedModules}
                            setExpandedModules={setExpandedModules}
                            activeLesson={activeLesson}
                            setActiveLesson={setActiveLesson}
                            completedLessons={completedLessons}
                        />
                    </div>

                    {/* Botón Flotante Menú Móvil */}
                    <button
                        onClick={() => setShowMobileMenu(true)}
                        className="fixed bottom-6 right-6 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-blue-600 text-white shadow-lg shadow-blue-600/30 transition-transform hover:scale-105 active:scale-95 md:hidden"
                    >
                        <Menu className="h-6 w-6" />
                    </button>

                    {/* Menú Móvil Overlay */}
                    {showMobileMenu && (
                        <div className="fixed inset-0 z-50 flex justify-end bg-black/50 backdrop-blur-sm md:hidden" onClick={() => setShowMobileMenu(false)}>
                            <div
                                className="h-full w-[85%] max-w-[320px] bg-white p-4 shadow-2xl dark:bg-zinc-900"
                                onClick={e => e.stopPropagation()}
                            >
                                <div className="mb-4 flex items-center justify-between">
                                    <h2 className="text-lg font-bold text-zinc-900 dark:text-zinc-50">Contenido del Curso</h2>
                                    <button onClick={() => setShowMobileMenu(false)} className="p-2 text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100">
                                        <X className="h-5 w-5" />
                                    </button>
                                </div>
                                <div className="h-[calc(100vh-80px)] overflow-y-auto">
                                    <SidebarContent
                                        progress={progress}
                                        groupedLessons={groupedLessons}
                                        expandedModules={expandedModules}
                                        setExpandedModules={setExpandedModules}
                                        activeLesson={activeLesson}
                                        setActiveLesson={(l) => {
                                            setActiveLesson(l);
                                            setShowMobileMenu(false);
                                        }}
                                        completedLessons={completedLessons}
                                    />
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
}



function SidebarContent({ progress, groupedLessons, expandedModules, setExpandedModules, activeLesson, setActiveLesson, completedLessons }: any) {
    return (
        <div className="rounded-2xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900/50">
            <div className="mb-6">
                <div className="flex items-center justify-between mb-2">
                    <h2 className="text-lg font-bold text-zinc-900 dark:text-zinc-50">Contenido</h2>
                    <span className="text-xs font-bold text-blue-600">{progress}%</span>
                </div>
                <div className="h-1.5 w-full overflow-hidden rounded-full bg-zinc-100 dark:bg-zinc-800">
                    <div className="h-full bg-blue-600 transition-all duration-500 ease-out" style={{ width: `${progress}%` }} />
                </div>
            </div>

            <div className="space-y-2">
                {Object.keys(groupedLessons).map((moduleName, i) => {
                    const isExpanded = expandedModules.includes(moduleName);
                    return (
                        <div key={i} className="overflow-hidden rounded-xl border border-zinc-100 dark:border-zinc-800">
                            <button
                                onClick={() => setExpandedModules((prev: string[]) => prev.includes(moduleName) ? prev.filter(m => m !== moduleName) : [...prev, moduleName])}
                                className={`flex w-full items-center justify-between p-4 text-left transition-colors ${isExpanded ? 'bg-zinc-50 dark:bg-zinc-800/50' : 'hover:bg-zinc-50 dark:hover:bg-zinc-800/30'}`}
                            >
                                <span className="text-xs font-black text-zinc-500 dark:text-zinc-400 uppercase tracking-tighter">{moduleName}</span>
                                {isExpanded ? <ChevronDown className="h-4 w-4 text-zinc-400" /> : <ChevronRight className="h-4 w-4 text-zinc-400" />}
                            </button>

                            {isExpanded && (
                                <div className="space-y-1 bg-white p-2 dark:bg-transparent">
                                    {groupedLessons[moduleName].map((lesson: any, j: number) => {
                                        const lType = (typeof lesson.acf?.tipo === 'object') ? (lesson.acf?.tipo?.value || "").toLowerCase() : (lesson.acf?.tipo || "").toLowerCase();
                                        const isActive = activeLesson?.id === lesson.id;
                                        const isCompleted = completedLessons.includes(lesson.id);

                                        return (
                                            <button
                                                key={j}
                                                onClick={() => setActiveLesson(lesson)}
                                                className={`group flex w-full items-center gap-3 rounded-lg p-3 text-left transition-all ${isActive ? 'bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400' : 'hover:bg-zinc-50 dark:hover:bg-zinc-800'}`}
                                            >
                                                <div className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-md transition-colors ${isCompleted
                                                    ? 'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400'
                                                    : isActive
                                                        ? 'bg-blue-100 dark:bg-blue-900/40'
                                                        : 'bg-zinc-100 dark:bg-zinc-800'
                                                    }`}>
                                                    {isCompleted ? (
                                                        <CheckCircle2 className="h-4 w-4" />
                                                    ) : lType === 'tarea' ? (
                                                        <CheckSquare className="h-3.5 w-3.5" />
                                                    ) : (
                                                        <PlayCircle className="h-3.5 w-3.5" />
                                                    )}
                                                </div>
                                                <div className="flex-1 overflow-hidden">
                                                    <p className={`truncate text-sm font-semibold leading-tight ${isCompleted ? 'text-zinc-500 line-through decoration-zinc-400/50 dark:text-zinc-500' : ''}`}>
                                                        {lesson.title.rendered}
                                                    </p>
                                                    <p className="mt-0.5 text-[10px] opacity-50">{lesson.acf?.duracion || "00:00"}</p>
                                                </div>
                                            </button>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
}

function CommentItem({ comment, onReply, depth = 0 }: { comment: any, onReply: (c: any) => void, depth?: number }) {
    return (
        <div className={`group space-y-4 ${depth > 0 ? 'ml-6 border-l-2 border-zinc-100 pl-6 dark:border-zinc-800' : ''}`}>
            <div className="flex gap-4">
                <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-full bg-zinc-200 dark:bg-zinc-800">
                    {comment.author_avatar_urls?.['48'] ? (
                        <Image
                            src={fixWordPressUrls(comment.author_avatar_urls['48'])}
                            alt={comment.author_name}
                            fill
                            className="object-cover"
                            unoptimized
                        />
                    ) : (
                        <div className="flex h-full w-full items-center justify-center">
                            <UserIcon className="h-5 w-5 text-zinc-500" />
                        </div>
                    )}
                </div>
                <div className="flex-1 space-y-1">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <span className="text-sm font-bold text-zinc-900 dark:text-zinc-50">
                                {comment.author_name}
                            </span>
                            <span className="text-[10px] font-medium text-zinc-400 uppercase">
                                • {new Date(comment.date).toLocaleDateString()}
                            </span>
                        </div>
                        <button
                            onClick={() => onReply(comment)}
                            className="flex items-center gap-1 text-xs font-bold text-blue-600 opacity-0 transition-opacity hover:underline group-hover:opacity-100"
                        >
                            <Reply className="h-3 w-3" /> Responder
                        </button>
                    </div>
                    <div
                        className="text-sm text-zinc-600 dark:text-zinc-400"
                        dangerouslySetInnerHTML={{ __html: fixWordPressUrls(comment.content.rendered) }}
                    />
                </div>
            </div>

            {comment.children && comment.children.length > 0 && (
                <div className="space-y-6">
                    {comment.children.map((child: any) => (
                        <CommentItem
                            key={child.id}
                            comment={child}
                            onReply={onReply}
                            depth={depth + 1}
                        />
                    ))}
                </div>
            )}
        </div>
    );
}
