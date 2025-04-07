const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const memebrSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    idfNumber: {
        type: Number,
        required: true,
        unique: true,
        validate(value) {
            if (value < 1000000 || value > 9999999) {
                throw new Error('Number must have exactly 7 digits');
            }
        }
    },
    password: {
        type: String,
        required: true,
        trim: true,
        minLength: 7,
        validate(value) {
            if (value.toLowerCase().includes('password')) {
                throw new Error("Password must not contain the word 'password'")
            }
        }
    },
    isLeader: {
         type: Boolean,
         default: false
    },
    team: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Team'
    },
    tokens: [{
        token: {
            type: String,
            required: true
        }
    }]
});

memebrSchema.pre("save", async function (next) {
    console.log("here");
    const member = this;

    if (member.isModified('password')) {
        member.password = await bcrypt.hash(member.password, 8);
    }

    next();
});

memebrSchema.methods.generateAuthToken = async function () {
    const member = this;

    const token = jwt.sign({ _id: member._id.toString() }, 'ihaveboobies');

    member.tokens = member.tokens.concat({ token });
    await member.save();

    return token;
}

memebrSchema.statics.findByCredentials = async (idfNumber, password) => {
    const member = await Member.findOne({ idfNumber });

    if (!member) {
        throw new Error('Unable to log in');
    }

    const isMatch = await bcrypt.compare(password, member.password);

    if (!isMatch) {
        throw new Error('Unable to log in');
    }

    return member;
}

const Member = mongoose.model('Member', memebrSchema);

module.exports = Member;
