import { Navbar } from "@/components/Navbar";

export default function PathsPage() {
    return (
        <div className="min-h-screen bg-zinc-50 dark:bg-black">
            <Navbar />
            <main className="container mx-auto px-4 py-12 md:px-6">
                <h1 className="text-4xl font-bold text-zinc-900 dark:text-zinc-50">Rutas de Aprendizaje</h1>
                <p className="mt-4 text-lg text-zinc-600 dark:text-zinc-400">
                    Encuentra el camino ideal para tu carrera profesional.
                </p>
            </main>
        </div>
    );
}
