import db from "@/lib/db";
import { NextResponse } from "next/server";

const parseOptionalFloat = (value: string | number | null | undefined) =>
  value === "" || value === undefined || value === null
    ? null
    : parseFloat(String(value));

const parseOptionalInt = (value: string | number | null | undefined) =>
  value === "" || value === undefined || value === null
    ? null
    : parseInt(String(value));

export async function GET(request: Request, { params: { id } }: { params: { id: string } }) {
  try {
    const product = await db.product.findUnique({
      where: {
        id,
      },
    });
    return NextResponse.json(product);
  } catch (error) {
    console.log(error);
    return NextResponse.json(
      {
        message: "Failed to Fetch Product",
        error,
      },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request, { params: { id } }: { params: { id: string } }) {
  try {
    const existingProduct = await db.product.findUnique({
      where: {
        id,
      },
    });
    if (!existingProduct) {
      return NextResponse.json(
        {
          data: null,
          message: "Product Not Found",
        },
        { status: 404 }
      );
    }
    const deletedProduct = await db.product.delete({
      where: {
        id,
      },
    });
    return NextResponse.json(deletedProduct);
  } catch (error) {
    console.log(error);
    return NextResponse.json(
      {
        message: "Failed to Delete Product",
        error,
      },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request, { params: { id } }: { params: { id: string } }) {
  try {
    const {
      barcode,
      qrCode,
      categoryId,
      gstRate,
      hsnCode,
      description,
      farmerId,
      imageUrl,
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
    } = await request.json();
    const existingProduct = await db.product.findUnique({
      where: {
        id,
      },
    });
    if (!existingProduct) {
      return NextResponse.json(
        {
          data: null,
          message: `Not Found`,
        },
        { status: 404 }
      );
    }
    const updatedProduct = await db.product.update({
      where: { id },
      data: {
        barcode,
        qrCode,
        categoryId,
        gstRate: parseOptionalFloat(gstRate),
        hsnCode,
        description,
        userId: farmerId,
        imageUrl,
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
    return NextResponse.json(updatedProduct);
  } catch (error) {
    console.log(error);
    return NextResponse.json(
      {
        message: "Failed to Update Product",
        error,
      },
      { status: 500 }
    );
  }
}
