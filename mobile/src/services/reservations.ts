import { apiRequest } from "../api/client";
import type { ApiReservation } from "../types";

export async function createReservation(
  productId: string,
  quantity: number
): Promise<ApiReservation> {
  return apiRequest<ApiReservation>("/api/reservations", {
    method: "POST",
    json: { product_id: productId, quantity },
  });
}

export async function getMyReservations(): Promise<ApiReservation[]> {
  try {
    return await apiRequest<ApiReservation[]>("/api/reservations/me");
  } catch {
    return [];
  }
}

export async function getShopReservations(): Promise<ApiReservation[]> {
  try {
    return await apiRequest<ApiReservation[]>("/api/shops/reservations");
  } catch {
    return [];
  }
}

export async function verifyReservation(
  reservationId: string,
  pickupCode: string
): Promise<{ message: string; status: string }> {
  return apiRequest<{ message: string; status: string }>(
    `/api/reservations/${reservationId}/verify`,
    {
      method: "POST",
      json: { pickup_code: pickupCode },
    }
  );
}

export async function checkoutReservation(
  reservationId: string
): Promise<{ message: string; payment_status: string }> {
  return apiRequest<{ message: string; payment_status: string }>(
    `/api/reservations/${reservationId}/checkout`,
    {
      method: "POST",
    }
  );
}
