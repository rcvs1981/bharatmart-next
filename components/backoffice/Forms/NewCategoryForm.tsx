"use client";
import ImageInput from "@/components/FormInputs/ImageInput";
import SelectInput from "@/components/FormInputs/SelectInput";
import SubmitButton from "@/components/FormInputs/SubmitButton";
import TextareaInput from "@/components/FormInputs/TextAreaInput";
import TextInput from "@/components/FormInputs/TextInput";
import ToggleInput from "@/components/FormInputs/ToggleInput";
import { makePostRequest, makePutRequest } from "@/lib/apiRequest";
import { generateSlug } from "@/lib/generateSlug";
import { useRouter } from "next/navigation";

import React, { useState } from "react";
import { useForm } from "react-hook-form";

type ParentCategoryOption = {
  id: string;
  title: string;
};

type CategoryFormInput = {
  id?: string;
  title?: string;
  slug?: string;
  imageUrl?: string | null;
  description?: string | null;
  isActive?: boolean;
  parentId?: string | null;
  parent?: {
    id: string;
  } | null;
};

type NewCategoryFormProps = {
  updateData?: Partial<CategoryFormInput>;
  parentCategories?: ParentCategoryOption[];
};

export default function NewCategoryForm({
  updateData = {},
  parentCategories = [],
}: NewCategoryFormProps) {
  const initialImageUrl = updateData?.imageUrl ?? "";
  const id = updateData?.id ?? "";
  const initialParentId = updateData?.parentId ?? updateData?.parent?.id ?? "";
  const [imageUrl, setImageUrl] = useState(initialImageUrl);

  const parentOptions = [
    { id: "", title: "Main Category (No Parent)" },
    ...parentCategories.filter((category) => category.id !== id),
  ];

  const [loading, setLoading] = useState(false);
  const {
    register,
    reset,
    watch,
    handleSubmit,
    formState: { errors },
  } = useForm<CategoryFormInput>({
    defaultValues: {
      ...updateData,
      isActive: updateData?.isActive ?? true,
      parentId: initialParentId,
    },
  });
  const isActive = watch("isActive");
  const router = useRouter();
  function redirect() {
    router.push("/dashboard/categories");
  }
  async function onSubmit(data: CategoryFormInput) {
    if (!data.title) return;
    const slug = generateSlug(data.title);
    data.slug = slug;
    data.imageUrl = imageUrl;
    data.parentId = data.parentId || null;
    console.log(data);
    if (id) {
      data.id = id;
      // Make Put Request (Update)
      makePutRequest(
        setLoading,
        `api/categories/${id}`,
        data,
        "Category",
        redirect
      );
      console.log("update Request: ", data);
    } else {
      //Make Post Request (Create)
      makePostRequest(
        setLoading,
        "api/categories",
        data,
        "Category",
        reset,
        redirect
      );
      setImageUrl("");
    }
  }
  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="w-full max-w-4xl p-4 bg-white border border-gray-200 rounded-lg shadow sm:p-6 md:p-8 dark:bg-gray-800 dark:border-gray-700 mx-auto my-3 "
    >
      <div className="grid gap-4 sm:grid-cols-2 sm:gap-6">
        <TextInput
          label="Category Title"
          name="title"
          register={register}
          errors={errors}
        />

        <TextareaInput
          label="Category Description"
          name="description"
          register={register}
          errors={errors}
        />
        <SelectInput
          label="Parent Category (Optional)"
          name="parentId"
          register={register}
          options={parentOptions}
        />
        <ImageInput
          imageUrl={imageUrl}
          setImageUrl={setImageUrl}
          endpoint="categoryImageUploader"
          label="Category Image"
        />
        <ToggleInput
          label="Publish your Category"
          name="isActive"
          trueTitle="Active"
          falseTitle="Draft"
          register={register}
        />
      </div>

      <SubmitButton
        isLoading={loading}
        buttonTitle={id ? "Update Category" : "Create Category"}
        loadingButtonTitle={`${
          id ? "Updating" : "Creating"
        } Category please wait...`}
      />
    </form>
  );
}
