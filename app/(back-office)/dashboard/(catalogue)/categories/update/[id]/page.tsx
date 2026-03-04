import FormHeader from "@/components/backoffice/FormHeader";
import NewCategoryForm from "@/components/backoffice/Forms/NewCategoryForm";
import { getData } from "@/lib/getData";
import React from "react";

type UpdateCategoryPageProps = {
  params: Promise<{ id: string }>;
};

export default async function UpdateCategory({ params }: UpdateCategoryPageProps) {
  const { id } = await params;
  const category = await getData<any>(`categories/${id}`);
  const parentCategories = await getData<Array<{ id: string; title: string }>>(
    "categories?roots=true"
  );

  return (
    <div>
      <FormHeader title="Update category" />
      <NewCategoryForm
        updateData={category}
        parentCategories={parentCategories}
      />
    </div>
  );
}
