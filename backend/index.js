const express = require("express");
const http = require("http");
const path = require("path");
const morgan = require("morgan");
const mongoose = require("mongoose");
const rateLimit = require("express-rate-limit");
const cors = require("cors");
const { Server } = require("socket.io");
const Message = require("./Models/message");
const FileAttachment = require("./Models/fileAttachment");

require("dotenv").config();
require("./Config/db");

const app = express();
const server = http.createServer(app); 
const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173", 
    methods: ["GET", "POST"]
  }
});

// === Express Middleware ===
app.use(express.json());
app.use(morgan("dev"));

const whitelist = ['http://localhost:5173'];
const corsOptions = {
  origin: function (origin, callback) {
    if (whitelist.includes(origin) || !origin) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  }
};
app.use(cors(corsOptions));

const limiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 100 });
app.use(limiter);

app.use("/uploads/files", express.static(path.join(__dirname, "uploads/files")));

// === Routes ===
const authRoutes = require("./Routes/authRoutes");
const chatRoutes = require("./Routes/chatRoutes");

app.use("/auth", authRoutes);
app.use("/chat", chatRoutes);

// === Error Handler ===
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: err.message });
});

io.on("connection", (socket) => {
  console.log("Socket connected:", socket.id);

  socket.on("joinChannel", ({ channelId }) => {
    socket.join(channelId);
    console.log(`Socket joined channel ${channelId}`);
  });

  socket.on("sendMessage", async (data) => {
    try {
      const senderId = mongoose.Types.ObjectId(data.sender);
      const channelId = mongoose.Types.ObjectId(data.channel);

      const newMessage = new Message({
        content: data.content,
        sender: senderId,
        channel: channelId,
        attachments: data.attachments || [],
        isAI: data.isAI || false
      });

     const savedMessage = await newMessage.save();
        io.to(data.channel).emit("messageReceived", savedMessage);
    } catch (error) {
      console.error("Error sending message:", error);
    }

    // Save file if attached (you must handle file upload separately)
    const { content, sender, channel, file } = data;
    if (file) {
      fileData = new FileAttachment({
        filename: file.filename,
        url: `/uploads/files/${file.filename}`,
        uploadedBy: user.id,
        message: newMessage._id,
      });
      await fileData.save();
    }

    const payload = {
      _id: newMessage._id,
      text,
      sender: user.id,
      file: fileData ? fileData.url : null,
      createdAt: newMessage.createdAt,
      status: "delivered", // For example
    };

    io.to(channelId).emit("newMessage", payload);
    socket.emit("messageDelivered", { messageId: newMessage._id });
    socket.emit("messageSeen", { messageId });

    // AI Response
    if (text?.toLowerCase().includes("@ai")) {
      const aiReply = await generateAIResponse(text);
      const aiMessage = new Message({
        text: aiReply,
        channelId,
        sender: null,
        isAI: true,
      });
      await aiMessage.save();

      io.to(channelId).emit("newMessage", {
        _id: aiMessage._id,
        text: aiReply,
        sender: null,
        isAI: true,
        createdAt: aiMessage.createdAt,
      });
    }
  });

  socket.on("disconnect", () => {
    console.log("Socket disconnected:", socket.id);
  });
});

// === Start Server ===
const PORT = 3000;
server.listen(PORT, () => {
  console.log(`Server  running at port ${PORT}`);
});
module.exports = { app, server, io }; 