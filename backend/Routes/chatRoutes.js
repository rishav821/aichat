const express = require('express');
const router = express.Router();
const { createChannel, getChannels, getMessages, sendMessage , joinChannel} = require('../Controllers/chatController');
const auth = require('../Middleware/auth');
const upload = require('../Helper/index.helper');
const { chatWithAI } = require('../Controllers/aiController');
const { fileUpload } = require('../Controllers/chatController');


router.post('/channels',auth , createChannel);
router.get('/channels',auth , getChannels);
router.post('/channels/:channelId/join',auth , joinChannel);
router.get('/channels/:channelId/messages',auth , getMessages);
router.post('/upload',auth , upload.single("file"),fileUpload);
router.post("/ai",auth , chatWithAI);                            

module.exports = router;
