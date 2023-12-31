const User = require("../models/User");
const bcrypt = require("bcrypt");
const nodemailer = require("nodemailer");
const jwt = require("jsonwebtoken");
const { drive } = require("../config/drive");
const { Readable } = require("stream");
const UserEvent = require("../models/UserEvent");
const qr = require("qr-image");
const Event = require("../models/Event");

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
                    message: "Email already registered!",
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
                                    html: `
                                            <!DOCTYPE html>
                                            <html lang="en">
                                            <head>
                                                <meta charset="UTF-8">
                                                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                                                <title>tiket.in - Account Activation</title>
                                                <style>
                                                    body {
                                                        font-family: Arial, sans-serif;
                                                        background-color: #f5f5f5;
                                                        text-align: center;
                                                    }
                                                    .container {
                                                        background-color: #ffffff;
                                                        padding: 40px;
                                                        border-radius: 10px;
                                                        box-shadow: 0 0 10px rgba(0, 0, 0, 0.2);
                                                        margin: 20px auto;
                                                        max-width: 700px;
                                                    }
                                                    h1 {
                                                        color: black;
                                                    }
                                                    p {
                                                        font-size: 16px;
                                                    }
                                                    a.button {
                                                        display: inline-block;
                                                        padding: 15px 30px;
                                                        background-color: black;
                                                        color: #ffffff;
                                                        text-decoration: none;
                                                        border-radius: 5px;
                                                        font-size: 20px;
                                                        font-weight: bold;
                                                        transition: background-color 0.3s ease-in-out;
                                                    }
                                                    a.button:hover {
                                                        background-color: gray;
                                                    }
                                                </style>
                                            </head>
                                            <body>
                                                <div class="container">
                                                    <h1>tiket.in: Account Activation</h1>
                                                    <p>Thank you for signing up with tiket.in! <br>
                                                        To activate your account, please click the button below:</p>
                                                    <a class="button" href="${process.env.CLIENT_URL}/user/activate?token=${token}">Activate Your Account</a>
                                                </div>
                                            </body>
                                            </html>
                                    `,
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

                    return res
                        .status(200)
                        .cookie("Auth", token, { sameSite: "None" })
                        .json({
                            message: "Authentication successful!",
                            token: token,
                            id: user._id,
                            name: user.name,
                            email: user.email,
                            phoneNumber: user.phoneNumber,
                            status: user.status,
                            role: user.role,
                            profilePhoto: user.profilePhoto,
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

exports.forgotPassword = (req, res) => {
    const { email, password } = req.body;

    User.findOne({ email: email })
        .then((user) => {
            if (!user) {
                return res.status(404).json({
                    message: "User not found!",
                });
            }

            bcrypt.hash(password, 10, (err, hashedPassword) => {
                if (err) {
                    return res.status(500).json({
                        message: "Error occurred!",
                        error: err,
                    });
                }

                user.password = hashedPassword;
                user.status = "SUBMITTED";

                user.save()
                    .then((result) => {
                        const token = jwt.sign(
                            {
                                userId: user._id,
                            },
                            process.env.JWT_SECRET,
                            {
                                expiresIn: "1h",
                            }
                        );

                        transporter
                            .sendMail({
                                from: `tiket.in <${process.env.EMAIL}>`,
                                to: email,
                                subject: "tiket.in: Forgot Password",
                                html: `
                                        <!DOCTYPE html>
                                        <html lang="en">
                                        <head>
                                            <meta charset="UTF-8">
                                            <meta name="viewport" content="width=device-width, initial-scale=1.0">
                                            <title>tiket.in - Forgot Password</title>
                                            <style>
                                                body {
                                                    font-family: Arial, sans-serif;
                                                    background-color: #f5f5f5;
                                                    text-align: center;
                                                }
                                                .container {
                                                    background-color: #ffffff;
                                                    padding: 40px;
                                                    border-radius: 10px;
                                                    box-shadow: 0 0 10px rgba(0, 0, 0, 0.2);
                                                    margin: 20px auto;
                                                    max-width: 700px;
                                                }
                                                h1 {
                                                    color: black;
                                                }
                                                p {
                                                    font-size: 16px;
                                                }
                                                a.button {
                                                    display: inline-block;
                                                    padding: 15px 30px;
                                                    background-color: black;
                                                    color: #ffffff;
                                                    text-decoration: none;
                                                    border-radius: 5px;
                                                    font-size: 20px;
                                                    font-weight: bold;
                                                    transition: background-color 0.3s ease-in-out;
                                                }
                                                a.button:hover {
                                                    background-color: gray;
                                                }
                                            </style>
                                        </head>
                                        <body>
                                            <div class="container">
                                                <h1>tiket.in: Forgot Password</h1>
                                                <p> This email was sent to confirm new password on tiket.in! <br>
                                                    To use your new password, please click the button below:</p>
                                                <a class="button" href=" ${process.env.CLIENT_URL}/user/reset-password?token=${token}">Activate Password</a>
                                            </div>
                                        </body>
                                        </html>
                                        `,
                            })
                            .then(() => {
                                res.status(200).json({
                                    message:
                                        "Password reset successfully! Reset password email sent.",
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
                            message: "Error updating password!",
                            error: err,
                        });
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

exports.activateNewPassword = (req, res) => {
    const resetToken = req.query.token;

    jwt.verify(resetToken, process.env.JWT_SECRET, (err, decodedToken) => {
        if (err) {
            return res.status(401).json({
                message: "Invalid or expired reset token.",
            });
        }

        User.findByIdAndUpdate(
            decodedToken.userId,
            { $set: { status: "VERIFIED" } },
            { new: true }
        )
            .then((user) => {
                if (!user) {
                    return res.status(404).json({
                        message: "User not found!",
                    });
                }

                res.status(200).json({
                    message: "Reset password successfully!",
                });
            })
            .catch((err) => {
                res.status(500).json({
                    message: "Error retrieving user!",
                    error: err,
                });
            });
    });
};

exports.editUser = (req, res) => {
    const allowedFields = ["name", "phoneNumber", "email"];

    const updatedFields = {};

    for (const field of allowedFields) {
        if (req.body[field] !== undefined) {
            updatedFields[field] = req.body[field];
        }
    }

    if (Object.keys(updatedFields).length === 0) {
        return res
            .status(400)
            .json({ message: "No valid fields provided for update!" });
    }

    if (updatedFields.email) {
        User.find({ email: updatedFields.email })
            .then((existingUser) => {
                if (existingUser.length > 0) {
                    return res.status(400).json({
                        message: "Email is already in use by another user!",
                    });
                }
                updateUser();
            })
            .catch((err) => {
                res.status(500).json({
                    message: "Error checking email existence!",
                    error: err,
                });
            });
    } else {
        updateUser();
    }

    function updateUser() {
        User.findByIdAndUpdate(
            req.userId,
            { $set: updatedFields },
            { new: true }
        )
            .then((user) => {
                if (!user) {
                    return res.status(404).json({ message: "User not found!" });
                }

                res.status(200).json({
                    message: "User updated successfully!",
                    user: user,
                });
            })
            .catch((err) => {
                res.status(500).json({
                    message: "Error updating user!",
                    error: err,
                });
            });
    }
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

exports.getUserInfo = (req, res) => {
    User.findById(req.userId)
        .then((user) => {
            if (!user) {
                return res.status(404).json({
                    message: "User not found!",
                });
            } else {
                res.status(200).json({
                    message: "User retrieved successfully!",
                    user: user,
                });
            }
        })
        .catch((err) => {
            res.status(500).json({
                message: "Error retrieving user!",
                error: err,
            });
        });
};

exports.deleteUser = (req, res) => {
    User.findByIdAndRemove(req.userId)
        .then((user) => {
            if (!user) {
                return res.status(404).json({
                    message: "User not found!",
                });
            }

            res.status(200).json({
                message: "User deleted successfully!",
            });
        })
        .catch((err) => {
            res.status(500).json({
                message: "Error deleting user!",
            });
        });
};

exports.registerEvent = (req, res) => {
    const eventId = req.query.eventId;

    Event.findById(eventId).then((event) => {
        if (!event) {
            return res.status(404).json({
                message: "Event not found!",
            });
        }

        UserEvent.findOne({ userId: req.userId, eventId: eventId })
            .then((userEvent) => {
                if (userEvent) {
                    return res.status(409).json({
                        message: "User already registered to this event!",
                    });
                }

                const code = Math.floor(100000 + Math.random() * 900000);

                const newUserEvent = new UserEvent({
                    userId: req.userId,
                    eventId: eventId,
                    code: code,
                });

                newUserEvent
                    .save()
                    .then(async (result) => {
                        const qrCode = qr.image(code.toString(), {
                            type: "png",
                        });
                        const qrCodeFileName = `${req.userId}-${eventId}-${code}.png`;

                        const qrCodeUpload = drive.files.create({
                            resource: {
                                name: qrCodeFileName,
                                parents: ["1EiTWDorO3LU5xbl6AxRsK2QGUrw-oiL2"],
                            },
                            media: {
                                mimeType: "image/png",
                                body: qrCode,
                            },
                            fields: "id",
                        });

                        const qrCodeFile = await qrCodeUpload;

                        await drive.permissions.create({
                            fileId: qrCodeFile.data.id,
                            requestBody: {
                                role: "reader",
                                type: "anyone",
                            },
                        });

                        result.qrCode = `https://drive.google.com/uc?export=view&id=${qrCodeFile.data.id}`;
                        await result
                            .save()
                            .then((result) => {
                                transporter
                                    .sendMail({
                                        from: `tiket.in <${process.env.EMAIL}>`,
                                        to: req.email,
                                        subject: "tiket.in: Event Registration",
                                        html: `
                                            <div
                                            style="
                                                font-family: 'Arial', 'Helvetica', 'sans-serif';
                                                background-color: #f0f0f0;
                                                padding: 50px 0;
                                            "
                                            >
                                            <div>
                                            </div>
                                            <div
                                                style="
                                                    background: #000842;
                                                    max-width: 500px;
                                                    height: auto;
                                                    margin: auto;
                                                    padding: 45px;
                                                    border-radius: 29px;
                                                    overflow-wrap: break-word;
                                                "
                                            >
                                                <h1
                                                    style="
                                                        font-style: normal;
                                                        font-weight: 900;
                                                        font-size: 28px;
                                                        color: white;
                                                        text-align: center;
                                                        text-transform: uppercase;
                                                    "
                                                >
                                                    SUCCESSFUL REGISTRATION
                                                </h1>
                                                <p
                                                    style="
                                                        font-style: normal;
                                                        margin-top: 60;
                                                        text-align: center;
                                                        color: #ffffff;
                                                        margin-bottom: 20;
                                                    "
                                                >
                                                    <b>Hey There!</b> <br />
                                                    Your registration for ${event.eventName} is complete! <br />
                                                    Your code is ${code} and Here is your QR Code
                                                </p>
                                                <div
                                                    style="
                                                        text-align: center;
                                                        margin-bottom: 20;
                                                    "
                                                    >
                                                    <img 
                                                        src="${result.qrCode}"
                                                        alt="QR Code"
                                                    />
                                                </div>
                                                <div
                                                    style="
                                                        font-style: normal;
                                                        margin-top: 60;
                                                        text-align: center;
                                                        color: #ffffff;
                                                        margin-bottom: 20;
                                                    "
                                                >
                                                    This Code and QR Code not valid until you pay the registration fee
                                                </div>
                                            </div>
                                            <p style="text-align: center; color: #818181; margin-top: 25px">
                                                Email ini dikirim oleh
                                                <span style="font-weight: bold">ticket.in</span>
                                            </p>
                                            </div>
                                            `,
                                    })
                                    .then(() => {
                                        res.status(200).json({
                                            message:
                                                "User registered to event successfully!",
                                            userEvent: result,
                                        });
                                    })
                                    .catch((err) => {
                                        res.status(500).json({
                                            message: "Error sending email!",
                                            error: err,
                                        });
                                    });
                            })
                            .catch((err) => {
                                res.status(500).json({
                                    message: "Error creating QR!",
                                    error: err,
                                });
                            });
                    })
                    .catch((err) => {
                        res.status(500).json({
                            message: "Error registering user to event!",
                            error: err,
                        });
                    });
            })
            .catch((err) => {
                res.status(500).json({
                    message: "Error checking user registration!",
                    error: err,
                });
            });
    });
};

exports.uploadPayment = (req, res) => {
    const id = req.query.id;

    UserEvent.findById(id)
        .then(async (result) => {
            let fileBuffer = Readable.from([req.file.buffer]);

            if (!result) {
                return res.status(404).json({
                    message: "result not found!",
                });
            } else if (!req.file) {
                return res.status(400).json({
                    message: "No file uploaded!",
                });
            } else {
                try {
                    const fileMetadata = {
                        name: id + "-" + Date.now(),
                        parents: ["1oODsAnTVPuQh6OIK-zYXbz2bDuQQdnHe"],
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

                    result.paymentFile = `https://drive.google.com/uc?export=view&id=${response.data.id}`;

                    await result.save()

                    .then((result) =>{
                        transporter
                            .sendMail({
                                from: `tiket.in <${process.env.EMAIL}>`,
                                to: req.email,
                                subject: "tiket.in: Payment Successfull",
                                html: `
                                    <div
                                    style="
                                        font-family: 'Arial', 'Helvetica', 'sans-serif';
                                        background-color: #f0f0f0;
                                        padding: 50px 0;
                                    "
                                    >
                                    <div>
                                    </div>
                                    <div
                                        style="
                                            background: #000842;
                                            max-width: 500px;
                                            height: auto;
                                            margin: auto;
                                            padding: 45px;
                                            border-radius: 29px;
                                            overflow-wrap: break-word;
                                        "
                                    >
                                        <h1
                                            style="
                                                font-style: normal;
                                                font-weight: 900;
                                                font-size: 28px;
                                                color: white;
                                                text-align: center;
                                                text-transform: uppercase;
                                            "
                                        >
                                            REGISTRATION COMPLETED
                                        </h1>
                                        <p
                                            style="
                                                font-style: normal;
                                                margin-top: 60;
                                                text-align: center;
                                                color: #ffffff;
                                                margin-bottom: 20;
                                            "
                                        >
                                            <b>Hey There!</b> <br />
                                            Your registration is complete! <br />
                                        </p>
                                        <div
                                            style="
                                                font-style: normal;
                                                margin-top: 60;
                                                text-align: center;
                                                color: #ffffff;
                                                margin-bottom: 20;
                                            "
                                        >
                                            Your Code and QR Code is now valid!
                                        </div>
                                    </div>
                                    <p style="text-align: center; color: #818181; margin-top: 25px">
                                        Email ini dikirim oleh
                                        <span style="font-weight: bold">ticket.in</span>
                                    </p>
                                    </div>
                                    `,
                            })
                        .then(() => {
                            res.status(200).json({
                                message: "Payment updated successfully!",
                                paymentFile: result.paymentFile,
                            })
                        });
                    })
                    .catch((err) => {
                        res.status(500).json({
                            message: "Error updating payment!",
                            error: err,
                        });
                    });
                } catch (err) {
                    console.error("Error updating payment:", err);
                    res.status(500).json({
                        message: "Error updating payment",
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

exports.getUserEvents = (req, res) => {
    UserEvent.find({ userId: req.userId })
        .populate("userId", "-password")
        .populate("eventId")
        .then((result) => {
            res.status(200).json({
                message: "User events retrieved successfully!",
                userEvents: result,
            });
        })
        .catch((err) => {
            res.status(500).json({
                message: "Error retrieving user events!",
                error: err,
            });
        });
};