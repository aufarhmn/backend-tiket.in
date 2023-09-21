const express = require('express');
const router = express.Router();

const { registerUser,
        activateUser,
        loginUser } = require('../controllers/user');

const { ensureAuthenticated,
        ensureAdmin } = require('../middlewares/user');

// PATH     : /user/register
// DESC     : Register new user
// RESPONSE : Registered user data and send email activation
router.post('/register', registerUser);

// PATH     : /user/activate
// DESC     : Activate user account
// RESPONSE : Activated user data
router.get('/activate', activateUser);

// PATH     : /user/login
// DESC     : Login user
// RESPONSE : Logged in user data
router.post('/login', loginUser);

module.exports = router;