const asyncHandler = require("express-async-handler"); //https://www.npmjs.com/package/express-async-handler
const User = require("../models/userModel");
const generateToken = require("../config/generateToken");

const registerUser = asyncHandler(async (req, res) => {
	const { name, email, password, pic } = req.body;

	if (!name || !email || !password) {
		res.status(400);
		throw new Error("Please enter all fields");
	}

	const userExists = await User.findOne({ email });
	if (userExists) {
		res.status(400);
		throw new Error("User already exists");
	}

	const user = await User.create({
		name,
		email,
		password,
		pic,
	});

	if (user) {
		res.status(201).json({
			_id: user._id,
			name: user.name,
			email: user.email,
			pic: user.pic,
			token: generateToken(user._id),
		});
	} else {
		res.status(400);
		throw new Error("Failed to create user");
	}
});

const authUser = asyncHandler(async (req, res) => {
	const { email, password } = req.body;
	const user = await User.findOne({ email });
	if (user && (await user.matchPassword(password))) {
		res.json({
			_id: user._id,
			name: user.name,
			email: user.email,
			pic: user.pic,
			token: generateToken(user._id),
		});
	} else {
		res.status(400);
		throw new Error("Invalid email or password");
	}
});

// /api/user?search=nguyen
const allUsers = asyncHandler(async (req, res) => {
	const keyword = req.query.search
		? {
            $or: [ // https://www.mongodb.com/docs/manual/reference/operator/query/or/
                { name: new RegExp(req.query.search, 'i') }, // https://www.mongodb.com/docs/manual/reference/operator/query/regex/
                { email: new RegExp(req.query.search, 'i') },
                // { email: { $regex: req.query.search, $option: "i" } }, // this one didn't work for some reasons although syntax is correct
            ],
		  }
		: {};
	// console.log(keyword);

    // query the database - return me a list of users that are the part of the search above except for the current user req.user._id
    // to get the req.user._id we need to authorize the user that is currently logged in
    // we need the "current user" to log in and provide the json web token --> check /middleware/authMiddleware and userRoutes.js
    const users = await User.find(keyword).find({ _id: { $ne: req.user._id } }); //$ne - not equals to
    res.send(users);
});

module.exports = { registerUser, authUser, allUsers };
