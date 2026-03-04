import NextAuth, { type NextAuthConfig } from "next-auth"
import Credentials from "next-auth/providers/credentials"
import { PrismaAdapter } from "@auth/prisma-adapter"
import { compare } from "bcrypt"
import { UserRole } from "@prisma/client"

import { db } from "./db"

function getCredential(
  credentials: Record<string, unknown> | undefined,
  key: "email" | "password"
): string | null {
  const value = credentials?.[key]
  return typeof value === "string" ? value : null
}

const config = {
  adapter: PrismaAdapter(db),

  secret: process.env.AUTH_SECRET ?? process.env.NEXTAUTH_SECRET,

  session: {
    strategy: "jwt",
  },

  pages: {
    signIn: "/login",
  },

  providers: [
    Credentials({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const email = getCredential(credentials, "email")
        const password = getCredential(credentials, "password")

        if (!email || !password) return null

        const user = await db.user.findUnique({
          where: { email },
        })

        if (!user || !user.password) return null

        const isValid = await compare(password, user.password)

        if (!isValid) return null

        return {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          status: user.status,
          isEmailVerified: !!user.emailVerified,
        }
      },
    }),
  ],

  callbacks: {
    authorized({ auth }) {
      return !!auth
    },

    async jwt({ token, user }) {
      if (user) {
        token.id = user.id
        token.role = user.role
        token.status = user.status
        token.userEmailVerified = user.isEmailVerified
      }
      return token
    },

    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string
        session.user.role = (token.role as UserRole) ?? UserRole.USER
        session.user.status = Boolean(token.status)
        session.user.isEmailVerified = Boolean(token.userEmailVerified)
      }
      return session
    },
  },
} satisfies NextAuthConfig

export const {
  handlers: { GET, POST },
  auth,
  signIn,
  signOut,
} = NextAuth(config)