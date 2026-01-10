import { NextResponse } from "next/server";

// Bypass SSL check for self-signed certificates if configured in environment
if (process.env.NODE_TLS_REJECT_UNAUTHORIZED === '0') {
    process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
}

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { username, email, password, name } = body;

        // Validate input
        if (!username || !email || !password || !name) {
            return NextResponse.json(
                { error: "Todos los campos son obligatorios" },
                { status: 400 }
            );
        }

        // Check for admin credentials
        const adminUser = process.env.WP_ADMIN_USER;
        let adminPass = process.env.WP_ADMIN_APP_PASSWORD;

        if (!adminUser || !adminPass) {
            console.error("Missing WP Admin credentials");
            return NextResponse.json(
                { error: "Error de configuración del servidor" },
                { status: 500 }
            );
        }

        // Remove spaces from application password if present
        adminPass = adminPass.replace(/\s/g, '');

        // Create user in WordPress
        const wpRes = await fetch(`${process.env.NEXT_PUBLIC_WORDPRESS_URL}/wp-json/wp/v2/users`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: "Basic " + Buffer.from(`${adminUser}:${adminPass}`).toString("base64"),
            },
            body: JSON.stringify({
                username,
                email,
                password,
                name,
                roles: ["subscriber"], // Default role
            }),
        });

        const wpData = await wpRes.json();

        if (!wpRes.ok) {
            console.error("WP User Creation Error:", wpData);
            return NextResponse.json(
                { error: wpData.message || "Error al crear el usuario en WordPress" },
                { status: wpRes.status }
            );
        }

        return NextResponse.json({ success: true, userId: wpData.id });
    } catch (error) {
        console.error("Registration Error:", error);
        return NextResponse.json(
            { error: "Error interno del servidor" },
            { status: 500 }
        );
    }
}
