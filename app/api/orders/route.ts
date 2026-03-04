import { Prisma } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";

import { db } from "@/lib/db";
import { OrderCreateInputSchema, OrderQuerySchema } from "@/lib/schemas/order";

function generateOrderNumber(length: number) {
  const characters = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  let orderNumber = "";

  for (let i = 0; i < length; i += 1) {
    const randomIndex = Math.floor(Math.random() * characters.length);
    orderNumber += characters.charAt(randomIndex);
  }

  return orderNumber;
}

export async function POST(request: NextRequest) {
  try {
    const payload = await request.json();
    const parsedInput = OrderCreateInputSchema.safeParse(payload);

    if (!parsedInput.success) {
      return NextResponse.json(
        {
          message: "Invalid order payload",
          errors: parsedInput.error.flatten(),
        },
        { status: 400 }
      );
    }

    const { checkoutFormData, orderItems } = parsedInput.data;
    const result = await db.$transaction(async (prisma) => {
      const newOrder = await prisma.order.create({
        data: {
          userId: checkoutFormData.userId,
          firstName: checkoutFormData.firstName,
          lastName: checkoutFormData.lastName,
          email: checkoutFormData.email,
          phone: checkoutFormData.phone,
          streetAddress: checkoutFormData.streetAddress,
          city: checkoutFormData.city,
          country: checkoutFormData.country,
          state: checkoutFormData.district ?? checkoutFormData.state ?? null,
          zip: checkoutFormData.zip ?? null,
          apartment: checkoutFormData.apartment ?? null,
          shippingCost: checkoutFormData.shippingCost,
          paymentMethod: checkoutFormData.paymentMethod,
          orderNumber: generateOrderNumber(8),
        },
      });

      await prisma.orderItem.createMany({
        data: orderItems.map((item) => ({
          productId: item.id,
          vendorId: item.vendorId,
          quantity: item.qty,
          price: item.salePrice,
          orderId: newOrder.id,
          imageUrl: item.imageUrl ?? null,
          title: item.title,
        })),
      });

      await prisma.sale.createMany({
        data: orderItems.map((item) => ({
          orderId: newOrder.id,
          productTitle: item.title,
          productImage: item.imageUrl ?? "",
          productPrice: item.salePrice,
          productQty: item.qty,
          productId: item.id,
          vendorId: item.vendorId,
          total: item.salePrice * item.qty,
        })),
      });

      return newOrder;
    });

    return NextResponse.json(result, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      {
        message: "Failed to create order",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const queryInput = {
      userId: request.nextUrl.searchParams.get("userId") ?? undefined,
      orderStatus: request.nextUrl.searchParams.get("orderStatus") ?? undefined,
    };
    const parsedQuery = OrderQuerySchema.safeParse(queryInput);

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
    const where: Prisma.OrderWhereInput = {};

    if (query.userId) where.userId = query.userId;
    if (query.orderStatus) where.orderStatus = query.orderStatus;

    const orders = await db.order.findMany({
      where,
      orderBy: {
        createdAt: "desc",
      },
      include: {
        orderItems: true,
      },
    });

    return NextResponse.json(orders);
  } catch (error) {
    return NextResponse.json(
      {
        message: "Failed to fetch orders",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
