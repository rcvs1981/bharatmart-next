import { Prisma } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";

import { db } from "@/lib/db";
import {
  CategoryIdParamSchema,
  CategoryUpdateInputSchema,
} from "@/lib/schemas/category";

type ParamsContext = {
  params: Promise<{ id: string }>;
};

async function getCategoryId(paramsPromise: ParamsContext["params"]) {
  const params = await paramsPromise;
  return CategoryIdParamSchema.parse(params).id;
}

export async function GET(_request: NextRequest, context: ParamsContext) {
  try {
    const id = await getCategoryId(context.params);
    const category = await db.category.findUnique({
      where: { id },
      include: {
        products: true,
        parent: {
          select: { id: true, title: true, slug: true },
        },
        subcategories: {
          include: {
            products: true,
          },
        },
      },
    });

    if (!category) {
      return NextResponse.json(
        { data: null, message: "Category not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(category);
  } catch (error) {
    return NextResponse.json(
      {
        message: "Failed to fetch category",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

export async function DELETE(_request: NextRequest, context: ParamsContext) {
  try {
    const id = await getCategoryId(context.params);
    const existingCategory = await db.category.findUnique({
      where: { id },
    });

    if (!existingCategory) {
      return NextResponse.json(
        { data: null, message: "Category not found" },
        { status: 404 }
      );
    }

    const deletedCategory = await db.category.delete({
      where: { id },
    });

    return NextResponse.json(deletedCategory);
  } catch (error) {
    return NextResponse.json(
      {
        message: "Failed to delete category",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest, context: ParamsContext) {
  try {
    const id = await getCategoryId(context.params);
    const payload = await request.json();
    const parsedInput = CategoryUpdateInputSchema.safeParse(payload);

    if (!parsedInput.success) {
      return NextResponse.json(
        {
          message: "Invalid category payload",
          errors: parsedInput.error.flatten(),
        },
        { status: 400 }
      );
    }

    const existingCategory = await db.category.findUnique({
      where: { id },
    });

    if (!existingCategory) {
      return NextResponse.json(
        { data: null, message: "Category not found" },
        { status: 404 }
      );
    }

    const input = parsedInput.data;
    if (input.parentId === id) {
      return NextResponse.json(
        { message: "Category cannot be its own parent" },
        { status: 400 }
      );
    }

    if (input.parentId) {
      const parentCategory = await db.category.findUnique({
        where: { id: input.parentId },
      });

      if (!parentCategory) {
        return NextResponse.json(
          { message: "Parent category not found" },
          { status: 404 }
        );
      }
    }

    const data: Prisma.CategoryUncheckedUpdateInput = {};

    if (input.title !== undefined) data.title = input.title;
    if (input.slug !== undefined) data.slug = input.slug;
    if (input.imageUrl !== undefined) data.imageUrl = input.imageUrl;
    if (input.description !== undefined) data.description = input.description;
    if (input.isActive !== undefined) data.isActive = input.isActive;
    if (input.parentId !== undefined) data.parentId = input.parentId;

    const updatedCategory = await db.category.update({
      where: { id },
      data,
      include: {
        parent: {
          select: { id: true, title: true, slug: true },
        },
      },
    });

    return NextResponse.json(updatedCategory);
  } catch (error) {
    return NextResponse.json(
      {
        message: "Failed to update category",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
