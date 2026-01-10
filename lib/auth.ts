import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";

// Bypass SSL check for self-signed certificates if configured in environment
if (process.env.NODE_TLS_REJECT_UNAUTHORIZED === '0') {
    process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
}

export const authOptions: NextAuthOptions = {
    providers: [
        CredentialsProvider({
            name: "WordPress",
            credentials: {
                username: { label: "Usuario", type: "text", placeholder: "usuario" },
                password: { label: "Contraseña", type: "password" }
            },
            async authorize(credentials) {
                const wpUrl = process.env.NEXT_PUBLIC_WORDPRESS_URL;
                if (!wpUrl) {
                    console.error("NEXT_PUBLIC_WORDPRESS_URL is not defined");
                    return null;
                }

                const url = `${wpUrl}/wp-json/jwt-auth/v1/token`;
                console.log("Attempting login at:", url);

                try {
                    const res = await fetch(url, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            username: credentials?.username,
                            password: credentials?.password,
                        }),
                    });

                    const user = await res.json();
                    console.log("WordPress Auth Response Status:", res.status);

                    if (res.ok && user.token) {
                        console.log("Login successful for user:", user.user_display_name);
                        return {
                            id: user.user_id,
                            name: user.user_display_name,
                            email: user.user_email,
                            token: user.token,
                        };
                    }

                    console.error("Login failed. Status:", res.status, "Message:", user.message || "No message");
                    return null;
                } catch (error: any) {
                    console.error("Auth error during fetch:", error.message || error);
                    return null;
                }
            }
        })
    ],
    callbacks: {
        async jwt({ token, user }) {
            if (user) {
                token.accessToken = (user as any).token;
            }
            return token;
        },
        async session({ session, token }) {
            (session as any).accessToken = token.accessToken;
            return session;
        }
    },
    pages: {
        signIn: '/login',
    },
    secret: process.env.NEXTAUTH_SECRET,
};
