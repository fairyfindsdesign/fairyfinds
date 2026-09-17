import {
  getServerSettings,
  updateServerSettings,
  getServerProducts,
  getServerProductBySlug,
  saveServerProduct,
  deleteServerProduct,
  getServerCategories,
  saveServerCategory,
  deleteServerCategory,
  getServerCollections,
  getServerCollectionBySlug,
  saveServerCollection,
  deleteServerCollection,
  getServerHomepageSections,
  reorderServerSections,
  toggleServerSectionVisibility,
  updateServerSectionContent,
  getServerNavigation,
  updateServerNavigation,
  getServerReviews,
  updateServerReviews,
  updateServerSeoConfig,
  checkSupabaseSeoStatus,
  checkSupabaseOrdersStatus,
  getServerOrders,
  getServerOrderById,
  createServerOrder,
  confirmServerOrder,
  updateServerOrderStatus,
  deleteServerOrder,
} from './server-store';
import { Order, OrderStatus } from '../types';

export async function getNavigation() {
  return getServerNavigation();
}

export async function updateNavigation(navigation: any) {
  return updateServerNavigation(navigation);
}

export async function getSettings() {
  return getServerSettings();
}

export async function updateSettings(settings: any) {
  return updateServerSettings(settings);
}

export async function getProducts() {
  return getServerProducts();
}

export async function getProductBySlug(slug: string) {
  return getServerProductBySlug(slug);
}

export async function saveProduct(product: any) {
  return saveServerProduct(product);
}

export async function deleteProduct(id: string) {
  return deleteServerProduct(id);
}

export async function getCategories() {
  return getServerCategories();
}

export async function saveCategory(category: any) {
  return saveServerCategory(category);
}

export async function deleteCategory(id: string) {
  return deleteServerCategory(id);
}

export async function getCollections() {
  return getServerCollections();
}

export async function getCollectionBySlug(slug: string) {
  return getServerCollectionBySlug(slug);
}

export async function saveCollection(collection: any) {
  return saveServerCollection(collection);
}

export async function deleteCollection(id: string) {
  return deleteServerCollection(id);
}

export async function getHomepageSections() {
  return getServerHomepageSections();
}

export async function reorderSections(orderedIds: string[]) {
  return reorderServerSections(orderedIds);
}

export async function toggleSectionVisibility(id: string, is_visible: boolean) {
  return toggleServerSectionVisibility(id, is_visible);
}

export async function updateSectionContent(id: string, content: any) {
  return updateServerSectionContent(id, content);
}

export async function getReviews() {
  return getServerReviews();
}

export async function updateReviews(reviews: any) {
  return updateServerReviews(reviews);
}

export async function getSeoConfig() {
  const settings = await getServerSettings();
  return settings.seo_config;
}

export async function updateSeoConfig(seoConfig: any) {
  return updateServerSeoConfig(seoConfig);
}

export async function checkSeoDbStatus() {
  return checkSupabaseSeoStatus();
}

export async function checkOrdersDbStatus() {
  return checkSupabaseOrdersStatus();
}

export async function getOrders(): Promise<Order[]> {
  return getServerOrders();
}

export async function getOrderById(id: string): Promise<Order | null> {
  return getServerOrderById(id);
}

export async function createOrder(orderData: Partial<Order>): Promise<Order> {
  return createServerOrder(orderData);
}

export async function confirmOrder(
  id: string,
  confirmationNotes?: string,
  deductStock: boolean = true
): Promise<Order> {
  return confirmServerOrder(id, confirmationNotes, deductStock);
}

export async function updateOrderStatus(
  id: string,
  status: OrderStatus,
  notes?: string
): Promise<Order> {
  return updateServerOrderStatus(id, status, notes);
}

export async function deleteOrder(id: string, restoreStock: boolean = true): Promise<boolean> {
  return deleteServerOrder(id, restoreStock);
}
