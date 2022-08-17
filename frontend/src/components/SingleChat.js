import { ArrowBackIcon } from "@chakra-ui/icons";
import {
	Box,
	FormControl,
	IconButton,
	Input,
	Spinner,
	Text,
	Toast,
	useToast,
} from "@chakra-ui/react";
import axios from "axios";
import React, { useEffect, useState } from "react";
import { getSender, getSenderFull } from "../config/ChatLogics";
import { ChatState } from "../Context/ChatProvider";
import ProfileModal from "./miscellaneous/ProfileModal";
import UpdateGroupChatModal from "./miscellaneous/UpdateGroupChatModal";
import ScrollableChat from "./ScrollableChat";
import "./styles.css";

import io from "socket.io-client";
const ENDPOINT = "https://chitto-chatto.herokuapp.com/"; //was "http://localhost:8000"; // server uses port 8000
let socket, selectedChatCompare;

const SingleChat = ({ fetchAgain, setFetchAgain }) => {
	const [messages, setMessages]  = useState([]);
	const [newMessage, setNewMessage] = useState("");
	const [loading, setLoading] = useState(false);
	const [socketConnected, setSocketConnected] = useState(false)
	const [isTyping, setIsTyping] = useState(false);
	const [typing, setTyping] = useState(false);

	const { user, selectedChat, setSelectedChat, notification, setNotification } = ChatState();

	const toast = useToast();

	const fetchMessages = async () => {
		if (!selectedChat) return;
		try {
			setLoading(true);
			const config = {
				headers: {
					Authorization: `Bearer ${user.token}`,
				},
			};

			const { data } = await axios.get(
				`/api/message/${selectedChat._id}`,
				config
			);
			// console.log(messages);
			setMessages(data);
			setLoading(false);
			socket.emit("join chat", selectedChat._id);
		} catch (error) {
			toast({
				title: "Error Occurred",
				description: "Failed to fetch messages",
				status: "error",
				duration: 5000,
				isClosable: true,
				position: "bottom",
			});
			setLoading(false);
		}
	};

	useEffect(() => {
		socket = io(ENDPOINT);
		socket.emit("setup", user);
		socket.on("connected", () => setSocketConnected(true));
		socket.on('typing', () => setIsTyping(true))
		socket.on('stop typing', () => setIsTyping(false));
	}, []);

	useEffect(() => {
		fetchMessages();
		selectedChatCompare = selectedChat;
		// to keep the back up of the state of the selectedChat to check if we're supposed to
		// emit the message or send the notification to the user
	}, [selectedChat]); // fetch messages when the chat changes


	useEffect(() => {
		socket.on("message received", (newMessageReceived) => {
			if (!selectedChatCompare || // if no chat is selected
				selectedChatCompare._id !== newMessageReceived.chat._id) // or if the current selected chat is not the chat that's receving new message
			{
				// then show notification
				if (!notification.includes(newMessageReceived)) {
					setNotification([newMessageReceived, ...notification]);
					setFetchAgain(!fetchAgain);
				}
			} else {
				setMessages([...messages, newMessageReceived]);
			}
		}); // app will monitor this socket to see if recieved any msgs
	}) // update this useEffect everytime the states change

	const sendMessage = async (e) => {
		if (e.key === "Enter" && newMessage) {
			socket.emit("stop typing", selectedChat._id);
			try {
				const config = {
					headers: {
						Authorization: `Bearer ${user.token}`,
						"Content-type": "application/json",
					},
				};
				setNewMessage(""); // to make the input field empty

				const { data } = await axios.post(
					"/api/message",
					{
						content: newMessage,
						chatId: selectedChat._id,
					},
					config
				);
				// console.log(data);
				socket.emit("new message", data); // send message
				setMessages([...messages, data]);
			} catch (error) {
				// console.log(error);
				toast({
					title: "Error Occurred",
					description: "Failed to send message",
					status: "error",
					duration: 5000,
					isClosable: true,
					position: "bottom",
				});
			}
		}
	};

	

	const typingHandler = (e) => {
		setNewMessage(e.target.value);

		//typing indicator logic
		if (!socketConnected) return;

		if (!typing) {
			setTyping(true);
			socket.emit("typing", selectedChat._id);
		}

		// when to stop typing
		let lastTypingTime = new Date().getTime();
		let timerLength = 3000;
		
		setTimeout(() => {
			let timeNow = new Date().getTime();
			let timeDiff = timeNow - lastTypingTime;

			if (timeDiff >= timerLength && typing) {
				socket.emit("stop typing", selectedChat._id);
				setTyping(false);
			}
		}, timerLength);
	};

	return (
		<>
			{selectedChat ? (
				<>
					<Text
						fontSize={{ base: "25px", md: "30px" }}
						pb={3}
						px={2}
						w="100%"
						fontFamily="Work sans"
						display="flex"
						justifyContent={{ base: "space-between" }}
						alignItems="center"
					>
						<IconButton
							display={{ base: "flex", md: "none" }} //only displayed when the screen is small
							icon={<ArrowBackIcon />}
							onClick={() => setSelectedChat("")}
						/>
						{!selectedChat.isGroupChat ? (
							<>
								{getSender(user, selectedChat.users)}
								<ProfileModal
									user={getSenderFull(user, selectedChat.users)}
								/>{" "}
								{/* get the user object, not just the name. Since this ProfileModal doesn't have children, the eye icon will be shown */}
							</>
						) : (
							<>
								{selectedChat.chatName.toUpperCase()}
								<UpdateGroupChatModal
									fetchAgain={fetchAgain}
									setFetchAgain={setFetchAgain}
									fetchMessages={fetchMessages}
								/>
							</>
						)}
					</Text>
					<Box
						display="flex"
						flexDir="column"
						justifyContent="flex-end"
						p={3}
						// bg="#E8E8E8"
						w="100%"
						h="100%"
						borderRadius="lg"
						overflowY="hidden"
					>
						{loading ? (
							<Spinner
								size="lg"
								w={20}
								h={20}
								alignSelf="center"
								margin="auto"
							/>
						) : (
								<div className="messages">
									<ScrollableChat messages={messages} />
							</div>
						)}
						<FormControl onKeyDown={sendMessage} isRequired mt={3}>
							{isTyping && <div style={{marginBottom:"2px", color:"grayText", fontFamily:"Work sans"}} >Typing...</div>}
							<Input
								variant="filled" // try hovering the mouse on the input field. try variant="outline"
								bg="#E0E0E0"
								placeholder="Enter a message..."
								onChange={typingHandler}
								value={newMessage}
							/>
						</FormControl>
					</Box>
				</>
			) : (
				<Box
					display="flex"
					alignItems="center"
					justifyContent="center"
					h="100%"
				>
					<Text fontSize="3xl" pb={3} fontFamily="Work sans">
						Click on a user to start chatting
					</Text>
				</Box>
			)}
		</>
	);
};

export default SingleChat;
