const asyncHandler = require("express-async-handler"); // https://www.npmjs.com/package/express-async-handler
const Chat = require("../models/chatModel");
const User = require("../models/userModel");
const Message = require("../models/MessageModel");

const sendMessage = asyncHandler(async (req, res) => {
	/** What are the required things to send a message?
	 * chatId of the chat we're sending in
	 * the message itself
	 * the person that sends the message
	 */
	const { content, chatId } = req.body;
	/**On Postman, we pass these info
	 * {
	 *      "content": "hello",
	 *      "chatId": "12343545464554"
	 * }
	 */
	// console.log("content: " + req.body.content);
	// console.log("chatId: " + req.body.chatId);

	//validation
	if (!content || !chatId) {
		console.log("Invalid data passed into request");
		return res.sendStatus(400);
	}

	var newMessage = {
		sender: req.user._id, //logged in user
		content: content,
		chat: chatId,
	}; //check MessageModel.js

	try {
		//create a message
		let message = await Message.create(newMessage);

		// populate the content of this message
		message = await message.populate("sender", "name pic"); // populate only name and pic
		message = await message.populate("chat"); // populate everything in chat
		// in chatModel there a "users" key
		// each chat has a list of users, so we want to populate all users in the chat
		message = await User.populate(message, {
			path: "chat.users", // "chat" key in Message model, "users" in Chat model
			select: "name pic email", // take name pic email
		});

		// console.log(message);
		// whenever we send a message, it's going to be the chat.latestMessage
		// so we need to find chat by id and update
		await Chat.findByIdAndUpdate(req.body.chatId, {
			latestMessage: message,
		});


		res.json(message);
	} catch (error) {
		res.status(400);
		throw new Error(error.message);
	}
});

const allMessages = asyncHandler(async (req, res) => {
	// fetch all messages of a chat by finding its chatId
	try {
		let messages = await Message.find({ chat: req.params.chatId }).populate(
			"sender",
			"name pic email"
		).populate("chat"); 
		// {chat:req.params.chatId} because it's inside of the parameters router.route("/:chatId").get(protect, allMessages); (messageRoutes.js)
		// after we find the object, we populate the sender object and take its name, pic and email
        // also populate the chat (check MessageModel.js)
        // console.log(messages);
        res.json(messages);

    } catch (error) {
        res.status(400);
        throw new Error(error.message); 
    }
});

module.exports = { sendMessage, allMessages };
