import { NextRequest, NextResponse } from "next/server";
import { Prisma } from "@prisma/client";

import { db } from "@/lib/db";
import { CategoryCreateInputSchema } from "@/lib/schemas/category";

export async function POST(request: NextRequest) {
  try {
    const payload = await request.json();
    const parsedInput = CategoryCreateInputSchema.safeParse(payload);

    if (!parsedInput.success) {
      return NextResponse.json(
        {
          message: "Invalid category payload",
          errors: parsedInput.error.flatten(),
        },
        { status: 400 }
      );
    }

    const data = parsedInput.data;
    const existingCategory = await db.category.findUnique({
      where: {
        slug: data.slug,
      },
    });

    if (existingCategory) {
      return NextResponse.json(
        {
          data: null,
          message: `Category (${data.title}) already exists in the database`,
        },
        { status: 409 }
      );
    }

    if (data.parentId) {
      const parentCategory = await db.category.findUnique({
        where: { id: data.parentId },
      });

      if (!parentCategory) {
        return NextResponse.json(
          {
            message: "Parent category not found",
          },
          { status: 404 }
        );
      }
    }

    const createData: Prisma.CategoryUncheckedCreateInput = {
      title: data.title,
      slug: data.slug,
      imageUrl: data.imageUrl ?? null,
      description: data.description ?? null,
      isActive: data.isActive,
      parentId: data.parentId ?? null,
    };

    const newCategory = await db.category.create({
      data: createData,
      include: {
        parent: {
          select: { id: true, title: true, slug: true },
        },
      },
    });

    return NextResponse.json(newCategory, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      {
        message: "Failed to create category",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const rootsOnly = request.nextUrl.searchParams.get("roots") === "true";
    const where: Prisma.CategoryWhereInput | undefined = rootsOnly
      ? { parentId: null }
      : undefined;

    const categories = await db.category.findMany({
      where,
      orderBy: {
        createdAt: "desc",
      },
      include: {
        products: true,
        parent: {
          select: { id: true, title: true, slug: true },
        },
        subcategories: {
          orderBy: { createdAt: "desc" },
          include: {
            products: true,
          },
        },
      },
    });

    return NextResponse.json(categories);
  } catch (error) {
    return NextResponse.json(
      {
        message: "Failed to fetch categories",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
