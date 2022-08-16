const express = require("express");
const { protect } = require("../middleware/authMiddleware");
const { sendMessage, allMessages } = require("../controllers/messageController");

const router = express.Router()

// sending messages route
router.route("/").post(protect, sendMessage ) // user has to be logged in to send a message

// fetching all messages of 1 single chat
router.route("/:chatId").get(protect, allMessages);

module.exports = router;