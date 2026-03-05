import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

import { db } from "@/lib/db";

const VerifyUserInputSchema = z.object({
  id: z.string().trim().min(1),
  token: z.string().trim().min(1),
});

export async function PUT(request: NextRequest) {
  try {
    const parsedBody = VerifyUserInputSchema.safeParse(await request.json());
    if (!parsedBody.success) {
      return NextResponse.json(
        {
          message: "Invalid request payload",
          errors: parsedBody.error.flatten(),
        },
        { status: 400 }
      );
    }

    const { token, id } = parsedBody.data;
    const user = await db.user.findFirst({
      where: {
        id,
        verificationToken: token,
      },
      select: {
        id: true,
        email: true,
        emailVerified: true,
      },
    });

    if (!user) {
      return NextResponse.json(
        {
          data: null,
          message: "Invalid or expired verification link",
        },
        { status: 400 }
      );
    }

    if (user.emailVerified) {
      return NextResponse.json({
        data: user,
        message: "Email already verified",
      });
    }

    const updatedUser = await db.user.update({
      where: {
        id: user.id,
      },
      data: {
        emailVerified: true,
        verificationToken: null,
      },
      select: {
        id: true,
        email: true,
        emailVerified: true,
      },
    });

    return NextResponse.json(
      {
        data: updatedUser,
        message: "Email verified successfully",
      },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      {
        message: "Failed to verify user",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
