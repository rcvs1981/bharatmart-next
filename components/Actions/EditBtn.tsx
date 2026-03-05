import { Pencil } from "lucide-react";
import Link from "next/link";

type EditBtnProps = {
  editEndpoint: string;
  title: string;
};

function normalizeEditEndpoint(editEndpoint: string): string {
  return editEndpoint.replace(/^\/+/, "").replace(/^dashboard\/+/, "");
}

export default function EditBtn({ editEndpoint, title }: EditBtnProps) {
  const normalizedEndpoint = normalizeEditEndpoint(editEndpoint);

  return (
    <Link
      href={`/dashboard/${normalizedEndpoint}`}
      className="flex items-center text-lime-600"
    >
      <Pencil className="mr-2 w-4 h-4" />
      <span>Edit {title}</span>
    </Link>
  );
}
