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
            console.log("- External Reference (Course ID):", paymentData.external_reference);
            console.log("- Payer Email:", paymentData.payer?.email);
            console.log("- Amount:", paymentData.transaction_amount);
            console.log("- Full payment data:", JSON.stringify(paymentData, null, 2));

            // Check if payment was approved
            if (paymentData.status === 'approved') {
                console.log("✅ Payment approved, processing course assignment...");

                // Extract course ID and user email from payment metadata
                const courseId = paymentData.external_reference; // We'll set this when creating the preference
                const userEmail = paymentData.payer?.email;

                console.log("Course ID:", courseId);
                console.log("User Email:", userEmail);

                if (!courseId) {
                    console.error("❌ Missing course ID in external_reference");
                    return NextResponse.json({ error: "Missing course ID" }, { status: 400 });
                }

                if (!userEmail) {
                    console.error("❌ Missing user email in payer data");
                    return NextResponse.json({ error: "Missing user email" }, { status: 400 });
                }

                // Get WordPress user by email
                const wpUrl = process.env.NEXT_PUBLIC_WORDPRESS_URL;
                if (!wpUrl) {
                    console.error("❌ WordPress URL not configured");
                    return NextResponse.json({ error: "Configuration error" }, { status: 500 });
                }

                // Get admin credentials
                const adminUser = process.env.WP_ADMIN_USER;
                let adminPass = process.env.WP_ADMIN_APP_PASSWORD;

                if (!adminUser || !adminPass) {
                    console.error("❌ Missing WP Admin credentials");
                    return NextResponse.json({ error: "Configuration error" }, { status: 500 });
                }

                adminPass = adminPass.replace(/\s/g, '');

                console.log("Searching for user with email:", userEmail);

                // Find user by email
                const usersRes = await fetch(`${wpUrl}/wp-json/wp/v2/users?search=${encodeURIComponent(userEmail)}`, {
                    headers: {
                        Authorization: "Basic " + Buffer.from(`${adminUser}:${adminPass}`).toString("base64"),
                    },
                });

                if (!usersRes.ok) {
                    console.error("❌ Failed to fetch users from WordPress:", usersRes.status, await usersRes.text());
                    return NextResponse.json({ error: "Failed to fetch user" }, { status: 500 });
                }

                const users = await usersRes.json();
                console.log("Users found:", users.length);

                if (users.length > 0) {
                    const userId = users[0].id;
                    console.log("User found - ID:", userId, "Email:", users[0].email);

                    // Get current purchased courses
                    const currentCourses = users[0].acf?.purchased_courses || [];
                    console.log("Current purchased courses:", currentCourses);

                    // Add new course if not already purchased
                    if (!currentCourses.includes(courseId)) {
                        currentCourses.push(courseId);
                        console.log("Adding course to user. New courses list:", currentCourses);

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
                            console.log(`✅ Course ${courseId} successfully added to user ${userId}`);
                        } else {
                            const errorText = await updateRes.text();
                            console.error("❌ Failed to update user courses:", updateRes.status, errorText);
                            return NextResponse.json({ error: "Failed to update user" }, { status: 500 });
                        }
                    } else {
                        console.log("ℹ️ User already has this course, skipping...");
                    }
                } else {
                    console.error("❌ No user found with email:", userEmail);
                    return NextResponse.json({ error: "User not found" }, { status: 404 });
                }
            } else {
                console.log(`ℹ️ Payment status is '${paymentData.status}', not processing course assignment`);
            }
        } else {
            console.log(`ℹ️ Webhook type is '${body.type}', not a payment notification`);
        }

        console.log("=== WEBHOOK COMPLETED ===\n");
        return NextResponse.json({ received: true });
    } catch (error) {
        console.error("❌ WEBHOOK ERROR:", error);
        if (error instanceof Error) {
            console.error("Error message:", error.message);
            console.error("Error stack:", error.stack);
        }
        return NextResponse.json({ error: "Webhook processing failed" }, { status: 500 });
    }
}
