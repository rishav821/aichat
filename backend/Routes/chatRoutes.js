const express = require('express');
const router = express.Router();
const upload = require('../Helper/index.helper');
// const { createChannel, getChannels, joinChannel} = require('../Controllers/chatController');
const {getMessages, sendMessage , getUsersForSidebar,updateMessageStatus} = require('../Controllers/messageController');
const auth = require('../Middleware/auth');

const { chatWithAI } = require('../Controllers/aiController');


// router.post('/channels',auth , createChannel);
// router.get('/channels',auth , getChannels);
// router.post('/channels/:channelId/join',auth , joinChannel);
// router.get('/channels/:channelId/messages',auth , getMessages);
// router.post('/upload',auth , upload.single("file"),fileUpload);

router.get("/users", auth, getUsersForSidebar);
router.get("/:id", auth, getMessages);
router.post("/send/:id",auth,upload.single("image"), sendMessage);
router.patch("/message/:messageId/status", auth, updateMessageStatus);

router.post("/ai",auth , chatWithAI);                            

module.exports = router;
