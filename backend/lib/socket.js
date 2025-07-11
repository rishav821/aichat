const { Server } = require("socket.io");
const Message = require("../Models/message");

const onlineUsers = new Map(); // userId => socket.id

function setupSocket(server) {
  const io = new Server(server, {
    cors: {
      origin: "http://localhost:5173",
      credentials: true,
    },
  });

  io.on("connection", (socket) => {
    console.log("🟢 Socket connected:", socket.id);

    // Step 1: Register the user to map
    socket.on("register", (userId) => {
      onlineUsers.set(userId, socket.id);
      console.log(`User ${userId} registered with socket ${socket.id}`);
    });

    // Step 2: Handle message sending between users
   socket.on("sendMessage", async (data) => {
    try {
      const { sender, receiver, content, attachments = [], isAI = false } = data;

      const newMessage = new Message({
        content,
        sender,
        receiver,
        attachments,
        isAI,
        status: "sent", // initial status
      });

      await newMessage.save();

      // Emit new message to receiver
      const receiverSocketId = onlineUsers.get(receiver);
      if (receiverSocketId) {
        io.to(receiverSocketId).emit("newMessage", newMessage);
      }

      // Emit messageSent confirmation to sender (optional)
      socket.emit("messageSent", newMessage);
    } catch (err) {
      console.error("❌ Socket error:", err.message);
    }
  });

  // Receiver notifies server message is delivered
  socket.on("messageDelivered", async ({ messageId, senderId }) => {
    try {
      await Message.findByIdAndUpdate(messageId, { status: "delivered" });

      const senderSocket = onlineUsers.get(senderId);
      if (senderSocket) {
        io.to(senderSocket).emit("messageDelivered", { messageId });
      }
    } catch (err) {
      console.error("Error updating delivered status:", err);
    }
  });

  // Message seen handled (your existing code is good)
  socket.on("messageSeen", async ({ messageId, from, to }) => {
    try {
      await Message.findByIdAndUpdate(messageId, { status: "seen" });

      const senderSocket = onlineUsers.get(from);
      if (senderSocket) {
        io.to(senderSocket).emit("messageSeenAck", { messageId });
      }

      socket.emit("messageSeenConfirmed", { messageId });
    } catch (error) {
      console.error("Error in messageSeen handler:", error.message);
    }
  });

    // Step 5: Handle disconnection
    socket.on("disconnect", () => {
      console.log("🔴 Socket disconnected:", socket.id);
      for (const [userId, socketId] of onlineUsers.entries()) {
        if (socketId === socket.id) {
          onlineUsers.delete(userId);
          break;
        }
      }
    });
  });
}

module.exports = { setupSocket, onlineUsers };
