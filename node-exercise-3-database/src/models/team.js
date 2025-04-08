const mongoose = require('mongoose');
const Member = require('./member');

const teamSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    }
});

teamSchema.virtual('members', {
    ref: 'Member',
    localField: '_id',
    foreignField: 'team'
});

teamSchema.pre('deleteOne', { document: true, query: false }, async function (next) {
    const team = this;
    const members = await Member.find({ team: team._id });
    members.forEach((member) => {
        member.team = undefined;
        member.save();
    });
    next();
});

const Team = mongoose.model('Team', teamSchema);

module.exports = Team;
