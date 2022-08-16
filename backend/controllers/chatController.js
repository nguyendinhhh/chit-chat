const asyncHandler = require("express-async-handler"); //https://www.npmjs.com/package/express-async-handler
const Chat = require("../models/chatModel");
const User = require("../models/userModel");

// ._id is MongoDB ObjectID 
// source: https://www.mongodb.com/docs/manual/core/document/

// this router is responsible for creating or fetching a one-on-one chat
const accessChat = asyncHandler(async (req, res) => {
    // take the user id of logged in user
    const { userId } = req.body;

    // check if a chat with this userId exists
    if (!userId) {
        console.log("UserId param not sent with request");
        return res.sendStatus(400);
    }
    let isChat = await Chat.find({
        isGroupChat: false, // has NOT to be a group chat
        $and: [ // $and --> both of these requests have to be true
            { users: { $elemMatch: { $eq: req.user._id } } }, //current logged in user
            { users: { $elemMatch: { $eq: userId } } }, // userid that is sent
        ]
    }).populate("users", "-password").populate("latestMessage");//we dont want password
    isChat = await User.populate(isChat, {
        path: "latestMessage.sender",
        select: "name pic email",
    });
    
    if (isChat.length > 0) {
        res.send(isChat[0]); // if chat exists, send it
    } else { // else create a new chat
        let chatData = {
            chatName: "sender",
            isGroupChat: false,
            users: [req.user._id, userId],
        };

        // store in the database
        try {
            const createdChat = await Chat.create(chatData);

            const FullChat = await Chat.findOne({ _id: createdChat._id }).populate("users", "-password");
            res.status(200).send(FullChat);
        } catch (error) {
            res.status(400);
            throw new Error(error.message);
        }
    }
});

const fetchChats = asyncHandler(async (req, res) => {
    try {
        // go through all chats and fetch chats that the logged in user is a part of
        Chat.find({ users: { $elemMatch: { $eq: req.user._id } } })
            .populate("users", "-password") // populate users array, all keys except password
            .populate("groupAdmin", "-password") // if there are groupchats, populate groupAdmin array's all keys except password
            .populate("latestMessage") // populate the latestMessage array of the chat model
            .sort({ updatedAt: -1 }) // sort from new to old
            .then(async (results) => {
                results = await User.populate(results, {
                    path: "latestMessage.sender",
                    select: "name pic email",
                });
               
                res.status(200).send(results);
            });
    } catch (error) {
        res.status(400);
        throw new Error(error.message);
    }
});

const createGroupChat = asyncHandler(async (req, res) => {
    // take a bunch of users from the body and create the name of the groupchat
    if (!req.body.users || !req.body.name) {
        return res.status(400).send({ message: "Please fill out all fields" });
    }

    // we need to send an array of users in a stringified format from the frontend
    // in the backend (here), we will parse the stringified into an object 
    let users = JSON.parse(req.body.users);
    
    if (users.length < 2) {
        return res.status(400).send("More than 2 users is required to create a group chat");
    }

    users.push(req.user); //req.user -> current logged in user 

    try {
        const groupChat = await Chat.create({
            chatName: req.body.name,
            users: users,
            isGroupChat: true,
            groupAdmin: req.user,
        });

        const fullGroupChat = await Chat.findOne({ _id: groupChat._id })
            .populate("users", "-password")
            .populate("groupAdmin", "-password");
        
        res.status(200).json(fullGroupChat);
    } catch (error) {
        res.status(400);
        throw new Error(error.message);
    }
});

const renameGroup = asyncHandler(async (req, res) => {
    const { chatId, chatName } = req.body; // test this in postman
    const updatedChat = await Chat.findByIdAndUpdate(
        chatId, // find the id
        {
            chatName: chatName, // update this attribute
        },
        {
        new: true,
        }
    )
    .populate("users", "-password")
        .populate("groupAdmin", "-password");
    
    if (!updatedChat) {
        res.status(404);
        throw new Error("Chat not found");
    } else {
        res.json(updatedChat);
    }
});

const addToGroup = asyncHandler(async (req, res) => {
    const { chatId, userId } = req.body;
    const added = await Chat.findByIdAndUpdate(
        chatId, // find
        {
            $push: { users: userId }, // update the users array - push the newly "added" userid to the array of the chat
        }, {
        new: true
    }
    )
        .populate("users", "-password")
        .populate("groupAdmin", "-password");
    
    if (!added) {
        res.status(404);
        throw new Error("Chat not found");
    } else {
        res.json(added);
    }
});

const removeFromGroup = asyncHandler(async (req, res) => {
    const { chatId, userId } = req.body;
    const removed = await Chat.findByIdAndUpdate(
        chatId, // find
        {
            $pull: { users: userId }, // update the users array - pull the newly "removed" userid to the array of the chat
        }, {
        new: true
    }
    )
        .populate("users", "-password")
        .populate("groupAdmin", "-password");
    
    if (!removed) {
        res.status(404);
        throw new Error("Chat not found");
    } else {
        res.json(removed);
    }
})

module.exports = { accessChat, fetchChats, createGroupChat, renameGroup, addToGroup, removeFromGroup };