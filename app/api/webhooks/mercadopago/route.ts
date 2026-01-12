import { NextResponse } from 'next/server';
import { MercadoPagoConfig, Payment } from 'mercadopago';

// Bypass SSL check for self-signed certificates if configured in environment
if (process.env.NODE_TLS_REJECT_UNAUTHORIZED === '0') {
    process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
}

const mpToken = process.env.MP_ACCESS_TOKEN;
if (!mpToken || mpToken.trim() === "") {
    console.error("MP_ACCESS_TOKEN is missing or empty in environment variables");
}

const client = new MercadoPagoConfig({ accessToken: mpToken || 'dummy_token' });

export async function POST(request: Request) {
    try {
        const body = await request.json();
        console.log("=== WEBHOOK MERCADO PAGO ===");
        console.log("Timestamp:", new Date().toISOString());
        console.log("Webhook body:", JSON.stringify(body, null, 2));

        // Mercado Pago sends different types of notifications
        // We're interested in "payment" notifications
        if (body.type === 'payment') {
            const paymentId = body.data.id;
            console.log("Processing payment ID:", paymentId);

            // Get payment details from Mercado Pago
            const payment = new Payment(client);
            const paymentData = await payment.get({ id: paymentId });

            console.log("Payment data received:");
            console.log("- Status:", paymentData.status);
            console.log("- External Reference (Course Slug):", paymentData.external_reference);
            console.log("- Payer Email:", paymentData.payer?.email);

            // Check if payment was approved
            if (paymentData.status === 'approved') {
                console.log("✅ Payment approved, processing course assignment...");

                const courseSlug = paymentData.external_reference;
                const userEmail = paymentData.payer?.email;

                if (!courseSlug || !userEmail) {
                    console.error("❌ Missing course slug or user email");
                    return NextResponse.json({ error: "Missing data" }, { status: 400 });
                }

                const wpUrl = process.env.NEXT_PUBLIC_WORDPRESS_URL;
                const adminUser = process.env.WP_ADMIN_USER;
                let adminPass = process.env.WP_ADMIN_APP_PASSWORD;

                if (!wpUrl || !adminUser || !adminPass) {
                    console.error("❌ WordPress configuration missing");
                    return NextResponse.json({ error: "Config error" }, { status: 500 });
                }

                adminPass = adminPass.replace(/\s/g, '');
                const authHeader = "Basic " + Buffer.from(`${adminUser}:${adminPass}`).toString("base64");

                // 1. Get Course ID from Slug
                console.log(`🔍 Searching for course ID for slug: ${courseSlug}`);
                const courseRes = await fetch(`${wpUrl}/wp-json/wp/v2/cursos?slug=${courseSlug}`, {
                    headers: { Authorization: authHeader }
                });

                const coursesFound = await courseRes.json();
                if (!coursesFound || coursesFound.length === 0) {
                    console.error(`❌ Course not found with slug: ${courseSlug}`);
                    return NextResponse.json({ error: "Course not found" }, { status: 404 });
                }

                const courseId = coursesFound[0].id;
                console.log(`✅ Found Course ID: ${courseId}`);

                // 2. Find user by email
                console.log(`🔍 Searching for user with email: ${userEmail}`);
                const usersRes = await fetch(`${wpUrl}/wp-json/wp/v2/users?search=${encodeURIComponent(userEmail)}&context=edit`, {
                    headers: { Authorization: authHeader }
                });

                const users = await usersRes.json();
                if (!users || users.length === 0) {
                    console.error(`❌ No user found with email: ${userEmail}`);
                    return NextResponse.json({ error: "User not found" }, { status: 404 });
                }

                const user = users[0];
                const userId = user.id;
                console.log(`✅ Found User ID: ${userId}`);

                // 3. Get current purchased courses and update
                // ACF Relationship fields usually return an array of IDs or Objects
                let currentCourses = user.acf?.purchased_courses || [];

                // Ensure it's an array of IDs (numbers)
                if (!Array.isArray(currentCourses)) {
                    currentCourses = [];
                } else {
                    currentCourses = currentCourses.map((c: any) => {
                        if (typeof c === 'object' && c !== null) return c.ID || c.id;
                        return Number(c);
                    }).filter(id => !isNaN(id));
                }

                console.log("Current course IDs:", currentCourses);

                if (!currentCourses.includes(courseId)) {
                    currentCourses.push(courseId);
                    console.log(`Adding course ${courseId} to user ${userId}...`);

                    const updateRes = await fetch(`${wpUrl}/wp-json/wp/v2/users/${userId}`, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            Authorization: authHeader,
                        },
                        body: JSON.stringify({
                            acf: {
                                purchased_courses: currentCourses
                            }
                        }),
                    });

                    if (updateRes.ok) {
                        console.log(`✅ Course ${courseId} successfully added to user ${userId}`);
                    } else {
                        const errorText = await updateRes.text();
                        console.error("❌ Failed to update user courses:", updateRes.status, errorText);
                        return NextResponse.json({ error: "Update failed" }, { status: 500 });
                    }
                } else {
                    console.log("ℹ️ User already has this course.");
                }
            }
        }

        console.log("=== WEBHOOK COMPLETED ===\n");
        return NextResponse.json({ received: true });
    } catch (error) {
        console.error("❌ WEBHOOK ERROR:", error);
        return NextResponse.json({ error: "Internal error" }, { status: 500 });
    }
}
