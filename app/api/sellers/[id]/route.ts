import { Prisma } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";

import { db } from "@/lib/db";
import {
  SellerIdParamSchema,
  SellerProfileUpdateInput,
  SellerStatusUpdateSchema,
} from "@/lib/schemas/seller";

type ParamsContext = {
  params: Promise<{ id: string }>;
};

async function getSellerId(paramsPromise: ParamsContext["params"]) {
  const params = await paramsPromise;
  return SellerIdParamSchema.parse(params).id;
}

function buildSellerProfileUpdateData(input: SellerProfileUpdateInput) {
  const data: Prisma.FarmerProfileUpdateWithoutUserInput = {};

  if (input.code !== undefined) data.code = input.code;
  if (input.contactPerson !== undefined) data.contactPerson = input.contactPerson;
  if (input.contactPersonPhone !== undefined) {
    data.contactPersonPhone = input.contactPersonPhone;
  }
  if (input.profileImageUrl !== undefined) data.profileImageUrl = input.profileImageUrl;
  if (input.firstName !== undefined) data.firstName = input.firstName;
  if (input.lastName !== undefined) data.lastName = input.lastName;
  if (input.notes !== undefined) data.notes = input.notes;
  if (input.phone !== undefined) data.phone = input.phone;
  if (input.physicalAddress !== undefined) data.physicalAddress = input.physicalAddress;
  if (input.terms !== undefined) data.terms = input.terms;
  if (input.isActive !== undefined) data.isActive = input.isActive;
  if (input.products !== undefined) data.products = input.products;
  if (input.landSize !== undefined) data.landSize = input.landSize;
  if (input.mainCrop !== undefined) data.mainCrop = input.mainCrop;

  return data;
}

function buildSellerProfileCreateData(input: SellerProfileUpdateInput) {
  const data: Prisma.FarmerProfileCreateWithoutUserInput = {};

  if (input.code !== undefined) data.code = input.code;
  if (input.contactPerson !== undefined) data.contactPerson = input.contactPerson;
  if (input.contactPersonPhone !== undefined) {
    data.contactPersonPhone = input.contactPersonPhone;
  }
  if (input.profileImageUrl !== undefined) data.profileImageUrl = input.profileImageUrl;
  if (input.firstName !== undefined) data.firstName = input.firstName;
  if (input.lastName !== undefined) data.lastName = input.lastName;
  if (input.notes !== undefined) data.notes = input.notes;
  if (input.phone !== undefined) data.phone = input.phone;
  if (input.physicalAddress !== undefined) data.physicalAddress = input.physicalAddress;
  if (input.terms !== undefined) data.terms = input.terms;
  if (input.isActive !== undefined) data.isActive = input.isActive;
  if (input.products !== undefined) data.products = input.products;
  if (input.landSize !== undefined) data.landSize = input.landSize;
  if (input.mainCrop !== undefined) data.mainCrop = input.mainCrop;

  return data;
}

export async function GET(_request: NextRequest, context: ParamsContext) {
  try {
    const id = await getSellerId(context.params);
    const seller = await db.user.findUnique({
      where: {
        id,
      },
      include: {
        farmerProfile: true,
      },
    });

    if (!seller) {
      return NextResponse.json(
        {
          data: null,
          message: "Seller not found",
        },
        { status: 404 }
      );
    }

    return NextResponse.json(seller);
  } catch (error) {
    return NextResponse.json(
      {
        message: "Failed to fetch seller",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

export async function DELETE(_request: NextRequest, context: ParamsContext) {
  try {
    const id = await getSellerId(context.params);
    const existingSeller = await db.user.findUnique({
      where: {
        id,
      },
      select: { id: true },
    });

    if (!existingSeller) {
      return NextResponse.json(
        {
          data: null,
          message: "Seller not found",
        },
        { status: 404 }
      );
    }

    const deletedSeller = await db.user.delete({
      where: {
        id,
      },
    });

    return NextResponse.json(deletedSeller);
  } catch (error) {
    return NextResponse.json(
      {
        message: "Failed to delete seller",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest, context: ParamsContext) {
  try {
    const id = await getSellerId(context.params);
    const payload = await request.json();
    const parsedInput = SellerStatusUpdateSchema.safeParse(payload);

    if (!parsedInput.success) {
      return NextResponse.json(
        {
          message: "Invalid seller payload",
          errors: parsedInput.error.flatten(),
        },
        { status: 400 }
      );
    }

    const existingSeller = await db.user.findUnique({
      where: {
        id,
      },
      include: {
        farmerProfile: true,
      },
    });

    if (!existingSeller) {
      return NextResponse.json(
        {
          data: null,
          message: "Seller not found",
        },
        { status: 404 }
      );
    }

    const input = parsedInput.data;
    const userData: Prisma.UserUpdateInput = {};

    if (input.status !== undefined) userData.status = input.status;
    if (input.emailVerified !== undefined) {
      userData.emailVerified = input.emailVerified;
    }

    if (input.profile !== undefined) {
      const createProfileData = buildSellerProfileCreateData(input.profile);
      const updateProfileData = buildSellerProfileUpdateData(input.profile);
      userData.farmerProfile = {
        upsert: {
          create: {
            ...createProfileData,
          },
          update: updateProfileData,
        },
      };
    }

    const updatedSeller = await db.user.update({
      where: {
        id,
      },
      data: userData,
      include: {
        farmerProfile: true,
      },
    });

    return NextResponse.json(updatedSeller);
  } catch (error) {
    return NextResponse.json(
      {
        message: "Failed to update seller",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
