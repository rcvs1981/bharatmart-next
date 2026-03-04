import { NextRequest, NextResponse } from "next/server";

import { db } from "@/lib/db";
import { OrderIdParamSchema } from "@/lib/schemas/order";

type ParamsContext = {
  params: Promise<{ id: string }>;
};

async function getUserId(paramsPromise: ParamsContext["params"]) {
  const params = await paramsPromise;
  return OrderIdParamSchema.parse(params).id;
}

export async function GET(_request: NextRequest, context: ParamsContext) {
  try {
    const userId = await getUserId(context.params);
    const orders = await db.order.findMany({
      where: {
        userId,
      },
      include: {
        orderItems: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json(orders);
  } catch (error) {
    return NextResponse.json(
      {
        message: "Failed to fetch user orders",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
