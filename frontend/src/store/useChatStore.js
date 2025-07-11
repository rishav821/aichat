import { create } from "zustand";
import axiosInstance from "../lib/axios";
import toast from "react-hot-toast";
import { socket } from "../lib/socket";

export const useChatStore = create((set, get) => ({
  // State
  messages: [],
  users: [],
  selectedUser: null,
  isUsersLoading: false,
  isMessagesLoading: false,

  // Actions
  getUsers: async () => {
    set({ isUsersLoading: true });
    try {
      const response = await axiosInstance.get("/chat/users");
      set({ users: response.data });
    } catch (error) {
      toast.error("Failed to load users");
    } finally {
      set({ isUsersLoading: false });
    }
  },

getMessages: async (userId, myId) => {
  console.log("Calling getMessages from Zustand for user:", userId);
  console.log("myId:", myId);

  if (!userId || !myId) {
    console.warn("Missing userId or myId in getMessages");
    return;
  }

  set({ isMessagesLoading: true });

  try {
    const res = await axiosInstance.get(`/chat/${userId}`);
    set({ messages: res.data });

    const unseenMessages = res.data.filter(
      (msg) => msg.receiver?._id === myId && msg.status !== "seen"
    );
    set({ unseenMessages });
  } catch (error) {
    console.error("Error loading messages:", error);
    toast.error("Failed to load messages");
  } finally {
    set({ isMessagesLoading: false });
  }
},

  setSelectedUser: (selectedUser) => set({ selectedUser }),

  subscribeToMessages: () => {
    socket.on("newMessage", (newMessage) => {
      set((state) => ({
        messages: [...state.messages, newMessage],
      }));
    });
  },

  unsubscribeFromMessages: () => {
    socket.off("newMessage");
  },

sendMessage: async (formData) => {
  const { selectedUser } = get();
  if (!selectedUser || !selectedUser._id) {
    toast.error("No user selected");
    return;
  }

  try {
    const res = await axiosInstance.post(
      `/chat/send/${selectedUser._id}`,
      formData,
      {
        // ❌ DO NOT manually set Content-Type
        // Axios will automatically set correct boundary headers
        withCredentials: true, // ✅ if you're using cookies
      }
    );

    set((state) => ({
      messages: [...state.messages, res.data],
    }));
  } catch (err) {
    toast.error("Message send failed");
    console.error(err);
  }
  },
}));
