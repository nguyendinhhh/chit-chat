const jwt = require('jsonwebtoken');
const User = require('../models/userModel.js');
const asyncHandler = require('express-async-handler'); //https://www.npmjs.com/package/express-async-handler

const protect = asyncHandler(async (req, res, next) => {
    let token;
    if (req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {
        try {
            token = req.headers.authorization.split(" ")[1]; // Bearer token looks like "Bearer 1dklsjfoakf" --> split and take the token
            // decodes token id
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            req.user = await User.findById(decoded.id).select("-password"); // find the user by id and return it without the password
            next();
        } catch (error) {
            res.status(401);
            throw new Error("Not authorized, token failed");
        }
    }
    if (!token) {
        res.status(401);
        throw new Error("Not authorized, token failed");
    }
});

module.exports = { protect };