import { apiRequest } from "../api/client";
import type { ApiOrder, ApiOrderCreate, OrderStatus } from "../types";

export async function createOrder(payload: ApiOrderCreate): Promise<ApiOrder> {
  return apiRequest<ApiOrder>("/api/orders", {
    method: "POST",
    json: payload,
  });
}

export async function getMyOrders(): Promise<ApiOrder[]> {
  try {
    return await apiRequest<ApiOrder[]>("/api/orders/me");
  } catch {
    return [];
  }
}

export async function getShopOrders(): Promise<ApiOrder[]> {
  try {
    return await apiRequest<ApiOrder[]>("/api/shops/orders");
  } catch {
    return [];
  }
}

export async function updateOrderStatus(
  orderId: string,
  status: OrderStatus
): Promise<ApiOrder> {
  return apiRequest<ApiOrder>(`/api/orders/${orderId}/status`, {
    method: "PATCH",
    json: { status },
  });
}

export async function cancelOrder(orderId: string): Promise<ApiOrder> {
  return apiRequest<ApiOrder>(`/api/orders/${orderId}/cancel`, {
    method: "POST",
  });
}
