import {
	Box,
	Button,
	FormControl,
	Input,
	Modal,
	ModalBody,
	ModalCloseButton,
	ModalContent,
	ModalFooter,
	ModalHeader,
	ModalOverlay,
	Spinner,
	useDisclosure,
	useToast,
} from "@chakra-ui/react";
import axios from "axios";
import React, { useState } from "react";
import { ChatState } from "../../Context/ChatProvider";
import UserBadgeItem from "../UserAvatar/UserBadgeItem";
import UserListItem from "../UserAvatar/UserListItem";

const GroupChatModal = ({ children }) => {
	const { isOpen, onOpen, onClose } = useDisclosure();
	const [groupChatName, setGroupChatName] = useState();
	const [selectedUsers, setSelectedUsers] = useState([]);

	const [search, setSearch] = useState("");
	const [searchResult, setSearchResult] = useState([]);
	const [loading, setLoading] = useState(false);

	const toast = useToast();

	const { user, chats, setChats } = ChatState();

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
		}
	};

	const handleSubmit = async () => {
		if (!groupChatName || !selectedUsers) {
			toast({
				title: "Please fill out all fields",
				status: "warning",
				duration: 5000,
				isClosable: true,
				position: "top",
			});
			return;
		}

		try {
			const config = {
				headers: {
					Authorization: `Bearer ${user.token}`,
				},
			};

			const { data } = await axios.post(
				"/api/chat/group",
				{
					name: groupChatName,
					users: JSON.stringify(selectedUsers.map((u) => u._id)),
				},
				config
			);

			setChats([data, ...chats]); // add before. add to top
			onClose();
			toast({
				title: "New group chat created!",
				status: "success",
				duration: 5000,
				isClosable: true,
				position: "bottom",
			});
		} catch (error) {
			toast({
				title: "Failed to create the group chat",
				description: error.response.data,
				status: "error",
				duration: 5000,
				isClosable: true,
				position: "bottom",
			});
		}
	};

	const handleDelete = (delUser) => {
		setSelectedUsers(selectedUsers.filter((sel) => sel._id !== delUser._id));
	};

	const handleGroup = (userToAdd) => {
		if (selectedUsers.includes(userToAdd)) {
			toast({
				title: "User was already added",
				status: "warning",
				duration: 5000,
				isClosable: true,
				position: "top",
			});
			return;
		}

		setSelectedUsers([...selectedUsers, userToAdd]);
	};

	return (
		<>
			<span onClick={onOpen}>{children}</span>

			<Modal isOpen={isOpen} onClose={onClose}>
				<ModalOverlay />
				<ModalContent>
					<ModalHeader
						fontSize="30px"
						fontFamily="Work sans"
						display="flex"
						justifyContent="center"
					>
						Create Group Chat
					</ModalHeader>
					<ModalCloseButton />
					<ModalBody display="flex" flexDir="column" alignItems="center">
						<FormControl>
							<Input
								placeholder="Chat Name"
								mb={3}
								onChange={(e) => setGroupChatName(e.target.value)}
							/>
						</FormControl>
						<FormControl>
							<Input
								placeholder="Add Users"
								mb={1}
								onChange={(e) => handleSearch(e.target.value)}
							/>
						</FormControl>
						<Box display="flex" w="100%" flexWrap="wrap">
							{" "}
							{/*is flexwrap necessary? */}
							{selectedUsers &&
								selectedUsers.map((u) => (
									<UserBadgeItem
										key={user._id}
										user={u}
										handleFunction={() => handleDelete(u)}
									/>
								))}
						</Box>
						{loading ? (
							<div>loading</div>
						) : (
							searchResult
								?.slice(0, 4)
								.map((u) => (
									<UserListItem
										key={user._id}
										user={u}
										handleFunction={() => handleGroup(u)}
									/>
								)) //top 4 search results at a time
						)}
					</ModalBody>

					<ModalFooter>
						<Button colorScheme="pink" onClick={handleSubmit}>
							Create Chat
						</Button>
					</ModalFooter>
				</ModalContent>
			</Modal>
		</>
	);
};

export default GroupChatModal;
