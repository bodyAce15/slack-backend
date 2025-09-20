const channelService = require('../services/channelService');
const { sendToUsers, sendToUsersStatus } = require('../utils/chat');
const { STATUS, REQUEST, METHOD } = require('../constants/chat');
const authService = require('../services/authService')
const messageService = require('../services/messageService')
let socketList = [];
// exports.socketList = socketList;

exports.authMdr = async (socket, data, next) => {
    try {
        const token = socket.handshake.headers.token;
        const chanegeToken = token.replace("Bearer ", "")
        const user = await authService.loginByToken(chanegeToken);
        socket.user = user;

        if (!token)
            throw new Error('Unauthorized');

        socketList = socketList.filter(list => list.user.id !== socket.user.id);

        socketList.push(socket)

        next(socket, data);
    } catch (err) {
        console.error(err);

        socket.emit(REQUEST.AUTH, STATUS.FAILED, err.message);
    }
}

// channel create controller
exports.create = async (socket, data) => {
    try {
        console.log(data)
        const channel = await channelService.create({
            creator: socket.user.id,
            ...data,
        });

        sendToUsers(socketList, channel.members, `${REQUEST.CHANNEL}_${METHOD.CREATE}`, STATUS.ON, channel);
    } catch (err) {
        console.error(err);
        socket.emit(`${REQUEST.CHANNEL}_${METHOD.CREATE}`, STATUS.FAILED, { ...data, message: err.message });
    }
}
exports.createDMS = async (socket, data) => {
    try {
        const { members } = data
        const DMS = await channelService.findDMS(members);
        console.log(DMS, '---------------<DMS Status>');
        if (!DMS) {
            socket.emit(`${REQUEST.DMS}_${METHOD.CREATE}`, STATUS.FAILED, { message: "Alreay exist in DMSList" });
            return;
        }
        const channel = await channelService.create({
            creator: socket.user.id,
            ...data,
            isDMS: true
        });
        console.log(channel)
        sendToUsers(socketList, channel.members, `${REQUEST.DMS}_${METHOD.CREATE}`, STATUS.ON, channel);
    } catch (err) {
        console.error(err);
        socket.emit(`${REQUEST.DMS}_${METHOD.CREATE}`, STATUS.FAILED, { ...data, message: err.message });
    }
}

// channel readAll controlller
exports.read = async (socket, data) => {
    try {
        const channels = await channelService.read(socket.user.id);
        socket.emit(`${REQUEST.CHANNEL}_${METHOD.READ}`, STATUS.ON, channels);
    } catch (err) {
        console.error(err);
        socket.emit(`${REQUEST.CHANNEL}_${METHOD.READ}`, STATUS.FAILED, { ...data, message: err.message });
    }
}


exports.update = async (socket, data) => {
    try {
        const memebers = await channelService.readOne(data.id)
        const channel = await channelService.update(socket.user.id, data.id, data.channel);
        sendToUsers(socketList, memebers.members, `${REQUEST.CHANNEL}_${METHOD.UPDATE}`, STATUS.ON, channel);
        socket.emit(`${REQUEST.CHANNEL}_${METHOD.UPDATE}`, STATUS.SUCCESS, data);
    } catch (err) {
        socket.emit(`${REQUEST.CHANNEL}_${METHOD.UPDATE}`, STATUS.FAILED, { ...data, message: err.message });
    }
}

exports.delete = async (socket, data) => {
    try {
        const channel = await channelService.delete(socket.user.id, data.id);
        sendToUsers(socketList, channel.members, `${REQUEST.CHANNEL}_${METHOD.DELETE}`, STATUS.ON, data);
        socket.emit(`${REQUEST.CHANNEL}_${METHOD.DELETE}`, STATUS.SUCCESS, data);
    } catch (err) {
        socket.emit(`${REQUEST.CHANNEL}_${METHOD.DELETE}`, STATUS.FAILED, { ...data, message: err.message });
    }
}


//message 
exports.createMessage = async (socket, data) => {
    try {
        console.log(data);
        let message = {};
        if (data.files) message = await messageService.create({ sender: socket.user.id, ...data, uploadfiles: { file: data.files, user: socket.user.id } });
        else message = await messageService.create({ sender: socket.user.id, ...data });
        const channel = await channelService.readOne(message.channel);
        console.log('-----------------------------------------------------------------------------------------', channel.members)
        sendToUsers(socketList, channel.members, `${REQUEST.MESSAGE}_${METHOD.CREATE}`, STATUS.ON, message);
        if (data.parent) {
            sendToUsers(socketList, channel.members, `${REQUEST.MESSAGE}_${METHOD.UPDATE}`, STATUS.ON, await messageService.readOne(data.parent));
        }
        socket.emit(`${REQUEST.MESSAGE}_${METHOD.CREATE}`, STATUS.SUCCESS, data);
    } catch (err) {
        console.error(err);
        socket.emit(`${REQUEST.MESSAGE}_${METHOD.CREATE}`, STATUS.FAILED, { ...data, message: err.message });
    }
}

exports.readMessage = async (socket, data) => {
    try {
        const messages = await messageService.read(data);
        socket.emit(`${REQUEST.MESSAGE}_${METHOD.READ}`, STATUS.ON, { ...data, messages });
    } catch (err) {
        socket.emit(`${REQUEST.MESSAGE}_${METHOD.READ}`, STATUS.FAILED, { ...data, message: err.message });
    }
}

exports.updateMessage = async (socket, data) => {
    try {
        const message = await messageService.update(socket.user.id, data.id, data.message);
        const channel = await channelService.readOne(message.channel);
        sendToUsers(socketList, channel.members, `${REQUEST.MESSAGE}_${METHOD.UPDATE}`, STATUS.ON, message);
        socket.emit(`${REQUEST.MESSAGE}_${METHOD.UPDATE}`, STATUS.SUCCESS, data);
    } catch (err) {
        socket.emit(`${REQUEST.MESSAGE}_${METHOD.UPDATE}`, STATUS.FAILED, { ...data, message: err.message });
    }
}

exports.deleteMessage = async (socket, data) => {
    try {
        const message = await messageService.delete(socket.user.id, data.id);
        const channel = await channelService.readOne(message.channel);
        sendToUsers(socketList, channel.members, `${REQUEST.MESSAGE}_${METHOD.DELETE}`, STATUS.ON, data);
        socket.emit(`${REQUEST.MESSAGE}_${METHOD.DELETE}`, STATUS.SUCCESS, data);
    } catch (err) {
        socket.emit(`${REQUEST.MESSAGE}_${METHOD.DELETE}`, STATUS.FAILED, { ...data, message: err.message });
    }
}

exports.emoticon = async (socket, data) => {
    try {
        console.log(data, '---------------------<emotiocon>')
        const message = await messageService.emoticon(data.messageId, { creator: socket.user.id, code: data.emoticonId });
        const channel = await channelService.readOne(message.channel);
        console.log(message, '---------------------<emotiocon>')

        sendToUsers(socketList, channel.members, `${REQUEST.MESSAGE}_${METHOD.UPDATE}`, STATUS.ON, message);
        socket.emit(REQUEST.EMOTICON, STATUS.SUCCESS, data);
    } catch (err) {
        socket.emit(REQUEST.EMOTICON, STATUS.FAILED, { ...data, message: err.message });
    }
}

exports.typing = async (socket, data) => {
    try {
        const channel = await channelService.readOne(data.channelId);
        sendToUsers(socketList, channel.members, REQUEST.TYPING, STATUS.ON, { ...data, user: socket.user.id });
        socket.emit(REQUEST.TYPING, STATUS.SUCCESS, data);
    } catch (err) {
        socket.emit(REQUEST.TYPING, STATUS.FAILED, { ...data, message: err.message });
    }
}


exports.pin = async (socket, data) => {
    try {
        const message = await messageService.pin(data.messageId, socket.user.id);
        console.log('-------------------------<pinhandle>', message.isPined)
        socket.emit(`${REQUEST.MESSAGE}_${METHOD.UPDATE}`, STATUS.ON, message)
    } catch (error) {
        console.log(error);
    }
}

exports.authUpdate = async (socket, data) => {
    try {
        const result = await authService.update(socket.user.id, data);
        const channels = await channelService.read(socket.user.id);
        const authStatue = await authService.read(socket.user.id);
        socket.emit(`${REQUEST.AUTH}_${METHOD.UPDATE}`, STATUS.SUCCESS, authStatue);
        channels.forEach((channel) => {
            // socket.emit(`${REQUEST.CHANNEL}_${METHOD.READ}`, STATUS.ON, channels);

            sendToUsersStatus(socketList, channel.members, `${REQUEST.CHANNEL}_${METHOD.READ}`, STATUS.ON, channels);
        })
        socket.emit(`${REQUEST.CHANNEL}_${METHOD.READ}`, STATUS.ON, channels);
    } catch (error) {

    }
}