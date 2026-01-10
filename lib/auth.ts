import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";

export const authOptions: NextAuthOptions = {
    providers: [
        CredentialsProvider({
            name: "WordPress",
            credentials: {
                username: { label: "Usuario", type: "text", placeholder: "usuario" },
                password: { label: "Contraseña", type: "password" }
            },
            async authorize(credentials) {
                const url = `${process.env.NEXT_PUBLIC_WORDPRESS_URL}/wp-json/jwt-auth/v1/token`;
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
                    console.log("WordPress Auth Response:", user);

                    if (res.ok && user.token) {
                        return {
                            id: user.user_id,
                            name: user.user_display_name,
                            email: user.user_email,
                            token: user.token,
                        };
                    }

                    console.error("Login failed. Status:", res.status, user.message || "");
                    return null;
                } catch (error) {
                    console.error("Auth error:", error);
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
    }
};
