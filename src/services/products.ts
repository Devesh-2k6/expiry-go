import { apiRequest } from "@/api/client";
import type { ApiProduct, ApiProductCreate, ProductCategory, ApiFavorite } from "@/types/product";

export type GetProductsParams = {
  skip?: number;
  limit?: number;
  hideExpired?: boolean;
  shopId?: string;
  q?: string;
  category?: ProductCategory;
  lat?: number;
  lng?: number;
  radius_km?: number;
};

export async function getProducts(params: GetProductsParams = {}): Promise<ApiProduct[]> {
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
    const path = qs ? `/products/?${qs}` : "/products/";
    const res = await apiRequest<ApiProduct[]>(path);
    if (Array.isArray(res) && res.length > 0) {
      return res;
    }
    return FALLBACK_SURPLUS_PRODUCTS;
  } catch {
    // If backend offline or tunnel dead, return curated fallback deals
    let filtered = [...FALLBACK_SURPLUS_PRODUCTS];
    if (params.category) {
      filtered = filtered.filter(p => p.category === params.category);
    }
    if (params.q) {
      const q = params.q.toLowerCase();
      filtered = filtered.filter(p => p.name.toLowerCase().includes(q) || p.description?.toLowerCase().includes(q));
    }
    return filtered;
  }
}

export type ApiProductOptimizeRequest = {
  name: string;
  mfg_date: string;
  expiry_date: string;
  original_price: number;
  quantity: number;
};

export type ApiProductOptimizeResponse = {
  suggested_description: string;
  suggested_discount_tier: string;
  suggested_discount_percent: number;
  confidence_score: number;
};

export async function optimizeProductDetails(
  payload: ApiProductOptimizeRequest
): Promise<ApiProductOptimizeResponse> {
  return apiRequest<ApiProductOptimizeResponse>("/products/optimize", {
    method: "POST",
    json: payload,
  });
}

export async function createProduct(product: ApiProductCreate): Promise<ApiProduct> {
  return apiRequest<ApiProduct>("/products/", {
    method: "POST",
    json: product,
  });
}

export async function uploadImage(file: File): Promise<string> {
  const formData = new FormData();
  formData.append("file", file);

  const response = await apiRequest<{ url: string }>("/upload/image", {
    method: "POST",
    body: formData,
    // Note: Don't set Content-Type header when using FormData, fetch does it automatically with boundary
  });
  return response.url;
}

export async function updateProduct(
  productId: string,
  product: ApiProductCreate
): Promise<ApiProduct> {
  return apiRequest<ApiProduct>(`/products/${productId}`, {
    method: "PUT",
    json: product,
  });
}

export async function deleteProduct(productId: string): Promise<void> {
  await apiRequest(`/products/${productId}`, {
    method: "DELETE",
  });
}

// Favorites
export async function addFavorite(productId: string): Promise<ApiFavorite> {
  return apiRequest<ApiFavorite>("/favorites/", {
    method: "POST",
    json: { product_id: productId },
  });
}

export async function removeFavorite(productId: string): Promise<void> {
  await apiRequest(`/favorites/${productId}`, {
    method: "DELETE",
  });
}

export async function getFavorites(): Promise<ApiFavorite[]> {
  try {
    return await apiRequest<ApiFavorite[]>("/favorites/me");
  } catch {
    return [];
  }
}

export async function getRecommendedProducts(): Promise<ApiProduct[]> {
  try {
    const res = await apiRequest<ApiProduct[]>("/products/recommended");
    return Array.isArray(res) && res.length > 0 ? res : FALLBACK_SURPLUS_PRODUCTS.slice(0, 4);
  } catch {
    return FALLBACK_SURPLUS_PRODUCTS.slice(0, 4);
  }
}

export type ApiProductForecast = {
  rescue_probability: number;
  rescue_confidence_tier: "Low" | "Medium" | "High";
  predicted_demand_24h: number;
  predicted_orders_trend: Array<{ hour: string; demand: number }>;
  optimal_discount_percent: number;
  optimal_price: number;
  pricing_explanation: string;
  spoilage_risk_score: "Low" | "Medium" | "High";
  explainability: {
    days_left_impact: number;
    stock_impact: number;
    discount_impact: number;
    category_demand_impact: number;
  };
  sellout_hours: number;
  model_confidence: number;
  demand_score: number;
};

export async function getProductForecast(productId: string): Promise<ApiProductForecast> {
  return apiRequest<ApiProductForecast>(`/products/${productId}/forecast`);
}

export type ApiShopAiInventory = {
  average_rescue_probability: number;
  risk_counts: {
    Low: number;
    Medium: number;
    High: number;
  };
  total_recovered_revenue: number;
  co2_saved_kg: number;
  water_saved_liters: number;
  items_rescued: number;
  predicted_sellout_within_24h: number;
};

export async function getProductAiInsight(productId: string): Promise<ApiProductForecast> {
  return apiRequest<ApiProductForecast>(`/products/${productId}/ai-insight`);
}

export async function getShopAiInventory(): Promise<ApiShopAiInventory> {
  return apiRequest<ApiShopAiInventory>("/shops/me/analytics/ai-inventory");
}

export async function scanProductDates(file: File): Promise<{
  manufacturing_date: string | null;
  expiry_date: string | null;
  confidence_score: number;
  detected_text: string;
}> {
  const formData = new FormData();
  formData.append("file", file);
  return apiRequest<any>("/products/scan-dates", {
    method: "POST",
    body: formData,
  });
}

export async function lookupBarcode(barcode: string): Promise<{
  name: string | null;
  brand: string | null;
  category: ProductCategory | null;
  description: string | null;
}> {
  return apiRequest<any>(`/products/barcode/${barcode}`);
}

export type DeepSearchParams = {
  q?: string;
  semantic?: boolean;
  recipeMode?: boolean;
  maxPrice?: number;
  minDiscountPct?: number;
  expiryUrgency?: string;
  lat?: number;
  lng?: number;
  radiusKm?: number;
};

export type ApiRecipeSearchResponse = {
  recipe_mode: true;
  recipe_name: string;
  ingredients: string[];
  matched_deals: ApiProduct[];
  missing_ingredients: string[];
  estimated_total_cost: number;
  total_savings: number;
};

export type ApiRegularSearchResponse = {
  recipe_mode: false;
  products: ApiProduct[];
};

export type ApiDeepSearchResponse = ApiRecipeSearchResponse | ApiRegularSearchResponse;

export async function getDeepSearchResults(params: DeepSearchParams): Promise<ApiDeepSearchResponse> {
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
    const path = qs ? `/products/search/deep?${qs}` : "/products/search/deep";
    return await apiRequest<ApiDeepSearchResponse>(path);
  } catch {
    const qLower = (params.q || "").toLowerCase();
    const matches = FALLBACK_SURPLUS_PRODUCTS.filter(p => !qLower || p.name.toLowerCase().includes(qLower) || (p.description && p.description.toLowerCase().includes(qLower)));
    return {
      recipe_mode: false,
      products: matches,
    };
  }
}

export type RecipeProductItem = {
  name: string;
  category: string;
  quantity?: number;
};

export type RecipeIngredientItem = {
  name: string;
  is_deal: boolean;
  quantity: string;
};

export type RecipeStep = {
  step_number: number;
  instruction: string;
};

export type ApiRecipeResponse = {
  recipe_name: string;
  description: string;
  prep_time: string;
  cook_time: string;
  difficulty: string;
  ingredients: RecipeIngredientItem[];
  instructions: RecipeStep[];
  waste_saved_summary: string;
};

export async function generateRecipe(products: RecipeProductItem[]): Promise<ApiRecipeResponse> {
  return apiRequest<ApiRecipeResponse>("/products/recipe-generator", {
    method: "POST",
    json: { products },
  });
}

export type ApiVoiceProductParseResponse = {
  success: boolean;
  name: string;
  category: ProductCategory;
  quantity: number;
  original_price: number;
  discount_price: number;
  manufacturing_date: string;
  expiry_date: string;
  description: string;
  image_url?: string | null;
  detected_language: string;
  spoken_summary: string;
  raw_transcript: string;
};

export async function parseVoiceProductListing(
  transcript: string,
  language: string = "auto"
): Promise<ApiVoiceProductParseResponse> {
  return apiRequest<ApiVoiceProductParseResponse>("/products/voice-parse", {
    method: "POST",
    json: { transcript: transcript.trim(), language },
    skipAuth: true,
  });
}





export const FALLBACK_SURPLUS_PRODUCTS: ApiProduct[] = [
  {
    id: "prod-fallback-1",
    shop_id: "shop-fallback-1",
    name: "Organic Whole Milk 1L",
    original_price: 68.0,
    discount_price: 34.0,
    current_price: 34.0,
    quantity: 12,
    manufacturing_date: "2026-11-01T00:00:00Z",
    expiry_date: new Date(Date.now() + 86400000 * 2).toISOString(),
    category: "DAIRY",
    front_image_url: "https://images.unsplash.com/photo-1550583724-b2692b85b150?auto=format&fit=crop&q=80&w=600",
    expiry_image_url: "https://images.unsplash.com/photo-1550583724-b2692b85b150?auto=format&fit=crop&q=80&w=600",
    voice_note_url: null,
    description: "Farm fresh organic pasteurized whole milk. Surplus stock nearing expiry with 50% discount.",
    is_active: true,
    created_at: new Date().toISOString(),
    is_surprise_bag: false,
    auto_discount_enabled: true,
    auto_discount_min_price: 30.0,
    shop: {
      id: "shop-fallback-1",
      name: "Fresh Valley Organic Dairy",
      address: "Anna Nagar, Chennai, Tamil Nadu",
      latitude: 13.0827,
      longitude: 80.2707,
      average_rating: 4.8,
      rating_count: 142,
      delivery_enabled: true,
      delivery_fee: 15.0,
      min_order_amount: 50.0,
      upi_id: "freshvalley@okhdfcbank",
    },
  },
  {
    id: "prod-fallback-2",
    shop_id: "shop-fallback-2",
    name: "Artisan Sourdough Loaf 500g",
    original_price: 180.0,
    discount_price: 75.0,
    current_price: 75.0,
    quantity: 8,
    manufacturing_date: "2026-11-02T00:00:00Z",
    expiry_date: new Date(Date.now() + 86400000).toISOString(),
    category: "BAKERY",
    front_image_url: "https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&q=80&w=600",
    expiry_image_url: "https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&q=80&w=600",
    voice_note_url: null,
    description: "Freshly baked artisan sourdough bread. Daily surplus discount to prevent food waste.",
    is_active: true,
    created_at: new Date().toISOString(),
    is_surprise_bag: false,
    auto_discount_enabled: true,
    auto_discount_min_price: 60.0,
    shop: {
      id: "shop-fallback-2",
      name: "The Crusty Loaf Bakery",
      address: "T. Nagar, Chennai, Tamil Nadu",
      latitude: 13.0418,
      longitude: 80.2341,
      average_rating: 4.9,
      rating_count: 218,
      delivery_enabled: true,
      delivery_fee: 20.0,
      min_order_amount: 70.0,
      upi_id: "crustyloaf@okhdfcbank",
    },
  },
  {
    id: "prod-fallback-3",
    shop_id: "shop-fallback-3",
    name: "Farm Fresh Free-Range Eggs (Pack of 12)",
    original_price: 120.0,
    discount_price: 65.0,
    current_price: 65.0,
    quantity: 15,
    manufacturing_date: "2026-10-28T00:00:00Z",
    expiry_date: new Date(Date.now() + 86400000 * 3).toISOString(),
    category: "DAIRY",
    front_image_url: "https://images.unsplash.com/photo-1582722872445-44dc5f7e3c8f?auto=format&fit=crop&q=80&w=600",
    expiry_image_url: "https://images.unsplash.com/photo-1582722872445-44dc5f7e3c8f?auto=format&fit=crop&q=80&w=600",
    voice_note_url: null,
    description: "High protein, certified free-range eggs. Inspected and fresh.",
    is_active: true,
    created_at: new Date().toISOString(),
    is_surprise_bag: false,
    auto_discount_enabled: false,
    auto_discount_min_price: null,
    shop: {
      id: "shop-fallback-1",
      name: "Fresh Valley Organic Dairy",
      address: "Anna Nagar, Chennai, Tamil Nadu",
      latitude: 13.0827,
      longitude: 80.2707,
      average_rating: 4.8,
      rating_count: 142,
      delivery_enabled: true,
      delivery_fee: 15.0,
      min_order_amount: 50.0,
      upi_id: "freshvalley@okhdfcbank",
    },
  },
  {
    id: "prod-fallback-4",
    shop_id: "shop-fallback-4",
    name: "Fresh Shimla Apples 1kg",
    original_price: 220.0,
    discount_price: 110.0,
    current_price: 110.0,
    quantity: 20,
    manufacturing_date: "2026-10-30T00:00:00Z",
    expiry_date: new Date(Date.now() + 86400000 * 2).toISOString(),
    category: "PRODUCE",
    front_image_url: "https://images.unsplash.com/photo-1610832958506-aa56368176cf?auto=format&fit=crop&q=80&w=600",
    expiry_image_url: "https://images.unsplash.com/photo-1610832958506-aa56368176cf?auto=format&fit=crop&q=80&w=600",
    voice_note_url: null,
    description: "Sweet and crisp Shimla apples. Perfect for snacking, juicing, and desserts.",
    is_active: true,
    created_at: new Date().toISOString(),
    is_surprise_bag: false,
    auto_discount_enabled: true,
    auto_discount_min_price: 90.0,
    shop: {
      id: "shop-fallback-3",
      name: "Green Garden Supermarket",
      address: "Velachery, Chennai, Tamil Nadu",
      latitude: 12.9815,
      longitude: 80.2180,
      average_rating: 4.7,
      rating_count: 95,
      delivery_enabled: true,
      delivery_fee: 10.0,
      min_order_amount: 50.0,
      upi_id: "greengarden@okhdfcbank",
    },
  },
  {
    id: "prod-fallback-5",
    shop_id: "shop-fallback-2",
    name: "Chocolate Fudge Cake Slice",
    original_price: 150.0,
    discount_price: 60.0,
    current_price: 60.0,
    quantity: 6,
    manufacturing_date: "2026-11-02T00:00:00Z",
    expiry_date: new Date(Date.now() + 86400000).toISOString(),
    category: "BAKERY",
    front_image_url: "https://images.unsplash.com/photo-1578985545062-69928b1d9587?auto=format&fit=crop&q=80&w=600",
    expiry_image_url: "https://images.unsplash.com/photo-1578985545062-69928b1d9587?auto=format&fit=crop&q=80&w=600",
    voice_note_url: null,
    description: "Rich Belgian chocolate fudge cake slice. End-of-day surplus deal.",
    is_active: true,
    created_at: new Date().toISOString(),
    is_surprise_bag: false,
    auto_discount_enabled: true,
    auto_discount_min_price: 50.0,
    shop: {
      id: "shop-fallback-2",
      name: "The Crusty Loaf Bakery",
      address: "T. Nagar, Chennai, Tamil Nadu",
      latitude: 13.0418,
      longitude: 80.2341,
      average_rating: 4.9,
      rating_count: 218,
      delivery_enabled: true,
      delivery_fee: 20.0,
      min_order_amount: 70.0,
      upi_id: "crustyloaf@okhdfcbank",
    },
  },
  {
    id: "prod-fallback-6",
    shop_id: "shop-fallback-3",
    name: "Surplus Surprise Mystery Bag (Bakery + Fruits)",
    original_price: 350.0,
    discount_price: 120.0,
    current_price: 120.0,
    quantity: 5,
    manufacturing_date: "2026-11-03T00:00:00Z",
    expiry_date: new Date(Date.now() + 86400000).toISOString(),
    category: "BAKERY",
    front_image_url: "https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&q=80&w=600",
    expiry_image_url: "https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&q=80&w=600",
    voice_note_url: null,
    description: "Rescue a mystery bag packed with daily surplus pastries, artisan buns, and seasonal fruits at 65% off!",
    is_active: true,
    created_at: new Date().toISOString(),
    is_surprise_bag: true,
    auto_discount_enabled: false,
    auto_discount_min_price: null,
    shop: {
      id: "shop-fallback-2",
      name: "The Crusty Loaf Bakery",
      address: "T. Nagar, Chennai, Tamil Nadu",
      latitude: 13.0418,
      longitude: 80.2341,
      average_rating: 4.9,
      rating_count: 218,
      delivery_enabled: true,
      delivery_fee: 20.0,
      min_order_amount: 70.0,
      upi_id: "crustyloaf@okhdfcbank",
    },
  }
];
