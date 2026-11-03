const fs = require('fs');
const path = require('path');

// 1. Clean src/services/products.ts
const prodPath = path.join(__dirname, 'src', 'services', 'products.ts');
let prodContent = fs.readFileSync(prodPath, 'utf8');

// Replace getProducts
prodContent = prodContent.replace(
  /export async function getProducts\(params: GetProductsParams = \{\}\): Promise<ApiProduct\[\]> \{[\s\S]*?return filtered;\s*\}\s*\}/,
  `export async function getProducts(params: GetProductsParams = {}): Promise<ApiProduct[]> {
  try {
    const search = new URLSearchParams();
    if (params.skip != null) search.set("skip", String(params.skip));
    if (params.limit != null) search.set("limit", String(params.limit));
    if (params.shopId) search.set("shop_id", params.shopId);
    if (params.hideExpired === false) {
      search.set("hide_expired", "false");
    }
    if (params.q) search.set("q", params.q);
    if (params.category) search.set("category", params.category);
    if (params.lat != null) search.set("lat", String(params.lat));
    if (params.lng != null) search.set("lng", String(params.lng));
    if (params.radius_km != null) search.set("radius_km", String(params.radius_km));
    
    const qs = search.toString();
    const path = qs ? \`/products/?\${qs}\` : "/products/";
    const res = await apiRequest<ApiProduct[]>(path);
    return Array.isArray(res) ? res : [];
  } catch {
    return [];
  }
}`
);

// Replace getRecommendedProducts
prodContent = prodContent.replace(
  /export async function getRecommendedProducts\(\): Promise<ApiProduct\[\]> \{[\s\S]*?return FALLBACK_SURPLUS_PRODUCTS\.slice\(0, 4\);\s*\}\s*\}/,
  `export async function getRecommendedProducts(): Promise<ApiProduct[]> {
  try {
    const res = await apiRequest<ApiProduct[]>("/products/recommended");
    return Array.isArray(res) ? res : [];
  } catch {
    return [];
  }
}`
);

// Replace getDeepSearchResults
prodContent = prodContent.replace(
  /export async function getDeepSearchResults\(params: DeepSearchParams\): Promise<ApiDeepSearchResponse> \{[\s\S]*?products: matches,\s*\}\s*;\s*\}\s*\}/,
  `export async function getDeepSearchResults(params: DeepSearchParams): Promise<ApiDeepSearchResponse> {
  try {
    const search = new URLSearchParams();
    if (params.q) search.set("q", params.q);
    if (params.semantic) search.set("semantic", "true");
    if (params.recipeMode) search.set("recipe_mode", "true");
    if (params.maxPrice != null) search.set("max_price", String(params.maxPrice));
    if (params.minDiscountPct != null) search.set("min_discount_pct", String(params.minDiscountPct));
    if (params.expiryUrgency) search.set("expiry_urgency", params.expiryUrgency);
    if (params.lat != null) search.set("lat", String(params.lat));
    if (params.lng != null) search.set("lng", String(params.lng));
    if (params.radiusKm != null) search.set("radius_km", String(params.radiusKm));

    const qs = search.toString();
    const path = qs ? \`/products/search/deep?\${qs}\` : "/products/search/deep";
    return await apiRequest<ApiDeepSearchResponse>(path);
  } catch {
    return {
      recipe_mode: false,
      products: [],
    };
  }
}`
);

// Remove FALLBACK_SURPLUS_PRODUCTS definition
prodContent = prodContent.replace(
  /\n\s*export const FALLBACK_SURPLUS_PRODUCTS: ApiProduct\[\] = \[[\s\S]*?\];\s*/,
  '\n'
);

fs.writeFileSync(prodPath, prodContent, 'utf8');
console.log('1. Cleared demo products from src/services/products.ts');

// 2. Clean src/services/shops.ts
const shopsPath = path.join(__dirname, 'src', 'services', 'shops.ts');
let shopsContent = fs.readFileSync(shopsPath, 'utf8');

shopsContent = shopsContent.replace(
  /export async function getMyShop\(\): Promise<ShopWithDescription> \{[\s\S]*?deal_count: 6,\s*\}\s*;\s*\}\s*\}/,
  `export async function getMyShop(): Promise<ShopWithDescription> {
  return apiRequest<ShopWithDescription>("/shops/me");
}`
);

fs.writeFileSync(shopsPath, shopsContent, 'utf8');
console.log('2. Cleared demo shop from src/services/shops.ts');

