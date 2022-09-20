import React, { useState } from "react";
import {
	Button,
	FormControl,
	FormLabel,
	Input,
	InputGroup,
	InputRightElement,
	VStack,
	useToast,
} from "@chakra-ui/react";
import axios from "axios";
import { useHistory } from "react-router-dom";
import { ChatState } from "../../Context/ChatProvider";

const Login = () => {
	const [show, setShow] = useState(false);
	const handleClick = () => setShow(!show);
	const toast = useToast();
	const [email, setEmail] = useState();
	const [password, setPassword] = useState();
	const [loading, setLoading] = useState(false);

	const history = useHistory();

	const submitHandler = async () => {
		setLoading(true);
		if (!email || !password) {
			toast({
				title: "Please Fill all the Feilds",
				status: "warning",
				duration: 5000,
				isClosable: true,
				position: "bottom",
			});
			setLoading(false);
			return;
		}
		try {
			const config = {
				headers: {
					"Content-type": "application/json",
				},
			};

			const { data } = await axios.post(
				"/api/user/login",
				{ email, password },
				config
			);

			toast({
				title: "Login Successful",
				status: "success",
				duration: 5000,
				isClosable: true,
				position: "bottom",
			});
			localStorage.setItem("userInfo", JSON.stringify(data));
			setLoading(false);
			history.push("/chats");
		} catch (error) {
			toast({
				title: "Error Occured!",
				description: error.response.data.message,
				status: "error",
				duration: 5000,
				isClosable: true,
				position: "bottom",
			});
			setLoading(false);
		}
	};

	return (
		<VStack spacing="10px">
			<FormControl id="email" isRequired>
				<FormLabel>Email Address</FormLabel>
				<Input
					value={email}
					type="email"
					placeholder="Enter Your Email Address"
					onChange={(e) => setEmail(e.target.value)}
				/>
			</FormControl>
			<FormControl id="password" isRequired>
				<FormLabel>Password</FormLabel>
				<InputGroup size="md">
					<Input
						value={password}
						onChange={(e) => setPassword(e.target.value)}
						type={show ? "text" : "password"}
						placeholder="Enter password"
					/>
					<InputRightElement width="4.5rem">
						<Button h="1.75rem" size="sm" onClick={handleClick}>
							{show ? "Hide" : "Show"}
						</Button>
					</InputRightElement>
				</InputGroup>
			</FormControl>
			<Button
				colorScheme="pink"
				width="100%"
				style={{ marginTop: 15 }}
				onClick={submitHandler}
				isLoading={loading}
			>
				Login
			</Button>
		</VStack>
	);
};
// const Login = () => {
// 	const [email, setEmail] = useState();
// 	const [password, setPassword] = useState();
// 	const [show, setShow] = useState(false);
// 	const [loading, setLoading] = useState(false);

// 	const handleClick = () => setShow(!show);
// 	const toast = useToast();
// 	const history = useHistory();
// 	const { setUser, setInitialLoading } = ChatState();

// 	const submitHandler = async (e) => {
// 		setLoading(true);
// 		if (!email || !password) {
// 			toast({
// 				title: "Please fill out all fields",
// 				status: "warning",
// 				duration: 5000,
// 				isClosable: true,
// 				position: "bottom",
// 			});
// 			setLoading(false);
// 			return;
// 		}

// 		try {
// 			const config = {
// 				headers: {
// 					"Content-type": "application/json",
// 				},
// 			};
// 			const { data } = await axios.post(
// 				"/api/user/login",
// 				{ email, password },
// 				config
// 			);
// 			toast({
// 				title: "Login Successful",
// 				status: "success",
// 				duration: 5000,
// 				isClosable: true,
// 				position: "bottom",
// 			});
// 			setInitialLoading(true);
// 			setUser(data);
// 			localStorage.setItem("userInfo", JSON.stringify(data)); // for context api. Check ChatProvider.js
// 			setLoading(false);
// 			history.push("/chats");
// 			setTimeout(() => {
// 				setInitialLoading(false);
// 			}, 2000);
// 		} catch (error) {
// 			console.log(error);
// 			toast({
// 				title: "Error Occured!",
// 				description: error,
// 				status: "error",
// 				duration: 5000,
// 				isClosable: true,
// 				position: "bottom",
// 			});
// 			setLoading(false);
// 		}
// 	};

// 	return (
// 		<VStack spacing="5px">
// 			<FormControl id="email" isRequired>
// 				<FormLabel>Email</FormLabel>
// 				<Input
// 					placeholder="Enter Your Email"
// 					value={email} // after adding this line, if user clicks get guest creds button, the field is automatically filled, thanks to useState
// 					onChange={(e) => setEmail(e.target.value)}
// 				/>
// 			</FormControl>
// 			<FormControl id="password" isRequired>
// 				<FormLabel>Password</FormLabel>
// 				<InputGroup>
// 					<Input
// 						type={show ? "text" : "password"}
// 						placeholder="Password"
// 						value={password} // after adding this line, if user clicks get guest creds button, the field is automatically filled, thanks to useState
// 						onChange={(e) => setPassword(e.target.value)}
// 					/>
// 					<InputRightElement width="4.5em">
// 						<Button h="1.75rem" size="sm" onClick={handleClick}>
// 							{show ? "Hide" : "Show"}
// 						</Button>
// 					</InputRightElement>
// 				</InputGroup>
// 			</FormControl>
// 			<Button
// 				colorScheme={"pink"}
// 				width="100%"
// 				style={{ marginTop: 15 }}
// 				onClick={submitHandler}
// 				isLoading={loading}
// 			>
// 				Login
// 			</Button>
// 			{/* <Button
// 				variant="solid"
// 				colorScheme={"gray"}
// 				width="100%"
// 				style={{ marginTop: 15 }}
// 				onClick={() => {
// 					setEmail("guest@example.com");
// 					setPassword("mypassword");
// 				}}
// 			>
// 				Get Guest User Credentials
// 			</Button> */}
// 		</VStack>
// 	);
// };

export default Login;
