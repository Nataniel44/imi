"use client";

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { Loader2 } from 'lucide-react';

interface BuyButtonProps {
    courseId: string;
    title: string;
    price: string;
}

export function BuyButton({ courseId, title, price }: BuyButtonProps) {
    const [loading, setLoading] = useState(false);
    const { data: session } = useSession();

    const handleBuy = async () => {
        try {
            if (!session?.user?.email) {
                alert("Debes iniciar sesión para comprar un curso.");
                return;
            }

            setLoading(true);
            console.log("Iniciando compra para:", { courseId, title, price, email: session.user.email });

            const res = await fetch('/api/checkout', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    id: courseId,
                    title: title,
                    price: price,
                    userEmail: session.user.email,
                }),
            });

            const data = await res.json();

            if (data.url) {
                console.log("Redirigiendo a Mercado Pago:", data.url);
                window.location.href = data.url;
            } else {
                console.error("No URL returned from checkout API:", data);
                alert(data.error || "Hubo un error al iniciar el pago. Por favor intenta de nuevo.");
            }
        } catch (error) {
            console.error("Checkout error:", error);
            alert("Hubo un error al conectar con el servidor.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <button
            onClick={handleBuy}
            disabled={loading || !session}
            className="mb-4 w-full flex items-center justify-center rounded-full bg-blue-600 py-3 font-bold text-white transition-colors hover:bg-blue-700 disabled:opacity-70 disabled:cursor-not-allowed"
        >
            {loading ? (
                <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Procesando...
                </>
            ) : !session ? (
                "Inicia sesión para comprar"
            ) : (
                "Inscribirse con Mercado Pago"
            )}
        </button>
    );
}
