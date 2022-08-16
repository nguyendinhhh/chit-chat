const express = require("express");
const dotenv = require("dotenv");
const { chats } = require("./data/data");
const app = express();
app.use(express.json()); // to accept json data

// const cors = require('cors');
const connectDB = require("./config/db");
const userRoutes = require("./routes/userRoutes");
const chatRoutes = require("./routes/chatRoutes");
const messageRoutes = require("./routes/messageRoutes");
const { notFound, errorHandler } = require("./middleware/errorMiddleware");

dotenv.config();
connectDB(); // needs to be under dotenv.config()

// app.use(cors({
//     credentials: true,
//     origin: "http://localhost:3000"
// }))

app.get("/", (req, res) => {
	res.send("api is running successfully");
});

// app.get('/api/chat', (req, res) => {
//     res.send(chats);
// })

// app.get('/api/chat/:id', (req, res) => {
//     // console.log(req.params.id);
//     const singleChat = chats.find(c => c._id === req.params.id);
//     res.send(singleChat);
// })

app.use("/api/user", userRoutes); // home route for user
app.use("/api/chat", chatRoutes); //home route for chat
app.use("/api/message", messageRoutes); // home route for messages

app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 8000;

// before setting up socket.io, the below was not a variable
const server = app.listen(PORT, console.log(`Server started on PORT ${PORT}`)); // could not use 5000, couldn't kill all processes using 5000

const io = require("socket.io")(server, {
	// within 60 seconds if user doesn't send any messages or sum, it will close the connection to save the bandwidth
	pingTimeout: 60000, //the amount of time it will wait while being inactive, it will wait 60 secs before it goes off
	cors: {
		origin: "http://localhost:3000",
	}, // to prevent cross-origin errors
});

io.on("connection", (socket) => {
    console.log("Connected to socket.io");

    // logged in user should be connected to his/her own personal socket
    // https://socket.io/docs/v4/server-initialization/
    // https://socket.io/docs/v4/server-instance/
    // https://socket.io/docs/v4/server-socket-instance/
    // when user logs in / joins the app, this method happens
    socket.on("setup", (userObj) => {
        // create a new room with the id of the userobject
        // room is exclusive to that user only
        socket.join(userObj._id);
        console.log(userObj._id);
        socket.emit("connected");
    });

    // joining a chat
    socket.on("join chat", (room) => {
        socket.join(room); // room is the chatId
        console.log("A logged in user joined room: " + room);
    })

    socket.on("typing", (room) => socket.in(room).emit("typing"));
    socket.on("stop typing", (room) => socket.in(room).emit("stop typing"));

    socket.on("new message", (newMessageReceived) => {
        // check which chat the newmessage belongs to
        let chat = newMessageReceived.chat;

        if (!chat.users) return console.log("chat.users not defined");

        // example, there are 5 users in the room. The new message should be shown
        // for the 4 users, not me
        chat.users.forEach((user) => {
            if (user._id === newMessageReceived.sender._id) return;
            socket.in(user._id).emit("message received", newMessageReceived);
        })
    })

    // disconnect socket
    socket.off("setup", () => {
        console.log("USER DISCONNECTED");
        socket.leave(userObj._id);
    });
    
});
