import { Prisma } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";

import { db } from "@/lib/db";
import {
  CustomerIdParamSchema,
  CustomerProfileInput,
  CustomerUpdateInputSchema,
} from "@/lib/schemas/customer";

type ParamsContext = {
  params: Promise<{ id: string }>;
};

async function getCustomerId(paramsPromise: ParamsContext["params"]) {
  const params = await paramsPromise;
  return CustomerIdParamSchema.parse(params).id;
}

function buildProfileCreateData(
  input: CustomerProfileInput
): Prisma.UserProfileCreateWithoutUserInput {
  const data: Prisma.UserProfileCreateWithoutUserInput = {};

  if (input.name !== undefined) data.name = input.name;
  if (input.firstName !== undefined) data.firstName = input.firstName;
  if (input.lastName !== undefined) data.lastName = input.lastName;
  if (input.email !== undefined) data.email = input.email;
  if (input.username !== undefined) data.username = input.username;
  if (input.phone !== undefined) data.phone = input.phone;
  if (input.streetAddress !== undefined) data.streetAddress = input.streetAddress;
  if (input.city !== undefined) data.city = input.city;
  if (input.country !== undefined) data.country = input.country;
  if (input.district !== undefined) data.district = input.district;
  if (input.dateOfBirth !== undefined) data.dateOfBirth = input.dateOfBirth;
  if (input.profileImage !== undefined) data.profileImage = input.profileImage;

  return data;
}

function buildProfileUpdateData(
  input: CustomerProfileInput
): Prisma.UserProfileUpdateWithoutUserInput {
  const data: Prisma.UserProfileUpdateWithoutUserInput = {};

  if (input.name !== undefined) data.name = input.name;
  if (input.firstName !== undefined) data.firstName = input.firstName;
  if (input.lastName !== undefined) data.lastName = input.lastName;
  if (input.email !== undefined) data.email = input.email;
  if (input.username !== undefined) data.username = input.username;
  if (input.phone !== undefined) data.phone = input.phone;
  if (input.streetAddress !== undefined) data.streetAddress = input.streetAddress;
  if (input.city !== undefined) data.city = input.city;
  if (input.country !== undefined) data.country = input.country;
  if (input.district !== undefined) data.district = input.district;
  if (input.dateOfBirth !== undefined) data.dateOfBirth = input.dateOfBirth;
  if (input.profileImage !== undefined) data.profileImage = input.profileImage;

  return data;
}

export async function GET(_request: NextRequest, context: ParamsContext) {
  try {
    const id = await getCustomerId(context.params);
    const customer = await db.user.findFirst({
      where: {
        id,
        role: "USER",
      },
      include: {
        profile: true,
      },
    });

    if (!customer) {
      return NextResponse.json(
        {
          data: null,
          message: "Customer not found",
        },
        { status: 404 }
      );
    }

    return NextResponse.json(customer);
  } catch (error) {
    return NextResponse.json(
      {
        message: "Failed to fetch customer",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

export async function DELETE(_request: NextRequest, context: ParamsContext) {
  try {
    const id = await getCustomerId(context.params);
    const existingCustomer = await db.user.findFirst({
      where: {
        id,
        role: "USER",
      },
      select: { id: true },
    });

    if (!existingCustomer) {
      return NextResponse.json(
        {
          data: null,
          message: "Customer not found",
        },
        { status: 404 }
      );
    }

    const deletedCustomer = await db.user.delete({
      where: {
        id,
      },
    });

    return NextResponse.json(deletedCustomer);
  } catch (error) {
    return NextResponse.json(
      {
        message: "Failed to delete customer",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest, context: ParamsContext) {
  try {
    const id = await getCustomerId(context.params);
    const payload = await request.json();
    const parsedInput = CustomerUpdateInputSchema.safeParse(payload);

    if (!parsedInput.success) {
      return NextResponse.json(
        {
          message: "Invalid customer payload",
          errors: parsedInput.error.flatten(),
        },
        { status: 400 }
      );
    }

    const existingCustomer = await db.user.findFirst({
      where: {
        id,
        role: "USER",
      },
      select: {
        id: true,
        email: true,
      },
    });

    if (!existingCustomer) {
      return NextResponse.json(
        {
          data: null,
          message: "Customer not found",
        },
        { status: 404 }
      );
    }

    const input = parsedInput.data;
    if (input.email && input.email !== existingCustomer.email) {
      const existingEmailUser = await db.user.findUnique({
        where: { email: input.email },
        select: { id: true },
      });
      if (existingEmailUser && existingEmailUser.id !== id) {
        return NextResponse.json(
          {
            message: "Email is already used by another account",
          },
          { status: 409 }
        );
      }
    }

    const data: Prisma.UserUpdateInput = {};

    if (input.name !== undefined) data.name = input.name;
    if (input.email !== undefined) data.email = input.email;
    if (input.status !== undefined) data.status = input.status;
    if (input.emailVerified !== undefined) data.emailVerified = input.emailVerified;

    if (input.profile !== undefined) {
      const createData = buildProfileCreateData(input.profile);
      const updateData = buildProfileUpdateData(input.profile);

      data.profile = {
        upsert: {
          create: createData,
          update: updateData,
        },
      };
    }

    const updatedCustomer = await db.user.update({
      where: { id },
      data,
      include: {
        profile: true,
      },
    });

    return NextResponse.json(updatedCustomer);
  } catch (error) {
    return NextResponse.json(
      {
        message: "Failed to update customer",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
