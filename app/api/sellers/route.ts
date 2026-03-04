import { Prisma } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";

import { db } from "@/lib/db";
import {
  SellerProfileInput,
  SellerProfileInputSchema,
  SellerQuerySchema,
} from "@/lib/schemas/seller";

function splitFullName(name: string | null | undefined) {
  if (!name) return { firstName: null, lastName: null };
  const trimmed = name.trim();
  if (!trimmed) return { firstName: null, lastName: null };

  const parts = trimmed.split(/\s+/);
  const firstName = parts[0] ?? null;
  const lastName = parts.length > 1 ? parts.slice(1).join(" ") : null;
  return { firstName, lastName };
}

function buildSellerProfileData(input: SellerProfileInput) {
  const splitName = splitFullName(input.name);
  return {
    code: input.code ?? null,
    contactPerson: input.contactPerson ?? null,
    contactPersonPhone: input.contactPersonPhone ?? null,
    profileImageUrl: input.profileImageUrl ?? null,
    firstName: input.firstName ?? splitName.firstName,
    lastName: input.lastName ?? splitName.lastName,
    notes: input.notes ?? null,
    phone: input.phone ?? null,
    physicalAddress: input.physicalAddress ?? null,
    terms: input.terms ?? null,
    isActive: input.isActive ?? true,
    products: input.products ?? [],
    landSize: input.landSize ?? null,
    mainCrop: input.mainCrop ?? null,
  };
}

export async function POST(request: NextRequest) {
  try {
    const payload = await request.json();
    const parsedInput = SellerProfileInputSchema.safeParse(payload);

    if (!parsedInput.success) {
      return NextResponse.json(
        {
          message: "Invalid seller payload",
          errors: parsedInput.error.flatten(),
        },
        { status: 400 }
      );
    }

    const data = parsedInput.data;
    const existingUser = await db.user.findUnique({
      where: {
        id: data.userId,
      },
      select: {
        id: true,
        email: true,
        name: true,
      },
    });

    if (!existingUser) {
      return NextResponse.json(
        {
          data: null,
          message: "No user found",
        },
        { status: 404 }
      );
    }

    if (data.email && data.email !== existingUser.email) {
      const userWithEmail = await db.user.findUnique({
        where: { email: data.email },
        select: { id: true },
      });
      if (userWithEmail && userWithEmail.id !== data.userId) {
        return NextResponse.json(
          {
            message: "Email is already used by another account",
          },
          { status: 409 }
        );
      }
    }

    const profileData = buildSellerProfileData(data);
    const nameFromProfile =
      data.name ??
      [profileData.firstName, profileData.lastName].filter(Boolean).join(" ");

    const seller = await db.$transaction(async (prisma) => {
      await prisma.user.update({
        where: {
          id: data.userId,
        },
        data: {
          emailVerified: true,
          role: "FARMER",
          email: data.email ?? undefined,
          name: nameFromProfile || undefined,
        },
      });

      const sellerProfile = await prisma.farmerProfile.upsert({
        where: {
          userId: data.userId,
        },
        create: {
          ...profileData,
          userId: data.userId,
        },
        update: profileData,
      });

      return sellerProfile;
    });

    return NextResponse.json(seller, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      {
        message: "Failed to create seller profile",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const queryInput = {
      status: request.nextUrl.searchParams.get("status") ?? undefined,
      isActive: request.nextUrl.searchParams.get("isActive") ?? undefined,
    };
    const parsedQuery = SellerQuerySchema.safeParse(queryInput);

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
      role: "FARMER",
    };

    if (parsedQuery.data.status) {
      where.status = parsedQuery.data.status === "true";
    }

    if (parsedQuery.data.isActive) {
      where.farmerProfile = {
        is: {
          isActive: parsedQuery.data.isActive === "true",
        },
      };
    }

    const sellers = await db.user.findMany({
      where,
      orderBy: {
        createdAt: "desc",
      },
      include: {
        farmerProfile: true,
      },
    });

    return NextResponse.json(sellers);
  } catch (error) {
    return NextResponse.json(
      {
        message: "Failed to fetch sellers",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
