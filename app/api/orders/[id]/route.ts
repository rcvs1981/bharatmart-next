import { NextRequest, NextResponse } from "next/server";

import { db } from "@/lib/db";
import {
  OrderIdParamSchema,
  OrderStatusUpdateInputSchema,
} from "@/lib/schemas/order";

type ParamsContext = {
  params: Promise<{ id: string }>;
};

async function getOrderId(paramsPromise: ParamsContext["params"]) {
  const params = await paramsPromise;
  return OrderIdParamSchema.parse(params).id;
}

export async function GET(_request: NextRequest, context: ParamsContext) {
  try {
    const id = await getOrderId(context.params);
    const order = await db.order.findUnique({
      where: {
        id,
      },
      include: {
        orderItems: true,
      },
    });

    if (!order) {
      return NextResponse.json(
        {
          data: null,
          message: "Order not found",
        },
        { status: 404 }
      );
    }

    return NextResponse.json(order);
  } catch (error) {
    return NextResponse.json(
      {
        message: "Failed to fetch order",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

export async function DELETE(_request: NextRequest, context: ParamsContext) {
  try {
    const id = await getOrderId(context.params);
    const existingOrder = await db.order.findUnique({
      where: {
        id,
      },
      select: {
        id: true,
      },
    });

    if (!existingOrder) {
      return NextResponse.json(
        {
          data: null,
          message: "Order not found",
        },
        { status: 404 }
      );
    }

    const deletedOrder = await db.order.delete({
      where: {
        id,
      },
    });

    return NextResponse.json(deletedOrder);
  } catch (error) {
    return NextResponse.json(
      {
        message: "Failed to delete order",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest, context: ParamsContext) {
  try {
    const id = await getOrderId(context.params);
    const payload = await request.json();
    const parsedInput = OrderStatusUpdateInputSchema.safeParse(payload);

    if (!parsedInput.success) {
      return NextResponse.json(
        {
          message: "Invalid order update payload",
          errors: parsedInput.error.flatten(),
        },
        { status: 400 }
      );
    }

    const existingOrder = await db.order.findUnique({
      where: {
        id,
      },
      select: {
        id: true,
      },
    });

    if (!existingOrder) {
      return NextResponse.json(
        {
          data: null,
          message: "Order not found",
        },
        { status: 404 }
      );
    }

    const updatedOrder = await db.order.update({
      where: {
        id,
      },
      data: {
        orderStatus: parsedInput.data.orderStatus,
      },
    });

    return NextResponse.json(updatedOrder);
  } catch (error) {
    return NextResponse.json(
      {
        message: "Failed to update order",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
