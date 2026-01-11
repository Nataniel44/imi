"use client";

import { useSession } from 'next-auth/react';
import { useState, useEffect } from 'react';
import { Loader2, AlertTriangle, CheckCircle } from 'lucide-react';

export default function TestCheckoutPage() {
    const { data: session } = useSession();
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState<any>(null);
    const [credentialsCheck, setCredentialsCheck] = useState<any>(null);
    const [checkingCredentials, setCheckingCredentials] = useState(true);

    const [formData, setFormData] = useState({
        courseId: 'curso-ejemplo',
        title: 'Curso de Prueba',
        price: '1000',
    });

    // Check MP credentials on mount
    useEffect(() => {
        const checkCredentials = async () => {
            try {
                const res = await fetch('/api/check-mp-credentials');
                const data = await res.json();
                setCredentialsCheck(data);
            } catch (error) {
                console.error("Error checking credentials:", error);
            } finally {
                setCheckingCredentials(false);
            }
        };
        checkCredentials();
    }, []);


    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!session?.user?.email) {
            alert("Debes iniciar sesión primero");
            return;
        }

        setLoading(true);
        setResult(null);

        try {
            console.log("Enviando datos:", {
                ...formData,
                userEmail: session.user.email
            });

            const res = await fetch('/api/checkout', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    id: formData.courseId,
                    title: formData.title,
                    price: formData.price,
                    userEmail: session.user.email,
                }),
            });

            const data = await res.json();
            console.log("Respuesta:", data);

            setResult(data);

            if (data.url) {
                // En modo prueba, mostrar el link en lugar de redirigir automáticamente
                console.log("URL de Mercado Pago:", data.url);
            }
        } catch (error) {
            console.error("Error:", error);
            setResult({ error: String(error) });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4">
            <div className="max-w-2xl mx-auto">
                <div className="bg-white rounded-2xl shadow-xl p-8">
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">
                        🧪 Prueba de Checkout
                    </h1>
                    <p className="text-gray-600 mb-8">
                        Simula una compra para probar el flujo de Mercado Pago
                    </p>

                    {/* Credentials Check */}
                    {checkingCredentials ? (
                        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-6 flex items-center">
                            <Loader2 className="h-5 w-5 animate-spin text-gray-600 mr-3" />
                            <p className="text-gray-700">Verificando credenciales de Mercado Pago...</p>
                        </div>
                    ) : credentialsCheck && (
                        <div className={`border rounded-lg p-4 mb-6 ${credentialsCheck.isTest
                                ? 'bg-green-50 border-green-200'
                                : credentialsCheck.isProduction
                                    ? 'bg-red-50 border-red-200'
                                    : 'bg-yellow-50 border-yellow-200'
                            }`}>
                            <div className="flex items-start">
                                {credentialsCheck.isTest ? (
                                    <CheckCircle className="h-5 w-5 text-green-600 mr-3 mt-0.5 flex-shrink-0" />
                                ) : (
                                    <AlertTriangle className="h-5 w-5 text-red-600 mr-3 mt-0.5 flex-shrink-0" />
                                )}
                                <div className="flex-1">
                                    <p className={`font-semibold ${credentialsCheck.isTest ? 'text-green-900' : 'text-red-900'
                                        }`}>
                                        {credentialsCheck.recommendation}
                                    </p>
                                    <div className="mt-2 text-sm">
                                        <p className={credentialsCheck.isTest ? 'text-green-800' : 'text-red-800'}>
                                            <strong>Tipo:</strong> {credentialsCheck.tokenType}
                                        </p>
                                        <p className={credentialsCheck.isTest ? 'text-green-800' : 'text-red-800'}>
                                            <strong>Prefijo:</strong> <code>{credentialsCheck.tokenPrefix}</code>
                                        </p>
                                    </div>
                                    {!credentialsCheck.isTest && credentialsCheck.nextSteps && (
                                        <div className="mt-3 bg-white rounded p-3 border border-red-300">
                                            <p className="text-red-900 font-medium text-sm mb-2">📋 Pasos para corregir:</p>
                                            <ol className="list-decimal list-inside text-red-800 text-sm space-y-1">
                                                {credentialsCheck.nextSteps.map((step: string, i: number) => (
                                                    <li key={i}>{step}</li>
                                                ))}
                                            </ol>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}

                    {!session ? (
                        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
                            <p className="text-yellow-800">
                                ⚠️ Debes iniciar sesión para probar el checkout
                            </p>
                        </div>
                    ) : (
                        <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
                            <p className="text-green-800">
                                ✅ Sesión activa: <strong>{session.user?.email}</strong>
                            </p>
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                ID del Curso (slug)
                            </label>
                            <input
                                type="text"
                                value={formData.courseId}
                                onChange={(e) => setFormData({ ...formData, courseId: e.target.value })}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                placeholder="curso-ejemplo"
                                required
                            />
                            <p className="text-sm text-gray-500 mt-1">
                                Este es el slug del curso que se asignará al usuario
                            </p>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Título del Curso
                            </label>
                            <input
                                type="text"
                                value={formData.title}
                                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                placeholder="Curso de Prueba"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Precio (ARS)
                            </label>
                            <input
                                type="text"
                                value={formData.price}
                                onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                placeholder="1000"
                                required
                            />
                            <p className="text-sm text-gray-500 mt-1">
                                Precio en pesos argentinos (sin símbolos)
                            </p>
                        </div>

                        <button
                            type="submit"
                            disabled={loading || !session}
                            className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
                        >
                            {loading ? (
                                <>
                                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                                    Creando preferencia...
                                </>
                            ) : (
                                'Crear Preferencia de Pago'
                            )}
                        </button>
                    </form>

                    {result && (
                        <div className="mt-8 p-6 bg-gray-50 rounded-lg border border-gray-200">
                            <h2 className="text-lg font-semibold text-gray-900 mb-4">
                                📋 Resultado
                            </h2>

                            {result.error ? (
                                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                                    <p className="text-red-800 font-medium">❌ Error</p>
                                    <p className="text-red-700 mt-2">{result.error}</p>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                                        <p className="text-green-800 font-medium">✅ Preferencia creada exitosamente</p>
                                    </div>

                                    {result.preferenceId && (
                                        <div>
                                            <p className="text-sm font-medium text-gray-700">Preference ID:</p>
                                            <code className="block mt-1 p-2 bg-white border border-gray-300 rounded text-sm">
                                                {result.preferenceId}
                                            </code>
                                        </div>
                                    )}

                                    {result.url && (
                                        <div>
                                            <p className="text-sm font-medium text-gray-700 mb-2">URL de Pago:</p>
                                            <a
                                                href={result.url}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="block p-4 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100 transition-colors"
                                            >
                                                <p className="text-blue-900 font-medium mb-1">
                                                    🔗 Abrir en Mercado Pago
                                                </p>
                                                <p className="text-blue-700 text-sm break-all">
                                                    {result.url}
                                                </p>
                                            </a>
                                        </div>
                                    )}

                                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                                        <p className="text-yellow-800 text-sm">
                                            <strong>💡 Instrucciones:</strong>
                                        </p>
                                        <ol className="list-decimal list-inside text-yellow-800 text-sm mt-2 space-y-1">
                                            <li>Haz clic en el link de arriba para ir a Mercado Pago</li>
                                            <li>Usa las credenciales de prueba de Mercado Pago</li>
                                            <li>Completa el pago</li>
                                            <li>Revisa los logs del servidor para ver el webhook</li>
                                            <li>Verifica en WordPress que el curso se asignó al usuario</li>
                                        </ol>
                                    </div>
                                </div>
                            )}

                            <details className="mt-4">
                                <summary className="cursor-pointer text-sm font-medium text-gray-700 hover:text-gray-900">
                                    Ver respuesta completa (JSON)
                                </summary>
                                <pre className="mt-2 p-4 bg-white border border-gray-300 rounded text-xs overflow-auto">
                                    {JSON.stringify(result, null, 2)}
                                </pre>
                            </details>
                        </div>
                    )}

                    <div className="mt-8 p-6 bg-blue-50 border border-blue-200 rounded-lg">
                        <h3 className="font-semibold text-blue-900 mb-2">
                            📚 Credenciales de Prueba de Mercado Pago
                        </h3>
                        <div className="text-sm text-blue-800 space-y-2">
                            <div>
                                <strong>Tarjeta de prueba aprobada:</strong>
                                <ul className="list-disc list-inside ml-4 mt-1">
                                    <li>Número: 5031 7557 3453 0604</li>
                                    <li>CVV: cualquier 3 dígitos</li>
                                    <li>Vencimiento: cualquier fecha futura</li>
                                    <li>Nombre: APRO (para aprobar)</li>
                                </ul>
                            </div>
                            <div className="mt-3">
                                <strong>Otros nombres de prueba:</strong>
                                <ul className="list-disc list-inside ml-4 mt-1">
                                    <li>APRO: Pago aprobado</li>
                                    <li>CONT: Pago pendiente</li>
                                    <li>OTHE: Rechazado por error general</li>
                                    <li>CALL: Rechazado con validación para autorizar</li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
