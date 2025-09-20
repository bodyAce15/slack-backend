const jwt = require('jsonwebtoken')
const User = require('../models/user');

exports.loginByToken = (token) => {
    return jwt.decode(token, { secret: process.env.SECRET })
}

exports.update = async (_id, status) => {
    try {
        const result = await User.findByIdAndUpdate({ _id }, status);
        console.log(result);
        return User.findById({ _id });
    } catch (error) {
        console.log(error);
    }
}

exports.read = async (_id) => {
    try {
        return await User.findById({ _id })
    } catch (error) {

    }
}