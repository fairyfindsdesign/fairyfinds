'use server';

import { revalidatePath } from 'next/cache';
import {
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
  createServerOrder,
  confirmServerOrder,
  updateServerOrderStatus,
  deleteServerOrder,
} from '@/lib/data/server-store';
import { Category, Collection, CustomerReview, HomepageSection, NavItem, Order, OrderStatus, Product, SeoConfig, StoreSettings } from '@/lib/types';
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
    revalidatePath('/admin/orders', 'page');
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

// --- Orders Management Actions ---

/**
 * Public action invoked when customer submits order on the checkout bag page.
 * Creates an order record with status 'PENDING' and returns the generated order reference.
 */
export async function placeOrderAction(orderData: Partial<Order>) {
  try {
    const order = await createServerOrder(orderData);
    purgeStorefrontCache();
    revalidatePath('/admin/orders', 'page');
    revalidatePath('/admin', 'layout');
    return { success: true, order };
  } catch (err: any) {
    console.error('placeOrderAction error:', err);
    return { success: false, error: err?.message || 'Failed to place order.' };
  }
}

/**
 * Admin action to manually confirm an order, making it a verified Valid Order.
 * Optionally decrements variant inventory to prevent overselling.
 */
export async function confirmOrderAction(
  orderId: string,
  notes?: string,
  deductStock: boolean = true
) {
  try {
    await assertAdmin();
    const order = await confirmServerOrder(orderId, notes, deductStock);
    purgeStorefrontCache();
    revalidatePath('/admin/orders', 'page');
    revalidatePath('/admin/products', 'page');
    revalidatePath('/admin', 'layout');
    return { success: true, order };
  } catch (err: any) {
    console.error('confirmOrderAction error:', err);
    return { success: false, error: err?.message || 'Database error confirming order' };
  }
}

/**
 * Admin action to update order status (e.g. COMPLETED or back to PENDING).
 */
export async function updateOrderStatusAction(
  orderId: string,
  status: OrderStatus,
  notes?: string
) {
  try {
    await assertAdmin();
    const order = await updateServerOrderStatus(orderId, status, notes);
    purgeStorefrontCache();
    revalidatePath('/admin/orders', 'page');
    revalidatePath('/admin', 'layout');
    return { success: true, order };
  } catch (err: any) {
    console.error('updateOrderStatusAction error:', err);
    return { success: false, error: err?.message || 'Database error updating order status' };
  }
}

/**
 * Admin action to cancel or delete an order.
 * Per user request: when an order is cancelled/deleted, it is removed from the database log.
 */
export async function cancelAndDeleteOrderAction(orderId: string, restoreStock: boolean = true) {
  try {
    await assertAdmin();
    const deleted = await deleteServerOrder(orderId, restoreStock);
    purgeStorefrontCache();
    revalidatePath('/admin/orders', 'page');
    revalidatePath('/admin/products', 'page');
    revalidatePath('/admin', 'layout');
    return { success: true, deleted };
  } catch (err: any) {
    console.error('cancelAndDeleteOrderAction error:', err);
    return { success: false, error: err?.message || 'Database error removing order' };
  }
}

/**
 * Admin action to manually log an order received offline, in-person, or via direct phone/WhatsApp.
 */
export async function createManualOrderAction(orderData: Partial<Order>) {
  try {
    await assertAdmin();
    const order = await createServerOrder(orderData);
    purgeStorefrontCache();
    revalidatePath('/admin/orders', 'page');
    revalidatePath('/admin', 'layout');
    return { success: true, order };
  } catch (err: any) {
    console.error('createManualOrderAction error:', err);
    return { success: false, error: err?.message || 'Database error creating manual order' };
  }
}


