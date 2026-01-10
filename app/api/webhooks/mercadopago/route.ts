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
        console.log("Mercado Pago Webhook received:", body);

        // Mercado Pago sends different types of notifications
        // We're interested in "payment" notifications
        if (body.type === 'payment') {
            const paymentId = body.data.id;

            // Get payment details from Mercado Pago
            const payment = new Payment(client);
            const paymentData = await payment.get({ id: paymentId });

            console.log("Payment data:", paymentData);

            // Check if payment was approved
            if (paymentData.status === 'approved') {
                // Extract course ID and user email from payment metadata
                const courseId = paymentData.external_reference; // We'll set this when creating the preference
                const userEmail = paymentData.payer?.email;

                if (courseId && userEmail) {
                    // Get WordPress user by email
                    const wpUrl = process.env.NEXT_PUBLIC_WORDPRESS_URL;
                    if (!wpUrl) {
                        console.error("WordPress URL not configured");
                        return NextResponse.json({ error: "Configuration error" }, { status: 500 });
                    }

                    // Get admin credentials
                    const adminUser = process.env.WP_ADMIN_USER;
                    let adminPass = process.env.WP_ADMIN_APP_PASSWORD;

                    if (!adminUser || !adminPass) {
                        console.error("Missing WP Admin credentials");
                        return NextResponse.json({ error: "Configuration error" }, { status: 500 });
                    }

                    adminPass = adminPass.replace(/\s/g, '');

                    // Find user by email
                    const usersRes = await fetch(`${wpUrl}/wp-json/wp/v2/users?search=${encodeURIComponent(userEmail)}`, {
                        headers: {
                            Authorization: "Basic " + Buffer.from(`${adminUser}:${adminPass}`).toString("base64"),
                        },
                    });

                    const users = await usersRes.json();

                    if (users.length > 0) {
                        const userId = users[0].id;

                        // Get current purchased courses
                        const currentCourses = users[0].acf?.purchased_courses || [];

                        // Add new course if not already purchased
                        if (!currentCourses.includes(courseId)) {
                            currentCourses.push(courseId);

                            // Update user meta with purchased courses
                            const updateRes = await fetch(`${wpUrl}/wp-json/wp/v2/users/${userId}`, {
                                method: 'POST',
                                headers: {
                                    'Content-Type': 'application/json',
                                    Authorization: "Basic " + Buffer.from(`${adminUser}:${adminPass}`).toString("base64"),
                                },
                                body: JSON.stringify({
                                    acf: {
                                        purchased_courses: currentCourses
                                    }
                                }),
                            });

                            if (updateRes.ok) {
                                console.log(`Course ${courseId} added to user ${userId}`);
                            } else {
                                console.error("Failed to update user courses:", await updateRes.text());
                            }
                        }
                    }
                }
            }
        }

        return NextResponse.json({ received: true });
    } catch (error) {
        console.error("Webhook error:", error);
        return NextResponse.json({ error: "Webhook processing failed" }, { status: 500 });
    }
}
