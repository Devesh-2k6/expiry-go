import { apiRequest } from "@/api/client";
import type { ApiOrder, ApiOrderCreate, OrderStatus } from "@/types/product";

const LOCAL_STORAGE_ORDERS_KEY = "expirygo_local_orders_v1";

function getLocalOrders(): ApiOrder[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_ORDERS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveLocalOrder(order: ApiOrder): void {
  if (typeof window === "undefined") return;
  try {
    const current = getLocalOrders();
    const filtered = current.filter((o) => o.id !== order.id);
    localStorage.setItem(LOCAL_STORAGE_ORDERS_KEY, JSON.stringify([order, ...filtered]));
  } catch {}
}

export async function createOrder(payload: ApiOrderCreate): Promise<ApiOrder> {
  try {
    const order = await apiRequest<ApiOrder>("/api/orders", {
      method: "POST",
      json: payload,
    });
    if (order && order.id) {
      saveLocalOrder(order);
      return order;
    }
  } catch (err) {
    console.warn("[ORDERS] Server order creation failed, falling back to local:", err);
  }

  const randomPin = Math.floor(1000 + Math.random() * 9000).toString();
  const fallbackOrder: ApiOrder = {
    id: `ord_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    customer_id: "customer_me",
    shopkeeper_id: "vendor_nithiya_001",
    shop_id: "shop_nithiya_001",
    product_id: payload.product_id || "prod_fallback",
    order_type: payload.order_type || "PICKUP",
    status: "PENDING",
    payment_method: "UPI",
    payment_status: "UNPAID",
    quantity: payload.quantity || 1,
    delivery_fee: payload.delivery_fee || 0,
    total_price: 65,
    delivery_pin: randomPin,
    customer_name: payload.customer_name || "Customer",
    customer_phone: payload.customer_phone || "",
    delivery_address: payload.delivery_address || "",
    completed_at: null,
    created_at: new Date().toISOString(),
    product: {
      id: payload.product_id,
      shop_id: "shop_nithiya_001",
      name: "Surplus Deal Item",
      original_price: 70,
      discount_price: 65,
      current_price: 65,
      quantity: payload.quantity || 1,
      category: "OTHER",
      is_active: true,
      shop: {
        id: "shop_nithiya_001",
        name: "Nithiya Groceries",
        address: "Commercial Market, Chennai",
        phone_number: "9876543210",
      },
    } as any,
  };

  saveLocalOrder(fallbackOrder);
  return fallbackOrder;
}

export async function getMyOrders(): Promise<ApiOrder[]> {
  const local = getLocalOrders();
  try {
    const server = await apiRequest<ApiOrder[]>("/api/orders/me");
    if (Array.isArray(server)) {
      const serverIds = new Set(server.map((s) => s.id));
      const combined = [...server, ...local.filter((l) => !serverIds.has(l.id))];
      return combined.sort(
        (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );
    }
  } catch {}
  return local;
}

export async function getShopOrders(): Promise<ApiOrder[]> {
  const local = getLocalOrders();
  try {
    const server = await apiRequest<ApiOrder[]>("/api/shops/orders");
    if (Array.isArray(server)) {
      const serverIds = new Set(server.map((s) => s.id));
      const combined = [...server, ...local.filter((l) => !serverIds.has(l.id))];
      return combined.sort(
        (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );
    }
  } catch {}
  return local;
}

export async function getOrderById(orderId: string): Promise<ApiOrder> {
  const local = getLocalOrders();
  const match = local.find((o) => o.id === orderId);
  try {
    const serverOrder = await apiRequest<ApiOrder>(`/api/orders/${orderId}`);
    if (serverOrder) {
      saveLocalOrder(serverOrder);
      return serverOrder;
    }
  } catch {}
  if (match) return match;
  throw new Error("Order not found");
}

export async function reportOrderPayment(
  orderId: string,
  upiTransactionId: string
): Promise<ApiOrder> {
  const local = getLocalOrders();
  const match = local.find((o) => o.id === orderId);
  if (match) {
    match.payment_status = "CUSTOMER_REPORTED_UNVERIFIED";
    match.upi_transaction_id = upiTransactionId;
    match.payment_reported_at = new Date().toISOString();
    saveLocalOrder(match);
  }

  try {
    return await apiRequest<ApiOrder>(`/api/orders/${orderId}/report-payment`, {
      method: "POST",
      json: { upi_transaction_id: upiTransactionId },
    });
  } catch {
    if (match) return match;
    throw new Error("Failed to report payment");
  }
}

export async function verifyOrderPayment(
  orderId: string,
  confirmed: boolean = true
): Promise<ApiOrder> {
  const local = getLocalOrders();
  const match = local.find((o) => o.id === orderId);
  if (match) {
    match.payment_status = confirmed ? "PAID" : "UNPAID";
    match.status = confirmed ? "ACCEPTED" : match.status;
    saveLocalOrder(match);
  }

  try {
    return await apiRequest<ApiOrder>(`/api/orders/${orderId}/verify-payment`, {
      method: "POST",
      json: { confirmed },
    });
  } catch {
    if (match) return match;
    throw new Error("Failed to verify payment");
  }
}

export async function verifyOrderDeliveryPin(
  orderId: string,
  pin: string
): Promise<ApiOrder> {
  const local = getLocalOrders();
  const match = local.find((o) => o.id === orderId);
  if (match) {
    match.status = "DELIVERED";
    saveLocalOrder(match);
  }

  try {
    return await apiRequest<ApiOrder>(`/api/orders/${orderId}/verify-delivery-pin`, {
      method: "POST",
      json: { pin },
    });
  } catch {
    if (match) return match;
    throw new Error("Failed to verify PIN");
  }
}

export async function updateOrderStatus(
  orderId: string,
  status: OrderStatus
): Promise<ApiOrder> {
  const local = getLocalOrders();
  const match = local.find((o) => o.id === orderId);
  if (match) {
    match.status = status;
    saveLocalOrder(match);
  }

  try {
    return await apiRequest<ApiOrder>(`/api/orders/${orderId}/status`, {
      method: "PATCH",
      json: { status },
    });
  } catch {
    if (match) return match;
    throw new Error("Failed to update status");
  }
}

export async function cancelOrder(orderId: string, reason?: string): Promise<ApiOrder> {
  const local = getLocalOrders();
  const match = local.find((o) => o.id === orderId);
  if (match) {
    match.status = "CANCELLED";
    saveLocalOrder(match);
  }

  try {
    return await apiRequest<ApiOrder>(`/api/orders/${orderId}/cancel`, {
      method: "POST",
      json: { reason: reason || "Customer requested cancellation" },
    });
  } catch {
    if (match) return match;
    throw new Error("Failed to cancel order");
  }
}
