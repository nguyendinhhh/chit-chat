const express = require("express");
const { protect } = require("../middleware/authMiddleware");
const { accessChat, fetchChats, createGroupChat, renameGroup, addToGroup, removeFromGroup } = require('../controllers/chatController');

const router = express.Router();

// ALL ROUTES BELOW ARE CALLED API ENDPOINTS!

// for accessing and creating chats
router.route('/').post(protect, accessChat); // only logged in user can access this router --> hence protect middleware
// only logged in user can access this router --> hence protect middleware
// with the auth middleware, everytime we make an api call, we need to pass the bearer token

/**
const config = {
    headers: {
        Authorization: `Bearer ${user.token}`,
    },
};
 */

// get all chats from data for that particular user
router.route('/').get(protect, fetchChats);

// for group chat creation
router.route('/group').post(protect, createGroupChat);
router.route('/rename').put(protect, renameGroup); // update the database, hence "put"
router.route('/groupremove').put(protect, removeFromGroup); // remove someone from group
router.route('/groupadd').put(protect, addToGroup); // add someone to group

module.exports = router;