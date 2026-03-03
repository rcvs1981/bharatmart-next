import db from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";

const parseOptionalFloat = (value: string | number | null | undefined) =>
  value === "" || value === undefined || value === null
    ? null
    : parseFloat(String(value));

const parseOptionalInt = (value: string | number | null | undefined) =>
  value === "" || value === undefined || value === null
    ? null
    : parseInt(String(value));

export async function POST(request: Request) {
  try {
    const {
      barcode,
      qrCode,
      categoryId,
      gstRate,
      hsnCode,
      description,
      farmerId,
      isActive,
      isWholesale,
      productCode,
      productPrice,
      salePrice,
      sku,
      slug,
      tags,
      title,
      unit,
      wholesalePrice,
      wholesaleQty,
      productStock,
      qty,
      productImages,
    } = await request.json();
    //Check if this product already exists in the db
    const existingProduct = await db.product.findUnique({
      where: {
        slug,
      },
    });
    if (existingProduct) {
      return NextResponse.json(
        {
          data: null,
          message: `Product ( ${title})  already exists in the Database`,
        },
        { status: 409 }
      );
    }
    const newProduct = await db.product.create({
      data: {
        barcode,
        qrCode,
        categoryId,
        gstRate: parseOptionalFloat(gstRate),
        hsnCode,
        description,
        userId: farmerId,
        productImages,
        imageUrl: productImages[0],
        isActive,
        isWholesale,
        productCode,
        productPrice: parseFloat(productPrice),
        salePrice: parseFloat(salePrice),
        sku,
        slug,
        tags,
        title,
        unit,
        wholesalePrice: parseOptionalFloat(wholesalePrice),
        wholesaleQty: parseOptionalInt(wholesaleQty),
        productStock: parseOptionalInt(productStock),
        qty: parseOptionalInt(qty),
        // category: {
        //   connect: { id: categoryId },
        // },
        // user: {
        //   connect: { id: farmerId },
        // },
      },
    });
    console.log(newProduct);
    return NextResponse.json(newProduct);
  } catch (error) {
    console.log(error);
    return NextResponse.json(
      {
        message: "Failed to create Product",
        error,
      },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  const categoryId = request.nextUrl.searchParams.get("catId");
  const sortBy = request.nextUrl.searchParams.get("sort");
  const min = request.nextUrl.searchParams.get("min");
  const max = request.nextUrl.searchParams.get("max");
  const page = request.nextUrl.searchParams.get("page") || 1;
  const pageSize = 3;
  console.log(sortBy, categoryId);
  let where = {
    categoryId,
  };
  if (min && max) {
    where.salePrice = {
      gte: parseFloat(min),
      lte: parseFloat(max),
    };
  } else if (min) {
    where.salePrice = {
      gte: parseFloat(min),
    };
  } else if (max) {
    where.salePrice = {
      lte: parseFloat(max),
    };
  }
  let products;
  try {
    if (categoryId && sortBy) {
      products = await db.product.findMany({
        where,
        skip: (parseInt(page) - 1) * parseInt(pageSize),
        take: parseInt(pageSize),
        orderBy: {
          salePrice: sortBy === "asc" ? "asc" : "desc",
        },
      });
    } else if (categoryId) {
      products = await db.product.findMany({
        where,
        skip: (parseInt(page) - 1) * parseInt(pageSize),
        take: parseInt(pageSize),
        orderBy: {
          createdAt: "desc",
        },
      });
    } else {
      products = await db.product.findMany({
        skip: (parseInt(page) - 1) * parseInt(pageSize),
        take: parseInt(pageSize),
        orderBy: {
          createdAt: "desc",
        },
      });
    }
    return NextResponse.json(products);
  } catch (error) {
    console.log(error);
    return NextResponse.json(
      {
        message: "Failed to Fetch Products",
        error,
      },
      { status: 500 }
    );
  }
}
