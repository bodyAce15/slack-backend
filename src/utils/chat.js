const socketList = require('../controllers/socketController');
// const channelCtr = require('../controllers/channelController');

exports.sendToUsers = (socketList, userIds, message, status, data) => {
    socketList.forEach((list) => {
        console.log(list.user.id, userIds);
        if (userIds.includes(list.user.id)) {
            list.emit(message, status, data);
        }
    })
}
exports.sendToUsersStatus = (socketList, userIds, message, status, data) => {
    // console.log(userIds,'dddddddddddddddddddddddddddddddddddddddddddddd');
    console.log(socketList.length, '----------------------------------')
    socketList.forEach((list) => {
        if (userIds.some((userId) => {
            if (String(userId._id) === list.user.id) {
                console.log(String(userId._id), "xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx", list.user.id);

            }

            return String(userId._id) === list.user.id
        }))
            list.emit(message, status, data);
    })
}
