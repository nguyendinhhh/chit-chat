import React, {useEffect} from "react";
import {
	Container,
	Box,
	Text,
	TabList,
	Tab,
	TabPanels,
	TabPanel,
	Tabs,
} from "@chakra-ui/react";
import Login from "../components/authentication/Login";
import Signup from "../components/authentication/Signup";
import { useHistory } from "react-router-dom";

const Homepage = () => {
	const history = useHistory();

	useEffect(() => {
        const user = JSON.parse(localStorage.getItem("userInfo"));

        if (user) { // if user is logged in, go to /chats page
            history.push("/chats");
        }
    }, [history]);

	return (
		<Container maxW="xl" centerContent>
			<Box
				d="flex" //display
				justifyContent="center"
				p={3} // padding
				bg={"white"}
				w="100%"
				m="40px 0 15px 0" // margin
				borderRadius="lg"
				borderWidth="1px"
			>
				<Text
					fontSize="4xl"
					fontFamily="Work sans"
					color="black"
					align="center"
				>
					chit-chat
				</Text>
			</Box>
			<Box bg={"white"} w="100%" p={4} borderRadius="lg" borderWidth="1px">
				<Tabs variant="soft-rounded" colorScheme={"pink"}>
					<TabList mb="1em">
						<Tab width="50%">Login</Tab>
						<Tab width="50%">Sign Up</Tab>
					</TabList>
					<TabPanels>
						<TabPanel><Login /></TabPanel>
						<TabPanel><Signup /></TabPanel>
					</TabPanels>
				</Tabs>
				<Text textAlign="center">The app is still in an ongoing development state. Please refresh the page after you signup and login so your main chat page can be shown. Thank you very much!</Text>
				<Text mt={4} fontSize="small" textAlign="center">Created By Nguyen Dinh</Text>
			</Box>
		</Container>
	);
};

export default Homepage;
