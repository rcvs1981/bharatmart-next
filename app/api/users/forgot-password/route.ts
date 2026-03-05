import base64url from "base64url";
import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";
import { v4 as uuidv4 } from "uuid";
import { z } from "zod";

import { EmailTemplate } from "@/components/email-template";
import { db } from "@/lib/db";

const ForgotPasswordInputSchema = z.object({
  email: z.string().trim().email(),
});

export async function PUT(request: NextRequest) {
  try {
    const parsedBody = ForgotPasswordInputSchema.safeParse(await request.json());
    if (!parsedBody.success) {
      return NextResponse.json(
        {
          message: "Invalid request payload",
          errors: parsedBody.error.flatten(),
        },
        { status: 400 }
      );
    }

    const { email } = parsedBody.data;
    const existingUser = await db.user.findUnique({
      where: { email },
      select: {
        id: true,
        name: true,
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

    const token = base64url.encode(uuidv4());
    const userId = existingUser.id;

    await db.user.update({
      where: { id: userId },
      data: {
        verificationToken: token,
      },
    });

    const resendApiKey = process.env.RESEND_API_KEY;
    if (!resendApiKey) {
      return NextResponse.json(
        { message: "Resend API key is not configured" },
        { status: 500 }
      );
    }

    const resend = new Resend(resendApiKey);
    const subject = "Password Reset - Limi Ecommerce";
    const sendResult = await resend.emails.send({
      from: process.env.RESEND_FROM_EMAIL ?? "Desishub <info@jazzafricaadventures.com>",
      to: email,
      subject,
      react: EmailTemplate({
        name: existingUser.name ?? "",
        redirectUrl: `reset-password?token=${encodeURIComponent(
          token
        )}&id=${encodeURIComponent(userId)}`,
        linkText: "Reset Password",
        description:
          "Click on the following link in order to reset your password. Thank you.",
        subject,
      }),
    });

    if (sendResult.error) {
      return NextResponse.json(
        {
          message: "Failed to send password reset email",
          error: sendResult.error.message,
        },
        { status: 502 }
      );
    }

    return NextResponse.json(
      {
        message: "Password reset link sent successfully",
      },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      {
        message: "Server error: something went wrong",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
