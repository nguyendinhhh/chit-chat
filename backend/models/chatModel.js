// chatName
// isGroupChat
// users
// latestMessage
// groupAdmin

const mongoose = require("mongoose");
const chatModel = mongoose.Schema(
	{
		chatName: { type: String, trim: true }, //no trailing spaces,
		isGroupChat: { type: Boolean, default: false },
		users: [
			{
				type: mongoose.Schema.Types.ObjectId,
				ref: "User",
			},
		],
		latestMessage: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "Message",
		},
		groupAdmin: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "User",
		},
	},
	{
		timestamps: true, //mongoose can create a timestamp everytime we add a new data
	},
);

const Chat = mongoose.model("Chat", chatModel);

module.exports = Chat;
