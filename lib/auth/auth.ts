import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { db } from "@/lib/db";
import { users, userRoles, roles } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import type { Role } from "@/lib/permissions";

export const { handlers, auth, signIn, signOut } = NextAuth({
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  pages: {
    signIn: "/login",
    error: "/login",
  },
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        const email = String(credentials.email).toLowerCase().trim();
        const password = String(credentials.password);

        const foundUser = await db.query.users.findFirst({
          where: eq(users.email, email),
          with: {
            userRoles: {
              with: {
                role: true,
              },
            },
          },
        });

        if (!foundUser || !foundUser.passwordHash) {
          return null;
        }

        if (!foundUser.isActive) {
          throw new Error("Account is deactivated");
        }

        const isMatch = await bcrypt.compare(password, foundUser.passwordHash);
        if (!isMatch) {
          return null;
        }

        const userRolesList = foundUser.userRoles.map((ur) => ur.roleId as Role);

        return {
          id: foundUser.id,
          name: foundUser.name,
          email: foundUser.email,
          image: foundUser.image,
          roles: userRolesList.length > 0 ? userRolesList : ["USER"],
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.roles = (user as { roles?: Role[] }).roles || ["USER"];
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.roles = (token.roles as Role[]) || ["USER"];
      }
      return session;
    },
  },
  secret: process.env.AUTH_SECRET,
});
