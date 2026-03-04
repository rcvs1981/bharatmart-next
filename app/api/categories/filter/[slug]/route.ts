import { NextRequest, NextResponse } from "next/server";

import { db } from "@/lib/db";
import { CategorySlugParamSchema } from "@/lib/schemas/category";

type ParamsContext = {
  params: Promise<{ slug: string }>;
};

async function getCategorySlug(paramsPromise: ParamsContext["params"]) {
  const params = await paramsPromise;
  return CategorySlugParamSchema.parse(params).slug;
}

export async function GET(_request: NextRequest, context: ParamsContext) {
  try {
    const slug = await getCategorySlug(context.params);
    const category = await db.category.findUnique({
      where: { slug },
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

