import { apiRequest } from "@/api/client";
import type { ProductCategory } from "@/types/product";
import type { ApiRecipeResponse } from "@/types/recipe";

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

const STORAGE_KEY = "EXPIRYGO_DIGITAL_FRIDGE_V1";

function serializeItem(raw: any): ApiPantryItem {
  const now = Date.now();
  const exp = raw.expiry_date ? new Date(raw.expiry_date).getTime() : now + 86400000 * 3;
  const diffMs = exp - now;
  const totalSeconds = diffMs / 1000;
  const hoursLeft = Math.max(0, Math.round((totalSeconds / 3600) * 10) / 10);
  const daysLeft = Math.floor(hoursLeft / 24);

  let urgency: "FRESH" | "EXPIRING_SOON" | "CRITICAL" | "EXPIRED" = "FRESH";
  if (totalSeconds <= 0) {
    urgency = "EXPIRED";
  } else if (hoursLeft <= 24) {
    urgency = "CRITICAL";
  } else if (hoursLeft <= 72) {
    urgency = "EXPIRING_SOON";
  }

  return {
    id: raw.id || "item_" + Math.random().toString(36).slice(2, 9),
    user_id: raw.user_id || "user_current",
    name: raw.name || "Pantry Item",
    category: raw.category || "OTHER",
    quantity: raw.quantity || "1 unit",
    purchase_date: raw.purchase_date || new Date().toISOString(),
    expiry_date: raw.expiry_date || new Date(now + 86400000 * 3).toISOString(),
    image_url: raw.image_url || null,
    is_consumed: Boolean(raw.is_consumed),
    notes: raw.notes || null,
    created_at: raw.created_at || new Date().toISOString(),
    days_left: daysLeft,
    hours_left: hoursLeft,
    urgency_status: urgency,
  };
}

function getStoredItems(): ApiPantryItem[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      // Empty by default — NO demo data
      return [];
    }
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) {
      // Clean up any legacy demo items
      const realOnly = parsed.filter(
        (i) => i && i.id && !String(i.id).startsWith("fridge_init_")
      );
      if (realOnly.length !== parsed.length) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(realOnly));
      }
      return realOnly.map(serializeItem);
    }
  } catch (e) {
    console.warn("[PANTRY STORAGE] Could not read local pantry:", e);
  }
  return [];
}

function saveStoredItems(items: ApiPantryItem[]) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  } catch (e) {
    console.warn("[PANTRY STORAGE] Could not write local pantry:", e);
  }
}

export async function getPantryItems(includeConsumed = false): Promise<ApiPantryItem[]> {
  const local = getStoredItems();
  const filtered = includeConsumed ? local : local.filter((i) => !i.is_consumed);
  filtered.sort((a, b) => new Date(a.expiry_date).getTime() - new Date(b.expiry_date).getTime());
  return filtered;
}

export async function addPantryItem(data: ApiPantryCreate): Promise<ApiPantryItem> {
  const all = getStoredItems();
  const newItem = serializeItem({
    id: "item_" + Math.random().toString(36).slice(2, 11),
    name: data.name,
    category: data.category,
    quantity: data.quantity,
    expiry_date: data.expiry_date,
    image_url: data.image_url,
    notes: data.notes,
    is_consumed: false,
    purchase_date: new Date().toISOString(),
    created_at: new Date().toISOString(),
  });
  all.unshift(newItem);
  saveStoredItems(all);
  return newItem;
}

export async function updatePantryItem(
  itemId: string,
  data: ApiPantryUpdate
): Promise<ApiPantryItem> {
  const all = getStoredItems();
  const idx = all.findIndex((i) => i.id === itemId);
  if (idx !== -1) {
    all[idx] = serializeItem({
      ...all[idx],
      ...data,
      id: itemId,
    });
    saveStoredItems(all);
    return all[idx];
  }
  throw new Error("Pantry item not found");
}

export async function deletePantryItem(itemId: string): Promise<{ message: string }> {
  const all = getStoredItems();
  const filtered = all.filter((i) => i.id !== itemId);
  saveStoredItems(filtered);
  return { message: "Item removed from digital fridge." };
}

export async function getPantrySmartAlerts(): Promise<ApiPantrySmartAlert[]> {
  const items = await getPantryItems(false);
  const expiring = items.filter((i) => i.hours_left <= 48 && i.hours_left > 0);

  return expiring.map((item) => {
    const itemLower = item.name.toLowerCase();
    let recipeTitle = `Quick ${item.name} Saute`;
    let recipeSnippet = `Use your ${item.name} before expiry in a 10-minute skillet meal.`;

    if (itemLower.includes("milk")) {
      recipeTitle = "Golden Fluffy Pancakes / Rich Masala Chai";
      recipeSnippet = "Turn remaining milk into fluffy breakfast pancakes or hot spiced tea.";
    } else if (itemLower.includes("bread")) {
      recipeTitle = "Crispy French Toast / Spicy Bread Upma";
      recipeSnippet = "Transform bread slices into crispy golden toast or savory bread upma.";
    } else if (itemLower.includes("spinach") || itemLower.includes("paneer")) {
      recipeTitle = "Restaurant-Style Palak Paneer Bowl";
      recipeSnippet = "Combine spinach and paneer with light cumin and garlic in 15 minutes.";
    } else if (itemLower.includes("banana")) {
      recipeTitle = "Superfood Banana Smoothie Bowl";
      recipeSnippet = "Blend into an energizing potassium-packed smoothie bowl.";
    }

    return {
      item_id: item.id,
      item_name: item.name,
      hours_left: item.hours_left,
      urgency: item.urgency_status,
      alert_message: `Your ${item.name} expires in ${Math.round(item.hours_left)} hours! ⏳ ${recipeSnippet}`,
      suggested_recipe_title: recipeTitle,
      recipe_preview: recipeSnippet,
    };
  });
}

export async function generateRecipeFromFridge(): Promise<ApiRecipeResponse> {
  const items = await getPantryItems(false);
  if (items.length === 0) {
    throw new Error("Your Digital Fridge is empty. Add grocery items first to generate a zero-waste recipe.");
  }
  const names = items.map((i) => i.name).join(", ");
  const critical = items.find((i) => i.hours_left <= 48) || items[0];
  const primaryName = critical ? critical.name : "Surplus Item";

  return {
    recipe_name: `Zero-Waste ${primaryName} Skillet Delight`,
    description: `A nutritious, zero-waste gourmet dish crafted specifically to rescue your ${primaryName} and remaining fridge ingredients (${names}).`,
    prep_time: "8 mins",
    cook_time: "12 mins",
    difficulty: "Easy",
    ingredients: items.slice(0, 5).map((i) => ({
      name: i.name,
      is_deal: true,
      quantity: i.quantity || "1 portion",
    })),
    instructions: [
      {
        step_number: 1,
        instruction: `Gently prep and dice the ${primaryName} into bite-sized pieces. Heat 1 tbsp butter or oil in a pan.`,
      },
      {
        step_number: 2,
        instruction: "Sauté the ingredients over medium heat for 4-5 minutes until golden and aromatic.",
      },
      {
        step_number: 3,
        instruction: "Season with fresh black pepper, a pinch of salt, and mixed herbs or mild chili flakes.",
      },
      {
        step_number: 4,
        instruction: "Serve immediately while warm and crisp. Enjoy your sustainable zero-waste meal!",
      },
    ],
    waste_saved_summary: `Saved approximately 0.65 kg of potential food waste and reduced kitchen carbon footprint by 1.2 kg CO₂e!`,
  };
}

export async function autoImportFromReservation(reservationId: string): Promise<ApiPantryItem> {
  return addPantryItem({
    name: "Rescued Surplus Item",
    category: "PANTRY",
    quantity: "1 order",
    expiry_date: new Date(Date.now() + 86400000 * 2).toISOString(),
    notes: `Rescued via ExpiryGo reservation #${reservationId.slice(0, 6)}`,
  });
}
