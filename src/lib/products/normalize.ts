import crypto from "crypto";

export function normalizeProduct(prod: any, shop?: any) {
  const originalPrice = Number(prod.original_price) || 0;
  let discountPrice = Number(prod.discount_price);
  if (!discountPrice || isNaN(discountPrice) || discountPrice <= 0) {
    if (prod.auto_discount_min_price && Number(prod.auto_discount_min_price) > 0) {
      discountPrice = Number(prod.auto_discount_min_price);
    } else {
      discountPrice = Math.max(1, Math.round(originalPrice * 0.7));
    }
  }

  const discountPercent =
    originalPrice > 0
      ? Math.max(0, Math.round(((originalPrice - discountPrice) / originalPrice) * 100))
      : 0;

  const resolvedShop =
    prod.shop ||
    (shop
      ? {
          id: shop.id,
          name: shop.name,
          address: shop.address,
          latitude: shop.latitude,
          longitude: shop.longitude,
          average_rating: 4.8,
          rating_count: 12,
          phone_number: shop.phone_number,
          is_active: shop.is_active,
          delivery_enabled: true,
          upi_id: shop.upi_id,
          delivery_fee: 15,
          min_order_amount: 50,
          approval_status: shop.approval_status,
        }
      : {
          id: "shop_nithiya_001",
          name: "Nithiya Groceries",
          address: "Commercial Market, Chennai",
          latitude: 13.0827,
          longitude: 80.2707,
          average_rating: 4.8,
          rating_count: 12,
          phone_number: "9876543210",
          is_active: true,
          delivery_enabled: true,
          upi_id: "nithiya@upi",
          delivery_fee: 15,
          min_order_amount: 50,
          approval_status: "APPROVED",
        });

  return {
    id: prod.id || crypto.randomUUID(),
    shop_id: prod.shop_id || resolvedShop.id || "shop_nithiya_001",
    name: prod.name || "Surplus Product",
    original_price: originalPrice,
    discount_price: discountPrice,
    current_price: discountPrice,
    discount_percent: discountPercent,
    quantity: Number(prod.quantity) || 1,
    manufacturing_date: prod.manufacturing_date || new Date().toISOString(),
    expiry_date: prod.expiry_date || new Date(Date.now() + 86400000 * 3).toISOString(),
    category: prod.category || "OTHER",
    front_image_url:
      prod.front_image_url || "https://images.unsplash.com/photo-1542838132-92c53300491e?w=800",
    expiry_image_url:
      prod.expiry_image_url ||
      prod.front_image_url ||
      "https://images.unsplash.com/photo-1542838132-92c53300491e?w=800",
    voice_note_url: prod.voice_note_url || null,
    description: prod.description || `${prod.name || "Product"} - Near expiry discount deal`,
    is_active: prod.is_active !== undefined ? Boolean(prod.is_active) : true,
    is_surprise_bag: Boolean(prod.is_surprise_bag),
    auto_discount_enabled:
      prod.auto_discount_enabled !== undefined ? Boolean(prod.auto_discount_enabled) : true,
    auto_discount_min_price: prod.auto_discount_min_price
      ? Number(prod.auto_discount_min_price)
      : discountPrice,
    created_at: prod.created_at || new Date().toISOString(),
    shop: resolvedShop,
  };
}

