import bcrypt from "bcrypt";
import base64url from "base64url";
import { UserRole } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";
import { v4 as uuidv4 } from "uuid";

import { db } from "@/lib/db";
import { UserCreateInputSchema, UserQuerySchema } from "@/lib/schemas/user";

const userPublicSelect = {
  id: true,
  name: true,
  email: true,
  role: true,
  plan: true,
  status: true,
  emailVerified: true,
  createdAt: true,
  updatedAt: true,
  profile: true,
  farmerProfile: true,
};

function normalizeRole(role: string): UserRole {
  if (role === "SELLER") return "FARMER";
  return role as UserRole;
}

export async function POST(request: NextRequest) {
  try {
    const payload = await request.json();
    const parsedInput = UserCreateInputSchema.safeParse(payload);

    if (!parsedInput.success) {
      return NextResponse.json(
        {
          message: "Invalid user payload",
          errors: parsedInput.error.flatten(),
        },
        { status: 400 }
      );
    }

    const data = parsedInput.data;
    const role = normalizeRole(data.role);
    const existingUser = await db.user.findUnique({
      where: {
        email: data.email,
      },
      select: { id: true },
    });

    if (existingUser) {
      return NextResponse.json(
        {
          data: null,
          message: `User with email (${data.email}) already exists in the database`,
        },
        { status: 409 }
      );
    }

    const hashedPassword = await bcrypt.hash(data.password, 10);
    const token = base64url.encode(uuidv4());

    const newUser = await db.user.create({
      data: {
        name: data.name,
        email: data.email,
        password: hashedPassword,
        role,
        plan: data.plan ?? null,
        verificationToken: token,
      },
      select: userPublicSelect,
    });

    return NextResponse.json(
      {
        data: newUser,
        message: "User created successfully",
      },
      { status: 201 }
    );
  } catch (error) {
    return NextResponse.json(
      {
        message: "Server error: failed to create user",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const queryInput = {
      role: request.nextUrl.searchParams.get("role") ?? undefined,
      status: request.nextUrl.searchParams.get("status") ?? undefined,
    };
    const parsedQuery = UserQuerySchema.safeParse(queryInput);

    if (!parsedQuery.success) {
      return NextResponse.json(
        {
          message: "Invalid query parameters",
          errors: parsedQuery.error.flatten(),
        },
        { status: 400 }
      );
    }

    const query = parsedQuery.data;
    const where: {
      role?: UserRole;
      status?: boolean;
    } = {};

    if (query.role) where.role = normalizeRole(query.role);
    if (query.status) where.status = query.status === "true";

    const users = await db.user.findMany({
      where,
      orderBy: {
        createdAt: "desc",
      },
      select: userPublicSelect,
    });

    return NextResponse.json(users);
  } catch (error) {
    return NextResponse.json(
      {
        message: "Failed to fetch users",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
