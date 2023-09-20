const express = require('express');
const router = express.Router();

const { registerUser,
        activateUser } = require('../controllers/user');

// PATH     : /user/register
// DESC     : Register new user
// RESPONSE : Registered user data and send email activation
router.post('/register', registerUser);

// PATH     : /user/activate/:token
// DESC     : Activate user account
// RESPONSE : Activated user data
router.get('/activate', activateUser);

module.exports = router;