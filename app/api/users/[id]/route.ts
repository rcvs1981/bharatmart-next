import bcrypt from "bcrypt";
import { Prisma, UserRole } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";

import { db } from "@/lib/db";
import {
  UserIdParamSchema,
  UserUpdateInputSchema,
} from "@/lib/schemas/user";

type ParamsContext = {
  params: Promise<{ id: string }>;
};

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

async function getUserId(paramsPromise: ParamsContext["params"]) {
  const params = await paramsPromise;
  return UserIdParamSchema.parse(params).id;
}

export async function GET(_request: NextRequest, context: ParamsContext) {
  try {
    const id = await getUserId(context.params);
    const user = await db.user.findUnique({
      where: {
        id,
      },
      select: userPublicSelect,
    });

    if (!user) {
      return NextResponse.json(
        {
          data: null,
          message: "User not found",
        },
        { status: 404 }
      );
    }

    return NextResponse.json(user);
  } catch (error) {
    return NextResponse.json(
      {
        message: "Failed to fetch user",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

export async function DELETE(_request: NextRequest, context: ParamsContext) {
  try {
    const id = await getUserId(context.params);
    const existingUser = await db.user.findUnique({
      where: {
        id,
      },
      select: {
        id: true,
      },
    });

    if (!existingUser) {
      return NextResponse.json(
        {
          data: null,
          message: "User not found",
        },
        { status: 404 }
      );
    }

    const deletedUser = await db.user.delete({
      where: {
        id,
      },
      select: userPublicSelect,
    });

    return NextResponse.json(deletedUser);
  } catch (error) {
    return NextResponse.json(
      {
        message: "Failed to delete user",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest, context: ParamsContext) {
  try {
    const id = await getUserId(context.params);
    const payload = await request.json();
    const parsedInput = UserUpdateInputSchema.safeParse(payload);

    if (!parsedInput.success) {
      return NextResponse.json(
        {
          message: "Invalid user payload",
          errors: parsedInput.error.flatten(),
        },
        { status: 400 }
      );
    }

    const existingUser = await db.user.findUnique({
      where: {
        id,
      },
      select: {
        id: true,
        email: true,
      },
    });

    if (!existingUser) {
      return NextResponse.json(
        {
          data: null,
          message: "User not found",
        },
        { status: 404 }
      );
    }

    const input = parsedInput.data;
    if (input.email && input.email !== existingUser.email) {
      const userWithEmail = await db.user.findUnique({
        where: {
          email: input.email,
        },
        select: {
          id: true,
        },
      });

      if (userWithEmail && userWithEmail.id !== id) {
        return NextResponse.json(
          {
            message: "Email is already used by another account",
          },
          { status: 409 }
        );
      }
    }

    const data: Prisma.UserUpdateInput = {};

    if (input.name !== undefined) data.name = input.name;
    if (input.email !== undefined) data.email = input.email;
    if (input.role !== undefined) data.role = normalizeRole(input.role);
    if (input.plan !== undefined) data.plan = input.plan;
    if (input.status !== undefined) data.status = input.status;
    if (input.emailVerified !== undefined) data.emailVerified = input.emailVerified;
    if (input.verificationToken !== undefined) {
      data.verificationToken = input.verificationToken;
    }
    if (input.password !== undefined) {
      data.password = await bcrypt.hash(input.password, 10);
    }

    const updatedUser = await db.user.update({
      where: { id },
      data,
      select: userPublicSelect,
    });

    return NextResponse.json(updatedUser);
  } catch (error) {
    return NextResponse.json(
      {
        message: "Failed to update user",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
