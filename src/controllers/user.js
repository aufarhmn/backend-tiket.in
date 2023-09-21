const User = require("../models/user");
const bcrypt = require("bcrypt");
const nodemailer = require("nodemailer");
const jwt = require("jsonwebtoken");
const { drive } = require("../config/drive");
const { Readable } = require("stream");

// NODEMAILER
const transporter = nodemailer.createTransport({
    port: 465,
    host: "smtp.gmail.com",
    auth: {
        user: process.env.EMAIL,
        pass: process.env.PASSWORD,
    },
    secure: true,
});

exports.registerUser = async (req, res) => {
    const { name, email, password, phoneNumber } = req.body;

    User.findOne({ email: email })
        .then((user) => {
            if (user && user.email === email) {
                return res.status(409).json({
                    message: "Phone Number already registered!",
                });
            } else {
                const token = jwt.sign({ email }, process.env.JWT_SECRET, {
                    expiresIn: "1h",
                });

                bcrypt.hash(password, 10, (err, hashedPassword) => {
                    if (err) {
                        return res.status(500).json({
                            message: "Error occurred!",
                            error: err,
                        });
                    }

                    const user = new User({
                        name: name,
                        email: email,
                        password: hashedPassword,
                        phoneNumber: phoneNumber,
                    });

                    user.save()
                        .then((result) => {
                            transporter
                                .sendMail({
                                    from: `tiket.in <${process.env.EMAIL}>`,
                                    to: email,
                                    subject: "tiket.in: Account Activation",
                                    html: `${process.env.CLIENT_URL}/user/activate?token=${token}`,
                                })
                                .then(() => {
                                    res.status(201).json({
                                        message:
                                            "User registered successfully! Activation email sent.",
                                        user: result,
                                    });
                                })
                                .catch((err) => {
                                    res.status(500).json({
                                        message: "Error while sending email!",
                                        error: err,
                                    });
                                });
                        })
                        .catch((err) => {
                            res.status(500).json({
                                message: "Error saving user!",
                                error: err,
                            });
                        });
                });
            }
        })
        .catch((err) => {
            res.status(500).json({
                message: "Error while registering user!",
                error: err,
            });
        });
};

exports.activateUser = (req, res) => {
    const activationToken = req.query.token;

    jwt.verify(activationToken, process.env.JWT_SECRET, (err, decodedToken) => {
        if (err) {
            return res.status(401).json({
                message: "Invalid or expired activation token.",
            });
        }

        User.findOneAndUpdate(
            { email: decodedToken.email },
            { $set: { status: "VERIFIED" } },
            { new: true }
        )
            .then((user) => {
                if (!user) {
                    return res.status(404).json({
                        message: "User not found.",
                    });
                }

                res.status(200).json({
                    message: "User activated successfully.",
                });
            })
            .catch((err) => {
                res.status(500).json({
                    message: "Error activating user.",
                    error: err,
                });
            });
    });
};

exports.loginUser = (req, res) => {
    const { email, password } = req.body;

    User.findOne({ email: email })
        .then((user) => {
            if (!user) {
                return res.status(401).json({
                    message: "Authentication failed!",
                });
            }

            bcrypt.compare(password, user.password, (err, result) => {
                if (err) {
                    return res.status(401).json({
                        message: "Authentication failed!",
                    });
                }

                if (result) {
                    const token = jwt.sign(
                        {
                            email: user.email,
                            userId: user._id,
                        },
                        process.env.JWT_SECRET,
                        {
                            expiresIn: "1h",
                        }
                    );

                    return res.status(200).cookie("Auth", token).json({
                        message: "Authentication successful!",
                    });
                }

                res.status(401).json({
                    message: "Authentication failed!",
                });
            });
        })
        .catch((err) => {
            res.status(500).json({
                message: "Error occurred!",
                error: err,
            });
        });
};

exports.editProfilePhoto = (req, res) => {
    User.findById(req.userId)
        .then(async (user) => {
            let fileBuffer = Readable.from([req.file.buffer]);

            if (!user) {
                return res.status(404).json({
                    message: "User not found!",
                });
            } else if (!req.file) {
                return res.status(400).json({
                    message: "No file uploaded!",
                });
            } else {
                try {
                    const fileMetadata = {
                        name: req.userId + "-" + Date.now(),
                        parents: ["1ZDynOj57_3KoXsGIZ-GSxPCgfoucTSl-"],
                    };

                    const media = {
                        mimeType: "image/jpeg" || "image/png" || "image/jpg",
                        body: fileBuffer,
                    };

                    const response = await drive.files.create({
                        resource: fileMetadata,
                        media: media,
                        fields: "id",
                    });

                    await drive.permissions.create({
                        fileId: response.data.id,
                        requestBody: {
                            role: "reader",
                            type: "anyone",
                        },
                    });

                    user.profilePhoto = `https://drive.google.com/uc?export=view&id=${response.data.id}`;

                    await user.save();
                    res.status(200).json({
                        message: "Profile picture updated successfully!",
                        profilePhoto: user.profilePhoto,
                    });
                } catch (err) {
                    console.error("Error updating profile picture:", err);
                    res.status(500).json({
                        message: "Error updating profile picture",
                        error: err,
                    });
                }
            }
        })
        .catch((err) => {
            res.status(500).json({
                message: "Error retrieving user!",
                error: err,
            });
        });
};