const User = require("../models/user");
// import validator from './../../node_modules/validator/es/index';
require("dotenv").config();
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const generateTokens = require('../utils/generateTokens');
// const jwt = require('jsonwebtoken');
const validator = require('validator')
require('dotenv').config();

//middware



exports.checkAuth = async (req, res) => {
    try {
        const { token } = req.body;
        const changeToken = token.replace("Bearer ", "");

        const decoded = await jwt.decode(changeToken, { secret: process.env.SECRET });
        if (!decoded) {
            return res.status(401).json('Unauthorization');
        }
        const user = await User.findOne({ _id: decoded.id })

        if (user.length === 0) {
            return res.status(401).json('Unauthorization');
        }
        const result = await User.updateOne({ _id: user._id }, { status: 0 });

        res.send({
            status: "success",
            data: {
                _id: String(user._id),
                name: user.username,
                email: user.email,
                avatar: user.avatar,
                status: 0
            }
        })
    } catch (error) {
        res.send(error);
    }
}
//signUp
exports.signUp = (req, res) => {
    const avatar = req.file ? req.file.filename : 'user';
    const { email, password, name: username } = req.body;
    if (!validator.isEmail(email)) {
        return res.status(200).json({ mes: "Not Email type", status: "info" });
    }
    console.log(req.body, '------------------------')

    if (!email || !password || !username) {
        return res.status(200).json({ mes: "Please fill all the fields", status: "warning" });
    }
    User.findOne({ email: email }).then((user) => {
        if (user) {
            return res.status(200).json({ mes: "Email already exists", status: "info" });
        }
        bcrypt.hash(password, 10, (err, hash) => {
            const user = new User({
                email,
                username,
                password: hash,
                avatar: avatar
            });
            user
                .save()
                .then((user) => {
                    console.log(user)
                    res.status(200).json({
                        mes: "Registered", status: "success"
                    })
                }
                )
                .catch((err) => res.status(500).json({ mes: err.message, status: "error" }));
        });
    });
};

//signIn
exports.signIn = (req, res) => {
    const { email, password } = req.body;
    User.findOne({ email: email }).then((user) => {
        if (!user) {
            return res.status(404).json({ message: "user is not found", status: "error" });
        }
        bcrypt.compare(password, user.password, (err, result) => {

            if (!result) {
                return res.status(401).json({ message: "password incorrect", status: "warning" });
            }
            const Token = generateTokens(user);

            return res.json({
                token: "Bearer " + Token,
                message: "Signed",
                status: "success"
            });
        });
    });
};


