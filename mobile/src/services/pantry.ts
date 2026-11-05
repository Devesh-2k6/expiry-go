import { apiRequest } from "../api/client";
import type { ProductCategory, ApiRecipeResponse } from "../types";

export type ApiPantryItem = {
  id: string;
  user_id: string;
  name: string;
  category: ProductCategory;
  quantity: string;
  purchase_date: string;
  expiry_date: string;
  image_url?: string | null;
  is_consumed: boolean;
  notes?: string | null;
  created_at: string;
  days_left: number;
  hours_left: number;
  urgency_status: "FRESH" | "EXPIRING_SOON" | "CRITICAL" | "EXPIRED";
};

export type ApiPantryCreate = {
  name: string;
  category: ProductCategory;
  quantity: string;
  expiry_date: string;
  image_url?: string | null;
  notes?: string | null;
};

export type ApiPantryUpdate = {
  name?: string;
  category?: ProductCategory;
  quantity?: string;
  expiry_date?: string;
  is_consumed?: boolean;
  notes?: string | null;
};

export type ApiPantrySmartAlert = {
  item_id: string;
  item_name: string;
  hours_left: number;
  urgency: string;
  alert_message: string;
  suggested_recipe_title?: string | null;
  recipe_preview?: string | null;
};

export type ApiPantryAiScanResponse = {
  detected_items: Array<{
    name: string;
    category: ProductCategory;
    estimated_days_shelf_life: number;
    suggested_quantity: string;
    confidence: number;
  }>;
  scan_summary: string;
};

export async function getPantryItems(includeConsumed = false): Promise<ApiPantryItem[]> {
  const query = includeConsumed ? "?include_consumed=true" : "";
  try {
    const res = await apiRequest<ApiPantryItem[]>(`/api/pantry${query}`);
    if (Array.isArray(res)) return res;
  } catch {
    // Try FastAPI path
    try {
      const fallback = await apiRequest<ApiPantryItem[]>(`/pantry/${query}`);
      if (Array.isArray(fallback)) return fallback;
    } catch {}
  }
  return [];
}

export async function addPantryItem(data: ApiPantryCreate): Promise<ApiPantryItem> {
  try {
    return await apiRequest<ApiPantryItem>("/api/pantry", {
      method: "POST",
      body: JSON.stringify(data),
    });
  } catch {
    return await apiRequest<ApiPantryItem>("/pantry/", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }
}

export async function autoImportFromReservation(reservationId: string): Promise<ApiPantryItem> {
  try {
    return await apiRequest<ApiPantryItem>(`/api/pantry/auto-import/${reservationId}`, {
      method: "POST",
    });
  } catch {
    return await apiRequest<ApiPantryItem>(`/pantry/auto-import/${reservationId}`, {
      method: "POST",
    });
  }
}

export async function getPantrySmartAlerts(): Promise<ApiPantrySmartAlert[]> {
  try {
    const res = await apiRequest<ApiPantrySmartAlert[]>("/api/pantry/smart-alerts");
    if (Array.isArray(res)) return res;
  } catch {
    try {
      const fallback = await apiRequest<ApiPantrySmartAlert[]>("/pantry/smart-alerts");
      if (Array.isArray(fallback)) return fallback;
    } catch {}
  }
  return [];
}

export async function generateRecipeFromFridge(): Promise<ApiRecipeResponse> {
  try {
    return await apiRequest<ApiRecipeResponse>("/api/pantry/recipe-from-fridge", {
      method: "POST",
    });
  } catch {
    return await apiRequest<ApiRecipeResponse>("/pantry/recipe-from-fridge", {
      method: "POST",
    });
  }
}

export async function updatePantryItem(itemId: string, data: ApiPantryUpdate): Promise<ApiPantryItem> {
  try {
    return await apiRequest<ApiPantryItem>(`/api/pantry/${itemId}`, {
      method: "PUT",
      body: JSON.stringify(data),
    });
  } catch {
    return await apiRequest<ApiPantryItem>(`/pantry/${itemId}`, {
      method: "PUT",
      body: JSON.stringify(data),
    });
  }
}

export async function deletePantryItem(itemId: string): Promise<{ message: string }> {
  try {
    return await apiRequest<{ message: string }>(`/api/pantry/${itemId}`, {
      method: "DELETE",
    });
  } catch {
    return await apiRequest<{ message: string }>(`/pantry/${itemId}`, {
      method: "DELETE",
    });
  }
}
