import { redirect } from 'next/navigation';

interface CategoriesRedirectProps {
  params: Promise<{
    slug: string;
  }>;
}

export default async function CategoriesRedirect({ params }: CategoriesRedirectProps) {
  const { slug } = await params;
  redirect(`/category/${slug}`);
}
