import { Prisma } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";

import { db } from "@/lib/db";
import { CustomerQuerySchema } from "@/lib/schemas/customer";

export async function GET(request: NextRequest) {
  try {
    const queryInput = {
      status: request.nextUrl.searchParams.get("status") ?? undefined,
    };
    const parsedQuery = CustomerQuerySchema.safeParse(queryInput);

    if (!parsedQuery.success) {
      return NextResponse.json(
        {
          message: "Invalid query parameters",
          errors: parsedQuery.error.flatten(),
        },
        { status: 400 }
      );
    }

    const where: Prisma.UserWhereInput = {
      role: "USER",
    };

    if (parsedQuery.data.status) {
      where.status = parsedQuery.data.status === "true";
    }

    const customers = await db.user.findMany({
      orderBy: {
        createdAt: "desc",
      },
      where,
      include: {
        profile: true,
      },
    });

    return NextResponse.json(customers);
  } catch (error) {
    return NextResponse.json(
      {
        message: "Failed to fetch customers",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
