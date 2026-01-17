import Image from 'next/image';
import Link from 'next/link';
import { Clock, BookOpen, Star } from 'lucide-react';

interface CourseProps {
    title: string;
    slug: string;
    image: string;
    category: string;
    description?: string;
    lessons: number;
    duration: string;
    rating: number;
    price: string;
}

export function CourseCard({ title, slug, image, category, description, lessons, duration, rating, price }: CourseProps) {
    return (
        <Link
            href={price === "Adquirido" ? `/courses/${slug}/learn` : `/courses/${slug}`}
            className="group flex flex-col overflow-hidden rounded-2xl border border-zinc-200 bg-white transition-all hover:shadow-lg dark:border-zinc-800 dark:bg-zinc-900/50"
        >
            <div className="relative aspect-[16/9] w-full overflow-hidden bg-zinc-100 dark:bg-zinc-800">
                {/* Placeholder for image if not provided or while loading */}
                <div className="absolute inset-0 flex items-center justify-center text-zinc-400">
                    <span className="text-4xl">📚</span>
                </div>
                {image && (
                    <Image
                        src={image}
                        alt={title.replace(/<[^>]+>/g, '') || "Imagen del curso"}
                        fill
                        className="object-cover transition-transform duration-300 group-hover:scale-105"
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    />
                )}
                <div className="absolute left-3 top-3 rounded-md bg-white/90 px-2 py-1 text-xs font-semibold text-blue-600 backdrop-blur-sm dark:bg-black/80 dark:text-blue-400">
                    {category}
                </div>
            </div>

            <div className="flex flex-1 flex-col p-5">
                <h3 className="mb-2 text-lg font-bold text-zinc-900 line-clamp-2 group-hover:text-blue-600 dark:text-zinc-50 dark:group-hover:text-blue-400">
                    {title}
                </h3>

                {description && (
                    <p className="mb-4 text-sm text-zinc-600 line-clamp-3 dark:text-zinc-400">
                        {description}
                    </p>
                )}

                <div className="mb-4 flex items-center gap-4 text-xs text-zinc-500 dark:text-zinc-400">
                    <div className="flex items-center gap-1">
                        <BookOpen className="h-3.5 w-3.5" />
                        <span>{lessons} Lecciones</span>
                    </div>
                    <div className="flex items-center gap-1">
                        <Clock className="h-3.5 w-3.5" />
                        <span>{duration}</span>
                    </div>
                    <div className="flex items-center gap-1 text-yellow-500">
                        <Star className="h-3.5 w-3.5 fill-current" />
                        <span>{rating}</span>
                    </div>
                </div>

                <div className="mt-auto flex items-center justify-between border-t border-zinc-100 pt-4 dark:border-zinc-800">
                    <div className="flex items-center gap-2">
                        <div className="h-8 w-8 rounded-full bg-zinc-200 dark:bg-zinc-700" />
                        <span className="text-xs font-medium text-zinc-600 dark:text-zinc-400">Instructor</span>
                    </div>
                    <span className="text-lg font-bold text-blue-600 dark:text-blue-400">{price}</span>
                </div>
            </div>
        </Link>
    );
}
