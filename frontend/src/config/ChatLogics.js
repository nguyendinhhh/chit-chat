export const getSender = (loggedUser, users) => {
	return users[0]._id === loggedUser._id ? users[1].name : users[0].name;
};

export const getSenderFull = (loggedUser, users) => {
	return users[0]._id === loggedUser._id ? users[1] : users[0];
};

// the next 2 chat logics are to display profile photo next to the most bottom message of a list of messages of one sender
export const isSameSender = (messages, currentMessage, index, userId) => {
	//index is the index of the currentMessage
	return (
		index < messages.length - 1 && // check if it's less than the length of the messages array
		(messages[index + 1].sender._id !== currentMessage.sender._id || // check if the next message is NOT equal to the current sender
			messages[index + 1].sender._id === undefined) &&
		messages[index].sender._id !== userId // check if the sender is NOT the current logged in user. For the logged in user we are not going to display profile photo
	);
};

// check if its the last message of the opposed user
export const isLastMessage = (messages, index, userId) => {
	return (
		index === messages.length - 1 &&
		messages[messages.length - 1].sender._id !== userId &&
		messages[messages.length - 1].sender._id
	);
};

export const isSameSenderMargin = (messages, currentMessage, index, userId) => {
	if (
		index < messages.length - 1 &&
		messages[index + 1].sender._id === currentMessage.sender._id &&
		messages[index].sender._id !== userId
	)
		return 33;
	else if (
		(index < messages.length - 1 &&
			messages[index + 1].sender._id !== currentMessage.sender._id &&
			messages[index].sender._id !== userId) ||
		(index === messages.length - 1 && messages[index].sender._id !== userId)
	)
		return 0;
	else return "auto";
};

export const isSameUser = (messages, currentMessage, index) => {
	return (
		index > 0 && messages[index - 1].sender._id === currentMessage.sender._id
	);
};
