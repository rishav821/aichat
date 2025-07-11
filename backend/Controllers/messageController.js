const User = require("../Models/user");
const Message = require("../Models/message");

const FileAttachment = require("../Models/fileAttachment");
const { onlineUsers ,io } = require("../lib/socket");

const getUsersForSidebar = async (req, res) => {
  try {
    const loggedInUserId = req.user._id;
    const filteredUsers = await User.find({ _id: { $ne: loggedInUserId } }).select("-password");

    res.status(200).json(filteredUsers);
  } catch (error) {
    console.error("Error in getUsersForSidebar: ", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};

const getMessages = async (req, res) => {
  try {
    const { id: userToChatId } = req.params;
    const myId = req.user._id;
    console.log("Fetching messages...");
    const messages = await Message.find({
      $or: [
        { sender: myId, receiver: userToChatId },
        { sender: userToChatId, receiver: myId },
      ],
    }).sort({ createdAt: 1 })
      .populate("sender", "_id username profilePic")
      .populate("receiver", "_id username profilePic") // optional: oldest to newest
      .populate("attachments", "url");

    res.status(200).json(messages);
    console.log("Fetching messages between:", myId, "and", userToChatId);
console.log("Found messages:", messages.length);
  } catch (error) {
    console.log("Error in getMessages controller: ", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};
const sendMessage = async (req, res) => {
  try {
    const { text } = req.body;
    const { id: receiverId } = req.params;
    const senderId = req.user._id;

    let attachmentIds = [];

    if (req.file) {
      const fileDoc = await FileAttachment.create({
        filename: req.file.filename,
        url: `/uploads/files/${req.file.filename}`,
        uploadedBy: senderId,
      });

      attachmentIds.push(fileDoc._id); // ✅ now this is an ObjectId
    }

    if (!text && attachmentIds.length === 0) {
      return res.status(400).json({ error: "Message must contain text or image." });
    }

    const newMessage = new Message({
      content: text,
      sender: senderId,
      receiver: receiverId,
      attachments: attachmentIds, // ✅ pass ObjectIds only
    });

    await newMessage.save();

    res.status(201).json(newMessage);
  } catch (error) {
    console.error("🔥 Error in sendMessage:", error);
    res.status(500).json({
      error: "Internal server error",
      details: error.message,
    });
  }
};
const updateMessageStatus = async (req, res) => {
  try {
    const { messageId } = req.params;
    const { status } = req.body;

    const allowed = ["delivered", "seen"];
    if (!allowed.includes(status)) {
      return res.status(400).json({ error: "Invalid status update." });
    }

    const updated = await Message.findByIdAndUpdate(
      messageId,
      { status },
      { new: true }
    );

    res.status(200).json(updated);
  } catch (err) {
    res.status(500).json({ error: "Failed to update message status." });
  }
};

module.exports = {
  getUsersForSidebar,
  getMessages,
  sendMessage,
  updateMessageStatus
};