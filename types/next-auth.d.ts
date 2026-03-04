import "next-auth";
import "next-auth/jwt";

import type { DefaultSession } from "next-auth";
import type { UserRole } from "@prisma/client";

declare module "next-auth" {
  interface Session {
    user: DefaultSession["user"] & {
      id: string;
      role: UserRole;
      status: boolean;
      isEmailVerified: boolean;
    };
  }

  interface User {
    role?: UserRole;
    status?: boolean;
    isEmailVerified?: boolean;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id?: string;
    role?: UserRole;
    status?: boolean;
    userEmailVerified?: boolean;
  }
}
