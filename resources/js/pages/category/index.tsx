import { PlaceholderPattern } from "@/components/ui/placeholder-pattern";
import { dashboard } from "@/routes";
import { Head } from "@inertiajs/react";

interface ICategory {
  id: number;
  name: string;
  desc: string;
}

export default function index({ categories }: { categories: ICategory[] }) {
  return (
    <>
      <Head title="Categories" />

    </>
  );
}

index.layout = {
  breadcrumbs: [
    {
      title: 'Dashboard',
      href: dashboard(),
    },
  ],
};
