const express = require('express');
const router = express.Router();

const { registerUser,
        activateUser,
        loginUser,
        editProfilePhoto,
        editUser,
        getUserInfo,
        deleteUser,
        forgotPassword,
        activateNewPassword,
        registerEvent,
        uploadPayment } = require('../controllers/user');

const { retrieveEvents,
        retrieveEventById } = require('../controllers/admin');

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

// PATH     : /user/events
// DESC     : Get all events
// RESPONSE : Array containing all events
router.get('/events', ensureAuthenticated, retrieveEvents);

// PATH     : /user/event/:id
// DESC     : Get single event by id
// RESPONSE : Event json data
router.get('/event/:id', ensureAuthenticated, retrieveEventById);

// PATH     : /user
// DESC     : Edit user data
// RESPONSE : Edited user data
router.put('/', ensureAuthenticated, editUser);

// PATH     : /user
// DESC     : Get user data
// RESPONSE : User json data
router.get('/', ensureAuthenticated, getUserInfo);

// PATH     : /user
// DESC     : Delete user
// RESPONSE : Message after deleting user
router.delete('/', ensureAuthenticated, deleteUser);

// PATH     : /user/forgot-password
// DESC     : Forgot password
// RESPONSE : Message after sending email
router.post('/forgot-password', forgotPassword);

// PATH     : /user/activate-new-password
// DESC     : Activate new password
// RESPONSE : Message after activating new password
router.get('/reset-password', activateNewPassword);

// PATH     : /user/register-event
// DESC     : Register event
// RESPONSE : Message after registering event
router.post('/register-event', ensureAuthenticated, registerEvent);

// PATH     : /user/upload-payment
// DESC     : Upload payment
// RESPONSE : Message after uploading payment
router.post('/upload-payment', ensureAuthenticated, uploadImage.single("paymentFile"), uploadPayment);

module.exports = router;