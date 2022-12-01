const express = require("express");
const router = express.Router();

const messageController = require("../../controllers/message/message");
const auth = require("../../middleware/auth");

router.get("/userMessages", auth, messageController.getUserChat);
router.put("/seen-all-messages", auth, messageController.seenAllMessages);
router.put("/readOneMessage", auth, messageController.readOneMessage);

module.exports = router;
