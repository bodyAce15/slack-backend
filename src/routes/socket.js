const { REQUEST, METHOD, STATUS } = require('../constants/chat');
const authService = require('../services/authService');
const channelCtr = require('../controllers/socketController');
// const authMdr = require('../controllers/messageController');


const onConnect = async (socket) => {
    console.log(`Socket ${socket.id} is connected`)
    
    socket.on(`${REQUEST.DMS}_${METHOD.CREATE}`, (data) => channelCtr.authMdr(socket, data, channelCtr.createDMS));

    socket.on(`${REQUEST.CHANNEL}_${METHOD.READ}`, (data) => channelCtr.authMdr(socket, data, channelCtr.read));// channel readAll
    socket.on(`${REQUEST.CHANNEL}_${METHOD.CREATE}`, (data) => channelCtr.authMdr(socket, data, channelCtr.create));
    socket.on(`${REQUEST.CHANNEL}_${METHOD.UPDATE}`, (data) => channelCtr.authMdr(socket, data, channelCtr.update));
    socket.on(`${REQUEST.CHANNEL}_${METHOD.DELETE}`, (data) => channelCtr.authMdr(socket, data, channelCtr.delete));
    socket.on(`${REQUEST.MESSAGE}_${METHOD.CREATE}`, (data) => channelCtr.authMdr(socket, data, channelCtr.createMessage));
    socket.on(`${REQUEST.MESSAGE}_${METHOD.READ}`, (data) => channelCtr.authMdr(socket, data, channelCtr.readMessage));
    socket.on(`${REQUEST.MESSAGE}_${METHOD.UPDATE}`, (data) => channelCtr.authMdr(socket, data, channelCtr.updateMessage));
    socket.on(`${REQUEST.MESSAGE}_${METHOD.DELETE}`, (data) => channelCtr.authMdr(socket, data, channelCtr.deleteMessage));
    socket.on(REQUEST.EMOTICON, (data) => channelCtr.authMdr(socket, data, channelCtr.emoticon));
    socket.on(REQUEST.TYPING, (data) => channelCtr.authMdr(socket, data, channelCtr.typing));
    socket.on(REQUEST.PIN, (data) => channelCtr.authMdr(socket, data, channelCtr.pin)); // pin handle

    socket.on(`${REQUEST.AUTH}_${METHOD.UPDATE}`, (data) => channelCtr.authMdr(socket, data, channelCtr.authUpdate))

    socket.on('disconnect', () => {
        console.log(`${socket.id} disconnect`);
    })
}

exports.onConnect = onConnect;
