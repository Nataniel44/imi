import { Loader2 } from 'lucide-react';

export default function Loading() {
    return (
        <div className="flex min-h-screen flex-col items-center justify-center bg-white dark:bg-black">
            <Loader2 className="h-10 w-10 animate-spin text-blue-600" />
            <p className="mt-4 text-sm font-medium text-zinc-500">Preparando tu aula virtual...</p>
        </div>
    );
}
