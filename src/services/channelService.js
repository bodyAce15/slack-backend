const { model } = require('mongoose');

const Channel = model('channels');

exports.create = (createChannelDto) => {
    try {
        if (!createChannelDto.members.some(member => member == createChannelDto.creator)) {
            createChannelDto.members = [...createChannelDto.members, createChannelDto.creator];
        }
        console.log(createChannelDto)
        const channel = new Channel(createChannelDto);
        return channel.save();
    }
    catch (error) {
        console.log(error, 'ChannelCreateError')
    }
}

exports.read = (userId) => {
    try {
        return Channel.find({ members: { $in: userId } }).populate(['members', 'creator']);
    } catch (error) {
        console.log(error, 'ChannelReadError')

    }
}

exports.readOne = async (id) => {
    try {
        const channel = await Channel.findById(id);
        if (!channel)
            throw new Error('Not found channel');
        return channel;
    } catch (error) {
        console.log(error, 'ChannelReadOneError')

    }
}

exports.update = async (userId, id, updateChannelDto) => {
    try {
        const channel = await Channel.findById(id);
        // if (channel.creator != userId)
        //     throw new Error('User has no permission to update this channel');
        if (!channel)
            throw new Error('Not found channel');
        await Channel.findByIdAndUpdate(id, updateChannelDto);
        return this.readOne(id);
    } catch (error) {
        console.log(error, 'ChannelupdateError')

    }
}

exports.delete = async (userId, id) => {
    try {
        const channel = await Channel.findById(id);
        // if (channel.creator != userId)
        //     throw new Error('User has no permission to update this channel');
        if (!channel)
            throw new Error('Not found channel');
        return Channel.findByIdAndDelete(id);
    } catch (error) {
        console.log(error, 'ChanneldeleteError')

    }
}


exports.findDMS = async (findUserId) => {
    try {
        const result = await Channel.find({
            $and: [
                { members: { $in: findUserId[0] } },
                { members: { $in: findUserId[1] } },
                { isDMS: true }
            ]
        })
        if (result.length === 0) return true;
        else return false;
    } catch (error) {
        console.log(error)
    }
}