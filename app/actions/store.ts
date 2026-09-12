'use server';

import { revalidatePath } from 'next/cache';
import {
  updateServerSettings,
  saveServerProduct,
  deleteServerProduct,
  saveServerCollection,
  deleteServerCollection,
  reorderServerSections,
  toggleServerSectionVisibility,
  updateServerSectionContent,
  updateServerNavigation,
  updateServerReviews,
} from '@/lib/data/server-store';
import { Collection, CustomerReview, NavItem, Product, StoreSettings } from '@/lib/types';

/**
 * Purges both layout and individual route caches to ensure
 * instantaneous reflection of CMS updates without requiring manual browser cache bypass.
 */
function purgeStorefrontCache() {
  try {
    revalidatePath('/', 'layout');
    revalidatePath('/', 'page');
    revalidatePath('/shop', 'page');
    revalidatePath('/cart', 'page');
    revalidatePath('/contact', 'page');
    revalidatePath('/about', 'page');
    revalidatePath('/custom', 'page');
  } catch (err) {
    console.error('Error in purgeStorefrontCache:', err);
  }
}

export async function saveSettingsAction(settings: Partial<StoreSettings>) {
  const result = await updateServerSettings(settings);
  purgeStorefrontCache();
  revalidatePath('/admin/settings', 'page');
  revalidatePath('/admin', 'layout');
  return result;
}

export async function saveNavigationAction(navigation: NavItem[]) {
  const result = await updateServerNavigation(navigation);
  purgeStorefrontCache();
  revalidatePath('/admin/navigation', 'page');
  revalidatePath('/admin', 'layout');
  return result;
}

export async function saveProductAction(product: Partial<Product>) {
  const result = await saveServerProduct(product);
  purgeStorefrontCache();
  if (product.slug) {
    revalidatePath(`/product/${product.slug}`, 'page');
  }
  revalidatePath('/admin/products', 'page');
  revalidatePath('/admin', 'layout');
  return result;
}

export async function deleteProductAction(id: string) {
  const result = await deleteServerProduct(id);
  purgeStorefrontCache();
  revalidatePath('/admin/products', 'page');
  revalidatePath('/admin', 'layout');
  return result;
}

export async function saveCollectionAction(collection: Partial<Collection>) {
  const result = await saveServerCollection(collection);
  purgeStorefrontCache();
  if (collection.slug) {
    revalidatePath(`/collections/${collection.slug}`, 'page');
  }
  revalidatePath('/admin/collections', 'page');
  revalidatePath('/admin', 'layout');
  return result;
}

export async function deleteCollectionAction(id: string) {
  const result = await deleteServerCollection(id);
  purgeStorefrontCache();
  revalidatePath('/admin/collections', 'page');
  revalidatePath('/admin', 'layout');
  return result;
}

export async function reorderSectionsAction(orderedIds: string[]) {
  const result = await reorderServerSections(orderedIds);
  purgeStorefrontCache();
  revalidatePath('/admin/homepage', 'page');
  revalidatePath('/admin', 'layout');
  return result;
}

export async function toggleSectionVisibilityAction(id: string, isVisible: boolean) {
  const result = await toggleServerSectionVisibility(id, isVisible);
  purgeStorefrontCache();
  revalidatePath('/admin/homepage', 'page');
  revalidatePath('/admin', 'layout');
  return result;
}

export async function updateSectionContentAction(id: string, content: any) {
  const result = await updateServerSectionContent(id, content);
  purgeStorefrontCache();
  revalidatePath('/admin/homepage', 'page');
  revalidatePath('/admin', 'layout');
  return result;
}

export async function saveReviewsAction(reviews: CustomerReview[]) {
  const result = await updateServerReviews(reviews);
  purgeStorefrontCache();
  revalidatePath('/admin/reviews', 'page');
  revalidatePath('/admin', 'layout');
  return result;
}

