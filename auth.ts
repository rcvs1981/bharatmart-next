import NextAuth from "next-auth";
import { authOptions } from "@/lib/authOptions";

export const {
  handlers: { GET, POST },
  auth,
  signIn,
  signOut,
} = NextAuth(authOptions);
