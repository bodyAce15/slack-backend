const { model } = require('mongoose');
const mongoose = require('mongoose');
const user = require('../models/user');
const Message = model('messages');

exports.read = async (data) => {
    try {
        const messages = await Message.find(data).populate(['mention', 'sender', 'uploadfiles']);
        if (data.parent === null) {
            const children = await Message.find().in('parent', messages.map(message => message.id)).populate(['mention']);
            return messages.map((message) => {
                const childCount = children.filter(child => child.parent == message.id).length;
                message.childCount = childCount;
                return message;
            });
        }
        return messages;
    } catch (error) {
        console.log(error);
        throw new Error('mongoose error')
    }
}

exports.readOne = async (id) => {
    try {
        const message = await Message.findById(id).populate(['mention', 'sender', 'uploadfiles']);
        if (!message)
            throw new Error('Not found message');

        const childCount = await Message.countDocuments({ parent: id });
        message.childCount = childCount;
        return message;
    } catch (error) {
        console.log(error)
    }
}
exports.create = async (createMessageDto) => {
    try {
        const message = new Message(createMessageDto);
        await message.save();
        return this.readOne(message._id)
    } catch (error) {
        console.log(error)
    }
}


exports.update = async (userId, id, updateMessageDto) => {
    try {
        const message = await Message.findById(id);
        if (!message)
            throw new Error('Not found message');
        if (message.sender != userId)
            throw new Error('User has no permission to update this message');
        await Message.findByIdAndUpdate(id, updateMessageDto);
        return this.readOne(id);
        return this.readOne(id);
    } catch (error) {
        console.log(error);
    }
}

exports.delete = async (userId, id) => {
    try {
        const message = await Message.findById(id);
        if (!message)
            throw new Error('Not found message');
        if (message.sender != userId)
            throw new Error('User has no permission to update this message');
        return Message.findByIdAndDelete(id);
    } catch (error) {
        console.log(error)
    }
}

exports.emoticon = async (id, createEmoticonDto) => {
    try {
        const message = await Message.findById(id);
        const emoticons = message.emoticons;
        let updatedEmoticons;
        if (emoticons.some(emoticon => emoticon.creator == createEmoticonDto.creator && emoticon.code == createEmoticonDto.code)) {
            updatedEmoticons = emoticons.filter((emoticon) => !(emoticon.creator == createEmoticonDto.creator && emoticon.code == createEmoticonDto.code));
        } else {
            updatedEmoticons = [...emoticons, createEmoticonDto];
        }
        await Message.findByIdAndUpdate(id, {
            emoticons: updatedEmoticons,
        });
        return this.readOne(id);
    } catch (error) {
        console.log(error)
    }
}

exports.pin = async (messageId, userId) => {
    try {
        const message = await Message.findById(messageId);
        console.log('-------------------<servicesPin>', userId)
        const pinList = message.isPined;
        let updatedPinList = [];
        if (pinList.some(pin => String(pin.user) == userId)) {
            updatedPinList = pinList.map((pin) => {
                return String(pin.user) === userId ? { state: Boolean(!pin.state), user: userId } : pin
            })
        }
        else updatedPinList = [...updatedPinList, { state: true, user: userId }];
        await Message.findByIdAndUpdate(messageId, { isPined: updatedPinList });
        return this.readOne(messageId)
    } catch (error) {
        console.log(error);
    }
}