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
    revalidatePath('/collections', 'layout');
    revalidatePath('/collections/[slug]', 'page');
    revalidatePath('/product/[slug]', 'page');
    revalidatePath('/admin', 'layout');
    revalidatePath('/admin/homepage', 'page');
    revalidatePath('/admin/products', 'page');
    revalidatePath('/admin/collections', 'page');
    revalidatePath('/admin/settings', 'page');
    revalidatePath('/admin/navigation', 'page');
    revalidatePath('/admin/reviews', 'page');
  } catch (err) {
    console.error('Error in purgeStorefrontCache:', err);
  }
}

export async function saveSettingsAction(settings: Partial<StoreSettings>) {
  try {
    const result = await updateServerSettings(settings);
    purgeStorefrontCache();
    revalidatePath('/admin/settings', 'page');
    revalidatePath('/admin', 'layout');
    return { success: true, settings: result };
  } catch (err: any) {
    console.error('saveSettingsAction error:', err);
    return { success: false, error: err?.message || 'Database error updating settings' };
  }
}

export async function saveNavigationAction(navigation: NavItem[]) {
  try {
    const result = await updateServerNavigation(navigation);
    purgeStorefrontCache();
    revalidatePath('/admin/navigation', 'page');
    revalidatePath('/admin', 'layout');
    return { success: true, navigation: result };
  } catch (err: any) {
    console.error('saveNavigationAction error:', err);
    return { success: false, error: err?.message || 'Database error updating navigation' };
  }
}

export async function saveProductAction(product: Partial<Product>) {
  try {
    const result = await saveServerProduct(product);
    purgeStorefrontCache();
    const slug = result?.slug || product.slug;
    if (slug) {
      revalidatePath(`/product/${slug}`, 'page');
    }
    revalidatePath('/admin/products', 'page');
    revalidatePath('/admin', 'layout');
    return { success: true, product: result };
  } catch (err: any) {
    console.error('saveProductAction error:', err);
    return { success: false, error: err?.message || 'Database error saving product' };
  }
}

export async function deleteProductAction(id: string) {
  try {
    const result = await deleteServerProduct(id);
    purgeStorefrontCache();
    revalidatePath('/admin/products', 'page');
    revalidatePath('/admin', 'layout');
    return { success: true };
  } catch (err: any) {
    console.error('deleteProductAction error:', err);
    return { success: false, error: err?.message || 'Database error deleting product' };
  }
}

export async function saveCollectionAction(collection: Partial<Collection>) {
  try {
    const result = await saveServerCollection(collection);
    purgeStorefrontCache();
    const slug = result?.slug || collection.slug;
    if (slug) {
      revalidatePath(`/collections/${slug}`, 'page');
    }
    revalidatePath('/admin/collections', 'page');
    revalidatePath('/admin', 'layout');
    return { success: true, collection: result };
  } catch (err: any) {
    console.error('saveCollectionAction error:', err);
    return { success: false, error: err?.message || 'Database error saving collection' };
  }
}

export async function deleteCollectionAction(id: string) {
  try {
    const result = await deleteServerCollection(id);
    purgeStorefrontCache();
    revalidatePath('/admin/collections', 'page');
    revalidatePath('/admin', 'layout');
    return { success: true };
  } catch (err: any) {
    console.error('deleteCollectionAction error:', err);
    return { success: false, error: err?.message || 'Database error deleting collection' };
  }
}

export async function reorderSectionsAction(orderedIds: string[]) {
  try {
    const result = await reorderServerSections(orderedIds);
    purgeStorefrontCache();
    revalidatePath('/admin/homepage', 'page');
    revalidatePath('/admin', 'layout');
    return { success: true, sections: result };
  } catch (err: any) {
    console.error('reorderSectionsAction error:', err);
    return { success: false, error: err?.message || 'Database error reordering sections' };
  }
}

export async function toggleSectionVisibilityAction(id: string, isVisible: boolean) {
  try {
    const result = await toggleServerSectionVisibility(id, isVisible);
    purgeStorefrontCache();
    revalidatePath('/admin/homepage', 'page');
    revalidatePath('/admin', 'layout');
    return { success: true, sections: result };
  } catch (err: any) {
    console.error('toggleSectionVisibilityAction error:', err);
    return { success: false, error: err?.message || 'Database error toggling section visibility' };
  }
}

export async function updateSectionContentAction(id: string, content: any) {
  try {
    const result = await updateServerSectionContent(id, content);
    purgeStorefrontCache();
    revalidatePath('/admin/homepage', 'page');
    revalidatePath('/admin', 'layout');
    return { success: true, sections: result };
  } catch (err: any) {
    console.error('updateSectionContentAction error:', err);
    return { success: false, error: err?.message || 'Database error updating section content' };
  }
}

export async function saveReviewsAction(reviews: CustomerReview[]) {
  try {
    const result = await updateServerReviews(reviews);
    purgeStorefrontCache();
    revalidatePath('/admin/reviews', 'page');
    revalidatePath('/admin', 'layout');
    return { success: true, reviews: result };
  } catch (err: any) {
    console.error('saveReviewsAction error:', err);
    return { success: false, error: err?.message || 'Database error saving reviews' };
  }
}

