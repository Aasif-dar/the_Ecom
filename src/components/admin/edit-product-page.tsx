"use client";

import Link from "next/link";
import { PackageX } from "lucide-react";
import { ProductForm } from "@/components/admin/product-form";
import { buttonVariants } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { useProductById } from "@/store/hooks";

export function EditProductPage({ id }: { id: string }) {
  const product = useProductById(id);
  if (!product) {
    return (
      <EmptyState
        icon={PackageX}
        title="Product not found"
        body="It may have been deleted. Head back to the product list."
        actions={
          <Link href="/admin/products" className={buttonVariants({ size: "lg" })}>
            All products
          </Link>
        }
      />
    );
  }
  // key resets the form when navigating between products
  return <ProductForm key={product.id} product={product} />;
}
