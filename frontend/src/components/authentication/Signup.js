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

const Signup = () => {
	const [name, setName] = useState();
	const [email, setEmail] = useState();
	const [password, setPassword] = useState();
	const [confirmpassword, setConfirmpassword] = useState();
	const [pic, setPic] = useState();
	const [loading, setLoading] = useState(false);
	const { setUser, setInitialLoading } = ChatState();

	const [show, setShow] = useState(false);
	const handleClick = () => setShow(!show);

	const toast = useToast();
	const history = useHistory();
	const postDetails = (pics) => {
		setLoading(true); // button loads (animation) while posting pic

		if (pics === undefined) {
			toast({
				title: "Please select an image.",
				status: "warning",
				duration: 5000,
				isClosable: true,
				position: "bottom",
			});
			return;
		}

		if (pics.type === "image/jpeg" || pics.type === "image/png") {
			const data = new FormData();
			data.append("file", pics);
			data.append("upload_preset", "chit-chat"); // name from preset on Cloudinary
			data.append("cloud_name", "ndinh"); // cloud name on Cloudinary
			fetch("https://api.cloudinary.com/v1_1/ndinh/image/upload", {
				method: "post", // a post request
				body: data,
			})
				.then((res) => res.json())
				.then((data) => {
                    setPic(data.url.toString()); // setPic if pic uploaded successfully
					// console.log(data.url.toString());
					setLoading(false);
				})
				.catch((err) => {
					console.log(err);
					setLoading(false);
				});
		} else {
			toast({
				title: "Please select an image.",
				status: "warning",
				duration: 5000,
				isClosable: true,
				position: "bottom",
            });
            setLoading(false);
			return;
        }
    
	};

	const submitHandler = async () => {
		setLoading(true);
		if (!name || !email || !password || !confirmpassword) {
			toast({
				title: "Please fill out all fields",
				status: "warning",
				duration: 5000,
				isClosable: true,
				position: "bottom",
            });
            setLoading(false);
			return;
		}
		if (password !== confirmpassword) {
			toast({
				title: "Passwords do not match",
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
			const { data } = await axios.post("/api/user", { name, email, password, pic }, config);
			toast({
				title: "Registration Successful",
				status: "success",
				duration: 5000,
				isClosable: true,
				position: "bottom",
			});
			setInitialLoading(true);
			// setUser(data);
			localStorage.setItem('userInfo', JSON.stringify(data));
			setLoading(false);
			history.push('/chats');
			setTimeout(() => {
				setInitialLoading(false);
			}, 2000);
		} catch (error) {
			console.log(error);
			toast({
				title: "Error Occured!",
				description: error,
				status: "error",
				duration: 5000,
				isClosable: true,
				position: "bottom",
			});
			setLoading(false);
		}
	};

	return (
		<VStack spacing="5px">
			<FormControl id="first-name" isRequired>
				<FormLabel>Name</FormLabel>
				<Input
					placeholder="Enter Your Name"
					onChange={(e) => setName(e.target.value)}
				/>
			</FormControl>
			<FormControl id="email" isRequired>
				<FormLabel>Email</FormLabel>
				<Input
					placeholder="Enter Your Email"
					onChange={(e) => setEmail(e.target.value)}
				/>
			</FormControl>
			<FormControl id="password" isRequired>
				<FormLabel>Password</FormLabel>
				<InputGroup>
					<Input
						type={show ? "text" : "password"}
						placeholder="Password"
						onChange={(e) => setPassword(e.target.value)}
					/>
					<InputRightElement width="4.5em">
						<Button h="1.75rem" size="sm" onClick={handleClick}>
							{show ? "Hide" : "Show"}
						</Button>
					</InputRightElement>
				</InputGroup>
			</FormControl>
			<FormControl id="confirm-password" isRequired>
				<FormLabel>Confirm Password</FormLabel>
				<InputGroup>
					<Input
						type={show ? "text" : "password"}
						placeholder="Confirm Password"
						onChange={(e) => setConfirmpassword(e.target.value)}
					/>
					<InputRightElement width="4.5em">
						<Button h="1.75rem" size="sm" onClick={handleClick}>
							{show ? "Hide" : "Show"}
						</Button>
					</InputRightElement>
				</InputGroup>
			</FormControl>

			<FormControl id="pic">
				<FormLabel>Upload your Photo</FormLabel>
				<Input
					type="file"
					p="1.5"
					accept="image/*"
					onChange={(e) => postDetails(e.target.files[0])}
				/>
			</FormControl>

			<Button
				colorScheme={"pink"}
				width="100%"
				style={{ marginTop: 15 }}
                onClick={submitHandler}
                isLoading={loading}
			>
				Sign Up
			</Button>
		</VStack>
	);
};

export default Signup;
