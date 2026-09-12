import {
  getServerSettings,
  updateServerSettings,
  getServerProducts,
  getServerProductBySlug,
  saveServerProduct,
  deleteServerProduct,
  getServerCategories,
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
} from './server-store';

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

