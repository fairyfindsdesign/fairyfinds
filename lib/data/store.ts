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
  getServerSizeCharts,
  getServerSizeChartById,
  saveServerSizeChart,
  deleteServerSizeChart,
  getServerCustomDesigns,
  saveServerCustomDesign,
  deleteServerCustomDesign,
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

export async function getSizeCharts() {
  return getServerSizeCharts();
}

export async function getSizeChartById(id: string) {
  return getServerSizeChartById(id);
}

export async function saveSizeChart(chart: any) {
  return saveServerSizeChart(chart);
}

export async function deleteSizeChart(id: string) {
  return deleteServerSizeChart(id);
}

export async function getCustomDesigns() {
  return getServerCustomDesigns();
}

export async function saveCustomDesign(design: any) {
  return saveServerCustomDesign(design);
}

export async function deleteCustomDesign(id: string) {
  return deleteServerCustomDesign(id);
}



