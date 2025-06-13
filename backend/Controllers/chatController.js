const Channel = require('../Models/channel');
const Message = require('../Models/message');
const FileAttachment = require("../Models/fileAttachment");

// const { generateAIResponse } = require('../Config/openai');

const createChannel = async (req, res) => {
  const { name } = req.body;
  const userId = req.user.id;
  const channel = new Channel({ name, createdBy: userId, members: [userId] });
  await channel.save();
  res.status(201).json(channel);
};

const getChannels = async (req, res) => {
  const channels = await Channel.find().populate('createdBy', 'username');
  res.json(channels);
};

const getMessages = async (req, res) => {
  const channel = await Channel.findById(req.params.channelId);
   if (!channel) return res.status(404).json({ message: 'Channel not found' });

   if (!channel.members.includes(req.user.id)) {
    return res.status(403).json({ message: 'You are not a member of this channel' });
  }

  const messages = await Message.find({ channelId: channel.id })
    .populate('sender', 'username')
    .sort({ createdAt: 1 });
  res.json(messages);
};

const joinChannel = async (req, res) => {
  const { channelId } = req.params;
  const userId = req.user.id;

  const channel = await Channel.findById(channelId);
  if (!channel) {
    return res.status(404).json({ error: 'Channel not found' });
  }
  if (channel.members.includes(userId)) {
    return res.status(400).json({ error: 'Already a member of this channel' });
  }
  channel.members.push(userId);
  await channel.save();
  res.status(200).json({ message: 'Joined channel successfully' });
};


const fileUpload = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: "No file uploaded" });

    const file = new FileAttachment({
      filename: req.file.filename,
      url: `/Uploads/files/${req.file.filename}`,
      uploadedBy: req.user._id
    });

    await file.save();

    res.status(201).json(file);
  } catch (err) {
    console.error("Upload error:", err);
    res.status(500).json({ message: "Upload failed", error: err.message });
  }
};


// let io;

// const setSocketIO = (ioInstance) => {
//   io = ioInstance;
// };

// const sendMessage = async (req, res) => {
//   const channel = await Channel.findById(req.params.channelId);
//   if (!channel) return res.status(404).json({ message: 'Channel not found' });

//   if (!channel.members.includes(req.user.id)) {
//     return res.status(403).json({ message: 'You are not a member of this channel' });
//   }

//   const { text } = req.body;
//   const message = new Message({
//     text,
//     channelId: req.params.channelId,
//     sender: req.user.id,
//   });

//   await message.save();

//   // Send file if available
//   if (req.file) {
//     const fileData = {
//       filename: req.file.filename,
//       url: `/uploads/files/${req.file.filename}`,
//       uploadedBy: req.user._id,
//       message: message._id,
//     };
//     const fileAttachment = new FileAttachment(fileData);
//     await fileAttachment.save();
//   }

//   // Send AI reply if needed
//   if (text?.toLowerCase().includes("@ai")) {
//     const aiReply = await generateAIResponse(text);
//     const aiMessage = new Message({
//       text: aiReply,
//       channelId: req.params.channelId,
//       sender: null,
//       isAI: true,
//     });
//     await aiMessage.save();

//     // Emit AI message
//     io.to(req.params.channelId).emit("newMessage", {
//       _id: aiMessage._id,
//       text: aiReply,
//       sender: null,
//       isAI: true,
//       createdAt: aiMessage.createdAt
//     });
//   }

//   // Emit the new message to the channel
//   io.to(req.params.channelId).emit("newMessage", {
//     _id: message._id,
//     text: message.text,
//     sender: req.user.id,
//     createdAt: message.createdAt
//   });

//   res.status(201).json({ message: 'Message sent' });

//   console.log("Socket.IO available?", !!io);
// };



module.exports = {
  createChannel,
  getChannels,
  getMessages,
  joinChannel,
  fileUpload,
  // sendMessage,
  // setSocketIO
};