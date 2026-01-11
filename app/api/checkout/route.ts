import { NextResponse } from 'next/server';
import { MercadoPagoConfig, Preference } from 'mercadopago';

const mpToken = process.env.MP_ACCESS_TOKEN;
if (!mpToken || mpToken.trim() === "") {
    console.error("MP_ACCESS_TOKEN is missing or empty in environment variables");
}

const client = new MercadoPagoConfig({ accessToken: mpToken || 'dummy_token' });

export async function POST(request: Request) {
    try {
        const body = await request.json();
        console.log("Checkout request body:", body);
        const { id, title, price, userEmail } = body;

        // Validate user email
        if (!userEmail || !userEmail.includes('@')) {
            console.error("Invalid or missing user email:", userEmail);
            return NextResponse.json({ error: "Email de usuario requerido" }, { status: 400 });
        }

        // Parse price: remove non-numeric chars (except dot/comma if needed, but assuming integer for ARS usually)
        // Example: "$ 5000" -> 5000
        const numericPrice = Number(price.toString().replace(/[^0-9.]/g, ''));
        console.log("Parsed price:", numericPrice);

        if (isNaN(numericPrice) || numericPrice <= 0) {
            console.error("Invalid price:", numericPrice);
            return NextResponse.json({ error: "El precio debe ser mayor a 0" }, { status: 400 });
        }

        const preference = new Preference(client);

        const preferenceData = {
            items: [
                {
                    id: id,
                    title: title,
                    quantity: 1,
                    unit_price: numericPrice,
                    currency_id: 'ARS',
                },
            ],
            payer: {
                email: userEmail, // Set the user's email
            },
            external_reference: id, // Course slug to identify the purchase
            notification_url: `${process.env.NEXT_PUBLIC_BASE_URL}/api/webhooks/mercadopago`,
            back_urls: {
                success: `${process.env.NEXT_PUBLIC_BASE_URL}/courses?payment=success`,
                failure: `${process.env.NEXT_PUBLIC_BASE_URL}/courses?payment=failure`,
                pending: `${process.env.NEXT_PUBLIC_BASE_URL}/courses?payment=pending`,
            },
            auto_return: 'approved',
        };

        console.log("Creating preference with data:", JSON.stringify(preferenceData, null, 2));

        const result = await preference.create({
            body: preferenceData
        });

        console.log("Preference created successfully:", result.id);
        return NextResponse.json({ url: result.init_point, preferenceId: result.id });
    } catch (error) {
        console.error("Mercado Pago Error:", error);
        return NextResponse.json({ error: "Error creating preference" }, { status: 500 });
    }
}
