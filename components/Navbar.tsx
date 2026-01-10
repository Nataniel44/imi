"use client";

import Link from 'next/link';
import { Menu, Search, ShoppingCart, User, LogOut } from 'lucide-react';
import { useSession, signOut } from 'next-auth/react';
import { useState } from 'react';

export function Navbar() {
    const { data: session } = useSession();
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    return (
        <nav className="sticky top-0 z-50 w-full border-b border-zinc-200 bg-white/80 backdrop-blur-md dark:border-zinc-800 dark:bg-black/80">
            <div className="container mx-auto flex h-16 items-center justify-between px-4 md:px-6">
                <Link href="/" className="flex items-center gap-2">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600 text-white font-bold">
                        M
                    </div>
                    <span className="text-lg font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
                        Mundo Informática
                    </span>
                </Link>

                <div className="hidden md:flex items-center gap-6 text-sm font-medium text-zinc-600 dark:text-zinc-400">
                    <Link href="/courses" className="transition-colors hover:text-blue-600 dark:hover:text-blue-400">
                        Cursos
                    </Link>
                    <Link href="/paths" className="transition-colors hover:text-blue-600 dark:hover:text-blue-400">
                        Rutas de Aprendizaje
                    </Link>
                    <Link href="/blog" className="transition-colors hover:text-blue-600 dark:hover:text-blue-400">
                        Blog
                    </Link>
                    <Link href="/about" className="transition-colors hover:text-blue-600 dark:hover:text-blue-400">
                        Nosotros
                    </Link>
                </div>

                <div className="flex items-center gap-4">
                    <button className="rounded-full p-2 text-zinc-600 transition-colors hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-800">
                        <Search className="h-5 w-5" />
                    </button>
                    <button className="rounded-full p-2 text-zinc-600 transition-colors hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-800">
                        <ShoppingCart className="h-5 w-5" />
                    </button>

                    {session ? (
                        <div className="relative group">
                            <button className="flex items-center gap-2 rounded-full bg-zinc-100 px-4 py-2 text-sm font-medium text-zinc-900 transition-colors hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-100 dark:hover:bg-zinc-700">
                                <User className="h-4 w-4" />
                                <span>{session.user?.name || "Usuario"}</span>
                            </button>
                            <div className="absolute right-0 mt-2 w-48 origin-top-right rounded-md bg-white py-1 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none dark:bg-zinc-900 dark:ring-zinc-700 hidden group-hover:block">
                                <button
                                    onClick={() => signOut()}
                                    className="flex w-full items-center px-4 py-2 text-sm text-zinc-700 hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-800"
                                >
                                    <LogOut className="mr-2 h-4 w-4" />
                                    Cerrar Sesión
                                </button>
                            </div>
                        </div>
                    ) : (
                        <Link
                            href="/login"
                            className="hidden rounded-full bg-zinc-900 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-zinc-700 dark:bg-zinc-50 dark:text-zinc-900 dark:hover:bg-zinc-200 md:block"
                        >
                            Ingresar
                        </Link>
                    )}

                    <button className="md:hidden rounded-full p-2 text-zinc-600 transition-colors hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-800">
                        <Menu className="h-5 w-5" />
                    </button>
                </div>
            </div>
        </nav>
    );
}
