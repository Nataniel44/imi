import { NextResponse } from 'next/server';

export async function GET() {
    const mpToken = process.env.MP_ACCESS_TOKEN;

    if (!mpToken) {
        return NextResponse.json({
            error: "MP_ACCESS_TOKEN no está configurado",
            configured: false
        });
    }

    const isTestToken = mpToken.startsWith('TEST-');
    const isProductionToken = mpToken.startsWith('APP_USR-');

    return NextResponse.json({
        configured: true,
        tokenType: isTestToken ? 'TEST (Prueba)' : isProductionToken ? 'PRODUCTION (Producción)' : 'UNKNOWN',
        isTest: isTestToken,
        isProduction: isProductionToken,
        tokenPrefix: mpToken.substring(0, 10) + '...',
        tokenLength: mpToken.length,
        recommendation: isTestToken
            ? '✅ Estás usando credenciales de PRUEBA. Perfecto para testing.'
            : isProductionToken
                ? '⚠️ Estás usando credenciales de PRODUCCIÓN. Los pagos serán REALES. Cambia a credenciales de prueba para testing.'
                : '❌ Token no reconocido. Verifica tus credenciales.',
        nextSteps: isTestToken
            ? [
                'Ya puedes hacer pruebas',
                'Ve a /test-checkout para simular una compra',
                'Usa las tarjetas de prueba de Mercado Pago'
            ]
            : [
                'Ve a https://www.mercadopago.com.ar/developers/panel',
                'Selecciona tu aplicación',
                'Copia el Access Token de PRUEBA (empieza con TEST-)',
                'Actualiza MP_ACCESS_TOKEN en .env.local',
                'Reinicia el servidor'
            ]
    });
}
