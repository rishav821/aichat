import { io } from "socket.io-client";

const SOCKET_URL =
  import.meta.env.MODE === "development"
    ? "http://localhost:3000"
    : "/";

export const socket = io(SOCKET_URL, {
  withCredentials: true,
});