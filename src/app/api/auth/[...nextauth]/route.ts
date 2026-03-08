import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";

const handler = NextAuth({
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        username: { label: "Username", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.username || !credentials?.password) return null;

        const { username, password } = credentials;

        // ── Admin: validated entirely from env vars, no backend call needed ──
        const adminUsername = process.env.ADMIN_USERNAME || "admin";
        const adminPassword = process.env.ADMIN_PASSWORD || process.env.DASHBOARD_PASSWORD || "";

        if (username === adminUsername && adminPassword && password === adminPassword) {
          return { id: "admin", name: "Admin", role: "admin", clientId: null, enabledModules: [] };
        }

        // ── Client: call backend to validate against stored client password ──
        const backendUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

        try {
          const res = await fetch(`${backendUrl}/api/auth/login`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ username, password }),
          });

          const data = await res.json();
          if (!data.ok) return null;

          return {
            id: data.client_id,
            name: data.name,
            role: data.role,
            clientId: data.client_id ?? null,
            enabledModules: data.enabled_modules ?? [],
          };
        } catch (err) {
          console.error("[auth] Backend login error:", err);
          return null;
        }
      },
    }),
  ],
  pages: {
    signIn: "/login",
  },
  session: {
    strategy: "jwt",
    maxAge: 7 * 24 * 60 * 60, // 7 days
  },
  callbacks: {
    jwt({ token, user }) {
      if (user) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const u = user as any;
        token.role = u.role;
        token.clientId = u.clientId;
        token.enabledModules = u.enabledModules;
      }
      return token;
    },
    session({ session, token }) {
      session.user.role = (token.role ?? "admin") as "admin" | "client";
      session.user.clientId = token.clientId as string | undefined;
      session.user.enabledModules = (token.enabledModules ?? []) as string[];
      return session;
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
});

export { handler as GET, handler as POST };
