import bcrypt from "bcrypt";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

import { db } from "@/lib/db";

const UpdatePasswordInputSchema = z.object({
  id: z.string().trim().min(1),
  token: z.string().trim().min(1),
  password: z.string().min(6),
});

export async function PUT(request: NextRequest) {
  try {
    const parsedBody = UpdatePasswordInputSchema.safeParse(await request.json());
    if (!parsedBody.success) {
      return NextResponse.json(
        {
          message: "Invalid request payload",
          errors: parsedBody.error.flatten(),
        },
        { status: 400 }
      );
    }

    const { password, id, token } = parsedBody.data;
    const user = await db.user.findFirst({
      where: {
        id,
        verificationToken: token,
      },
      select: { id: true },
    });

    if (!user) {
      return NextResponse.json(
        {
          data: null,
          message: "Invalid or expired reset link",
        },
        { status: 400 }
      );
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    await db.user.update({
      where: {
        id: user.id,
      },
      data: {
        password: hashedPassword,
        verificationToken: null,
      },
    });

    return NextResponse.json(
      {
        message: "Password updated successfully",
      },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      {
        message: "Failed to update user password",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
