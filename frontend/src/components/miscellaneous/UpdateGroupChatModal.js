import { ViewIcon } from "@chakra-ui/icons";
import {
	Box,
	Button,
	FormControl,
	IconButton,
	Input,
	Modal,
	ModalBody,
	ModalCloseButton,
	ModalContent,
	ModalFooter,
	ModalHeader,
	ModalOverlay,
	Spinner,
	Text,
	useDisclosure,
	useToast,
} from "@chakra-ui/react";
import axios from "axios";
import React, { useState } from "react";
import { ChatState } from "../../Context/ChatProvider";
import UserBadgeItem from "../UserAvatar/UserBadgeItem";
import UserListItem from "../UserAvatar/UserListItem";

const UpdateGroupChatModal = ({ fetchAgain, setFetchAgain, fetchMessages }) => {
	const { isOpen, onOpen, onClose } = useDisclosure();
	const [groupChatName, setGroupChatName] = useState();
	const [search, setSearch] = useState("");
	const [searchResult, setSearchResult] = useState([]);
	const [loading, setLoading] = useState(false);
	const [renameLoading, setRenameLoading] = useState(false);

	const toast = useToast();

	const { selectedChat, setSelectedChat, user } = ChatState();

    const handleRemove = async (userObj) => {
		if (selectedChat.groupAdmin._id !== user._id && user._id !== userObj._id) { // user = logged in user, userObj = user we want to remove
			toast({
				title: "Only admin can remove user",
				status: "error",
				duration: 5000,
				isClosable: "true",
				position: "bottom",
			});
			return;
        }
        
        try {
            setLoading(true);
            const config = {
				headers: {
					Authorization: `Bearer ${user.token}`,
				},
            };

            const { data } = await axios.put("/api/chat/groupremove",
                {
                    chatId: selectedChat._id,
                    userId: userObj._id,
                },
                config
            );
            
            userObj._id === user._id ? setSelectedChat() : setSelectedChat(data); // if logged in user leaves group, group chat is no longer a selected chat
			setFetchAgain(!fetchAgain); // fetch the list of users of the selectedChat
			fetchMessages();
            setLoading(false);

        } catch (error) {
            toast({
				title: "Error Occurred!",
				description: error.response.data.message,
				status: "error",
				duration: 5000,
				isClosable: true,
				position: "bottom",
			});
			setLoading(false);
        }
    };

	const handleRename = async () => {
		if (!groupChatName) return;

		try {
			setRenameLoading(true);
			const config = {
				headers: {
					Authorization: `Bearer ${user.token}`,
				},
			};

			const { data } = await axios.put(
				"/api/chat/rename",
				{
					chatId: selectedChat._id,
					chatName: groupChatName,
				},
				config
			);

			setSelectedChat(data);
			setFetchAgain(!fetchAgain); // the list of the users of the chat gets updated again
			setRenameLoading(false);
		} catch (error) {
			toast({
				title: "Error Occurred",
				description: error.response.data.message,
				status: "error",
				duration: 5000,
				isClosable: true,
				position: "bottom",
			});
			setRenameLoading(false);
		}

		setGroupChatName(""); // not mandatory but it clears up the input field after renaming
	};

	const handleSearch = async (query) => {
		setSearch(query);

		if (!query) {
			return;
		}

		try {
			setLoading(true);
			const config = {
				headers: {
					Authorization: `Bearer ${user.token}`,
				},
			};

			const { data } = await axios.get(`/api/user?search=${search}`, config);
			// console.log(data);
			setSearchResult(data);
			setLoading(false);
		} catch (error) {
			toast({
				title: "Error Occurred!",
				description: "Failed to load the Search Results",
				status: "error",
				duration: 5000,
				isClosable: true,
				position: "bottom-left",
            });
            setLoading(false);
		}
	};

	const handleAddUser = async (userObj) => {
		// check if user already exists in group
		if (selectedChat.users.find((u) => u._id === userObj._id)) {
			toast({
				title: "User is already in the group",
				status: "error",
				duration: 5000,
				isClosable: "true",
				position: "bottom",
			});
			return;
		}

		// check if user is admin of groupchat
		if (selectedChat.groupAdmin._id !== user._id) { // user = logged in user, userObj = user we want to add
			toast({
				title: "Only admin can add new user",
				status: "error",
				duration: 5000,
				isClosable: "true",
				position: "bottom",
			});
			return;
		}

		try {
			setLoading(true);

			const config = {
				headers: {
					Authorization: `Bearer ${user.token}`,
				},
			};

			const { data } = await axios.put(
				"/api/chat/groupadd",
				{
					chatId: selectedChat._id,
					userId: userObj._id,
				},
				config
			);

			setSelectedChat(data);
			setFetchAgain(!fetchAgain);
			setLoading(false);
		} catch (error) {
			toast({
				title: "Error Occurred!",
				description: "Failed to load the Search Results",
				status: "error",
				duration: 5000,
				isClosable: true,
				position: "bottom-left",
			});
			setLoading(false);
		}
	};

	return (
		<>
			<IconButton icon={<ViewIcon />} onClick={onOpen} />{" "}
			{/** without icon attr, it will be just a blank box */}
			<Modal isOpen={isOpen} onClose={onClose} isCentered>
				<ModalOverlay />
				<ModalContent>
					<ModalHeader fontSize="20px" display="flex" justifyContent="center">
						{selectedChat.chatName}
					</ModalHeader>
					<ModalCloseButton />
					<ModalBody>
						<Box display="flex" flexWrap="wrap" pb={3}> {/**https://developer.mozilla.org/en-US/docs/Web/CSS/flex-wrap */}
							{selectedChat.users.map((u) => (
								<UserBadgeItem
									key={user._id}
									user={u}
									handleFunction={() => handleRemove(u)}
								/>
							))}
						</Box>
						<Box mb={2}>
                            {selectedChat.groupAdmin && (
                                <>
                                    <Text>Admin: {selectedChat.groupAdmin.name}</Text>
								    <Text>{selectedChat.groupAdmin.email}</Text>
                                </>
							)}
						</Box>
						<FormControl display={{ base: "flex" }} mb={2}>
							<Input
								placeholder="Chat Name"
								value={groupChatName}
								onChange={(e) => setGroupChatName(e.target.value)}
							/>
							<Button
								backgroundColor="#FED7E2"
								ml={2}
								isLoading={renameLoading}
								onClick={handleRename}
							>
								Update
							</Button>
						</FormControl>
						<FormControl display="flex">
							<Input
								placeholder="Add user to group"
								onChange={(e) => handleSearch(e.target.value)}
							/>
						</FormControl>
						{loading ? (
							<Spinner size="lg" />
						) : (
							searchResult?.map((u) => (
								<UserListItem
									key={user._id}
									user={u}
									handleFunction={() => handleAddUser(u)}
								/>
							))
						)}
					</ModalBody>
					<ModalFooter>
						<Button colorScheme="red" onClick={() => handleRemove(user)}>
							Leave Group
						</Button>
					</ModalFooter>
				</ModalContent>
			</Modal>
		</>
	);
};

export default UpdateGroupChatModal;
