import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";

const handler = NextAuth({
  providers: [
    CredentialsProvider({
      name: "Password",
      credentials: {
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const correct = process.env.DASHBOARD_PASSWORD;
        if (!correct) {
          console.warn("[auth] DASHBOARD_PASSWORD is not set");
          return null;
        }
        if (credentials?.password === correct) {
          return { id: "admin", name: "Admin", email: "admin@merch7am.com" };
        }
        return null;
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
  secret: process.env.NEXTAUTH_SECRET,
});

export { handler as GET, handler as POST };
