import { apiRequest } from "@/api/client";
import type { ApiNotification } from "@/types/product";

export async function getMyNotifications(): Promise<ApiNotification[]> {
  try {
    const res = await apiRequest<ApiNotification[]>("/notifications");
    return Array.isArray(res) ? res : [];
  } catch {
    return [];
  }
}

export async function markAllNotificationsAsRead(): Promise<{ message: string }> {
  return apiRequest<{ message: string }>("/notifications/read", {
    method: "POST",
  });
}
