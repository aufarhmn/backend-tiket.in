const express = require('express');
const router = express.Router();

const { registerUser,
        activateUser,
        loginUser,
        editProfilePhoto } = require('../controllers/user');

const { ensureAuthenticated } = require('../middlewares/user');

const { uploadImage } = require('../middlewares/files');

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

// PATH     : /user/profile-photo
// DESC     : Upload user profile photo
// RESPONSE : Uploaded photo data   
router.post('/profile-photo', ensureAuthenticated, uploadImage.single("profilePhoto"), editProfilePhoto);

module.exports = router;