'use server';

import { revalidatePath } from 'next/cache';
import {
  clearStoreMemoryCache,
  updateServerSettings,
  saveServerProduct,
  deleteServerProduct,
  saveServerCategory,
  deleteServerCategory,
  saveServerCollection,
  deleteServerCollection,
  reorderServerSections,
  toggleServerSectionVisibility,
  updateServerSectionContent,
  updateServerNavigation,
  updateServerReviews,
  updateServerSeoConfig,
  saveServerSizeChart,
  deleteServerSizeChart,
  saveServerCustomDesign,
  deleteServerCustomDesign,
} from '@/lib/data/server-store';
import { Category, Collection, CustomerReview, CustomDesign, HomepageSection, NavItem, Product, SeoConfig, SizeChart, StoreSettings } from '@/lib/types';
import { checkAdminSession } from './auth';

async function assertAdmin() {
  const isAuthed = await checkAdminSession();
  if (!isAuthed) {
    throw new Error('Unauthorized: Valid admin authentication required to perform this action.');
  }
}

/**
 * Purges both layout and individual route caches to ensure
 * instantaneous reflection of CMS updates without requiring manual browser cache bypass.
 */
function purgeStorefrontCache() {
  try {
    clearStoreMemoryCache();
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
    revalidatePath('/admin/categories', 'page');
    revalidatePath('/admin/collections', 'page');
    revalidatePath('/admin/settings', 'page');
    revalidatePath('/admin/navigation', 'page');
    revalidatePath('/admin/reviews', 'page');
    revalidatePath('/admin/seo', 'page');
    revalidatePath('/sitemap.xml');
    revalidatePath('/robots.txt');
  } catch (err) {
    console.error('Error in purgeStorefrontCache:', err);
  }
}

export async function saveSettingsAction(settings: Partial<StoreSettings>) {
  try {
    await assertAdmin();
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

export async function saveSeoConfigAction(seoConfig: Partial<SeoConfig>) {
  try {
    await assertAdmin();
    const result = await updateServerSeoConfig(seoConfig);
    purgeStorefrontCache();
    revalidatePath('/admin/seo', 'page');
    revalidatePath('/admin', 'layout');
    return { success: true, seoConfig: result };
  } catch (err: any) {
    console.error('saveSeoConfigAction error:', err);
    return { success: false, error: err?.message || 'Database error updating SEO configuration' };
  }
}

export async function saveNavigationAction(navigation: NavItem[]) {
  try {
    await assertAdmin();
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
    await assertAdmin();
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
    await assertAdmin();
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

export async function saveCategoryAction(category: Partial<Category>) {
  try {
    await assertAdmin();
    const result = await saveServerCategory(category);
    purgeStorefrontCache();
    revalidatePath('/admin/categories', 'page');
    revalidatePath('/admin/products', 'page');
    revalidatePath('/admin/products/new', 'page');
    revalidatePath('/admin', 'layout');
    revalidatePath('/shop', 'page');
    revalidatePath('/', 'page');
    return { success: true, category: result };
  } catch (err: any) {
    console.error('saveCategoryAction error:', err);
    return { success: false, error: err?.message || 'Database error saving category' };
  }
}

export async function deleteCategoryAction(id: string) {
  try {
    await assertAdmin();
    const result = await deleteServerCategory(id);
    purgeStorefrontCache();
    revalidatePath('/admin/categories', 'page');
    revalidatePath('/admin/products', 'page');
    revalidatePath('/admin', 'layout');
    revalidatePath('/shop', 'page');
    revalidatePath('/', 'page');
    return { success: true };
  } catch (err: any) {
    console.error('deleteCategoryAction error:', err);
    return { success: false, error: err?.message || 'Database error deleting category' };
  }
}

export async function saveCollectionAction(collection: Partial<Collection>) {
  try {
    await assertAdmin();
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
    await assertAdmin();
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
    await assertAdmin();
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
    await assertAdmin();
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
    await assertAdmin();
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
    await assertAdmin();
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

export async function saveSizeChartAction(chart: Partial<SizeChart>) {
  try {
    await assertAdmin();
    const result = await saveServerSizeChart(chart);
    purgeStorefrontCache();
    revalidatePath('/admin/size-charts', 'page');
    revalidatePath('/admin/products', 'page');
    return { success: true, chart: result };
  } catch (err: any) {
    console.error('saveSizeChartAction error:', err);
    return { success: false, error: err?.message || 'Error saving size chart' };
  }
}

export async function deleteSizeChartAction(id: string) {
  try {
    await assertAdmin();
    await deleteServerSizeChart(id);
    purgeStorefrontCache();
    revalidatePath('/admin/size-charts', 'page');
    revalidatePath('/admin/products', 'page');
    return { success: true };
  } catch (err: any) {
    console.error('deleteSizeChartAction error:', err);
    return { success: false, error: err?.message || 'Error deleting size chart' };
  }
}

export async function saveCustomDesignAction(design: Partial<CustomDesign>) {
  try {
    await assertAdmin();
    const result = await saveServerCustomDesign(design);
    purgeStorefrontCache();
    revalidatePath('/admin/custom-designs', 'page');
    revalidatePath('/custom', 'page');
    revalidatePath('/', 'page');
    return { success: true, design: result };
  } catch (err: any) {
    console.error('saveCustomDesignAction error:', err);
    return { success: false, error: err?.message || 'Error saving custom design' };
  }
}

export async function deleteCustomDesignAction(id: string) {
  try {
    await assertAdmin();
    await deleteServerCustomDesign(id);
    purgeStorefrontCache();
    revalidatePath('/admin/custom-designs', 'page');
    revalidatePath('/custom', 'page');
    revalidatePath('/', 'page');
    return { success: true };
  } catch (err: any) {
    console.error('deleteCustomDesignAction error:', err);
    return { success: false, error: err?.message || 'Error deleting custom design' };
  }
}


