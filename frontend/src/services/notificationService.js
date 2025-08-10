import axios from "axios";
import { getSocket } from "./socketService";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL + "notifications",
  headers: { "Content-Type": "application/json" },
});

function authHeader(token) {
  return { Authorization: `Bearer ${token}` };
}

// Fetch all notifications
export async function fetchNotifications(token) {
  try {
    const res = await api.get("/", {
      headers: authHeader(token),
    });
    return res.data;
  } catch (err) {
    const msg =
      err.response?.data?.message || err.response?.data?.error || err.message;
    throw new Error(msg);
  }
}

// Mark all notifications as read
export async function markAllAsRead(token) {
  try {
    const res = await api.patch(
      "/mark-all-read",
      {},
      {
        headers: authHeader(token),
      }
    );
    return res.data;
  } catch (err) {
    const msg =
      err.response?.data?.message || err.response?.data?.error || err.message;
    throw new Error(msg);
  }
}

// Mark single notification as read
export async function markAsRead(token, notificationId) {
  try {
    const res = await api.patch(
      `/${notificationId}/mark-read`,
      {},
      {
        headers: authHeader(token),
      }
    );
    return res.data;
  } catch (err) {
    const msg =
      err.response?.data?.message || err.response?.data?.error || err.message;
    throw new Error(msg);
  }
}

// Setup socket listener for notifications
let handleNotification = null;

export const setupNotificationListeners = (onNotification) => {
  const socket = getSocket();
  if (!socket) {
    console.warn("No socket for notifications");
    return () => {};
  }

  // Remove previous listener if any
  if (handleNotification) {
    socket.off("new_notification", handleNotification);
  }

  handleNotification = (notification) => {
    console.log("New notification received:", notification);
    onNotification(notification);
  };

  socket.on("new_notification", handleNotification);

  return () => {
    if (handleNotification) {
      socket.off("new_notification", handleNotification);
    }
  };
};
