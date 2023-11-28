const jwt = require("jsonwebtoken");
const User = require("../models/User");

exports.ensureAuthenticated = (req, res, next) => {
    const token = req.headers.authorization && req.headers.authorization.split(' ')[1];

    if (!token) {
        return res.status(401).json({
            message: "Missing authentication token!",
        });
    }

    jwt.verify(token, process.env.JWT_SECRET, (err, decodedToken) => {
        if (err) {
            return res.status(401).json({
                message: "Invalid or expired token!",
            });
        }

        req.userId = decodedToken.userId;
        req.email = decodedToken.email;

        User.findById(req.userId)
            .then((user) => {
                if (!user) {
                    return res.status(404).json({
                        message: "User not found!",
                    });
                } else if (user.status !== "VERIFIED") {
                    return res.status(404).json({
                        message: "Please activate your account!",
                    });
                } else {
                    next();
                }
            })
            .catch((err) => {
                res.status(500).json({
                    message: "Error retrieving user!",
                    error: err,
                });
            });
    });
};

exports.ensureAdmin = (req, res, next) => {
    const userId = req.userId;

    User.findById(userId)
        .then((user) => {
            if(!user){
                return res.status(404).json({
                    message: "User not found!",
                });
            } else if (user.role !== "ADMIN") {
                return res.status(404).json({
                    message: "Access Denied! Admin Access Only!",
                });
            } else {
                next();
            }

        })
        .catch((err) => {
            res.status(500).json({
                message: "Error retrieving user!",
                error: err,
            });
        });
};