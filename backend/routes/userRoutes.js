// routes that are related to our users
const express = require('express')
const {registerUser, authUser, allUsers} = require('../controllers/userControllers')
const { protect } = require("../middleware/authMiddleware");

const router = express.Router()

// get(protect, allUsers) --> app will go thru middleware protect first and then get allusers
router.route('/').post(registerUser).get(protect, allUsers); // this post medthod sends the new user to the databse
// with the auth middleware, everytime we make an api call, we need to pass the bearer token
/**
const config = {
    headers: {
        Authorization: `Bearer ${user.token}`,
    },
};
 */

router.post('/login', authUser) // /api/user/login

module.exports = router;