import { NextResponse } from 'next/server';
import { MercadoPagoConfig, Preference } from 'mercadopago';

if (!process.env.MP_ACCESS_TOKEN) {
    console.error("MP_ACCESS_TOKEN is missing in environment variables");
}

const client = new MercadoPagoConfig({ accessToken: process.env.MP_ACCESS_TOKEN || '' });

export async function POST(request: Request) {
    try {
        const body = await request.json();
        console.log("Checkout request body:", body);
        const { id, title, price } = body;

        // Parse price: remove non-numeric chars (except dot/comma if needed, but assuming integer for ARS usually)
        // Example: "$ 5000" -> 5000
        const numericPrice = Number(price.toString().replace(/[^0-9.]/g, ''));
        console.log("Parsed price:", numericPrice);

        if (isNaN(numericPrice) || numericPrice <= 0) {
            console.error("Invalid price:", numericPrice);
            return NextResponse.json({ error: "El precio debe ser mayor a 0" }, { status: 400 });
        }

        const preference = new Preference(client);

        const result = await preference.create({
            body: {
                items: [
                    {
                        id: id,
                        title: title,
                        quantity: 1,
                        unit_price: numericPrice,
                        currency_id: 'ARS', // Assuming Argentinian Pesos
                    },
                ],
                back_urls: {
                    success: `${process.env.NEXT_PUBLIC_BASE_URL}/courses`,
                    failure: `${process.env.NEXT_PUBLIC_BASE_URL}/courses`,
                    pending: `${process.env.NEXT_PUBLIC_BASE_URL}/courses`,
                },
                auto_return: 'approved',
            }
        });

        return NextResponse.json({ url: result.init_point });
    } catch (error) {
        console.error("Mercado Pago Error:", error);
        return NextResponse.json({ error: "Error creating preference" }, { status: 500 });
    }
}
