import FormHeader from "@/components/backoffice/FormHeader";
import NewCategoryForm from "@/components/backoffice/Forms/NewCategoryForm";
import { getData } from "@/lib/getData";

export default async function NewCategory() {
  const parentCategories = await getData<Array<{ id: string; title: string }>>(
    "categories?roots=true"
  );

  return (
    <div>
      <FormHeader title="New category" />
      <NewCategoryForm parentCategories={parentCategories} />
    </div>
  );
}
