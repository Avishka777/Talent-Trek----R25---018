import { io } from "socket.io-client";

let socket = null;

export const initSocket = (token) => {
  if (!socket) {
    console.log("🔌 Initializing socket...");
    socket = io("http://localhost:5000", {
      auth: { token },
      transports: ["websocket"],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
      withCredentials: true,
    });

    socket.on("connect", () => {
      console.log("Socket connected:", socket.id);
    });

    socket.on("connect_error", (err) => {
      console.error("Socket connection error:", err.message);
    });

    socket.on("disconnect", (reason) => {
      console.warn("Socket disconnected:", reason);
    });

    socket.on("connection_success", (data) => {
      console.log("Server connected:", data);
    });

    socket.on("connection_error", (err) => {
      console.error("Server connection error:", err);
    });
  }
  return socket;
};

export const getSocket = () => {
  return socket;
};

export const disconnectSocket = () => {
  if (socket) {
    console.log("Disconnecting socket...");
    socket.disconnect();
    socket = null;
  }
};

export const isSocketConnected = () => {
  return socket?.connected || false;
};
