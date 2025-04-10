const express = require('express');
const Member = require('../models/member');
const Team = require('../models/team');
const auth = require('../middleware/auth');
const router = new express.Router();
const codes = require('../enums/status-codes');

router.post('/members', async (req, res) => {
    const member = new Member(req.body);

    try {
        await member.save();
        const token = await member.generateAuthToken();
        res.status(codes.CREATED).send({ member, token });
    } catch (e) {
        res.status(codes.INTERNAL_SERVER_ERROR).send(e);
    }
});

router.post('/members/login', async (req, res) => {
    try {
        const member = await Member.findByCredentials(req.body.idfNumber, req.body.password);
        const token = await member.generateAuthToken();
        res.send({ member, token });
    } catch (e) {
        res.status(codes.INTERNAL_SERVER_ERROR).send();
    }
});

router.post('/members/logout', auth, async (req, res) => {
    try {
        req.member.tokens = req.member.tokens.filter((token) => token.token !== req.token);
        await req.member.save();

        res.send();
    } catch (e) {
        res.status(codes.INTERNAL_SERVER_ERROR).send();
    }
});

router.post('/members/logoutall', auth, async (req, res) => {
    try {
        req.member.tokens = [];
        await req.member.save();
        res.send();
    } catch (e) {
        res.status(codes.INTERNAL_SERVER_ERROR).send();
    }
});

router.get('/members/me', auth, async (req, res) => {
    try {
        res.send(req.member);
    } catch (e) {
        res.status(codes.INTERNAL_SERVER_ERROR).send();
    }
});

router.get('/members', auth, async (req, res) => {
    const match = {};
    const sort = {};

    if (req.query.sortBy) {
        const parts = req.query.sortBy.split(':');
        sort[parts[0]] = parts[1] === 'desc' ? -1 : 1;
    }

    if (req.query.leader) {
        match.isLeader = req.query.leader === 'true';
    }

    try {
        console.log(match);

        const members = await Member.find(match).sort(sort).limit(parseInt(req.query.limit)).skip(req.query.skip);

        res.send(members);
    } catch (e) {
        res.status(codes.INTERNAL_SERVER_ERROR).send();
    }
});

router.get('/members/leaders', async (req, res) => {
    
});

router.patch('/members/:id', auth, async (req, res) => {
    if (!req.member.isLeader) {
        return res.status(codes.UNAUTHORIZED).send({ error: 'Only leaders can update data' });
    }
    const updates = Object.keys(req.body);
    const allowedUpdates = ['name', 'idfNumber', 'password', 'isLeader', 'team', 'pazam'];
    const isValidOperation = updates.every((update) => allowedUpdates.includes(update));

    if (!isValidOperation) {
        return res.status(codes.BAD_REQUEST).send({ error: 'Invalid updates' });
    }

    try {
        const member = await Member.findById(req.params.id);
        
        if (updates.includes('team')) {
            if (member.isLeader) {
                return res.status(codes.FORBIDDEN).send({ error: 'Leader cannot switch teams' });
            }

            const team = await Team.findOne({ name: req.body.team });
            if (!team) {
                return res.status(codes.NOT_FOUND).send({  error: 'No such team' });
            }
            req.body.team = team._id;
        }

        await member.updateOne(req.body, { new: true, runValidators: true });
        if (!member) {
            return res.status(codes.NOT_FOUND).send();
        }

        res.send(member);
    } catch (e) {
        res.status(codes.INTERNAL_SERVER_ERROR).send();
    }
});

router.delete('/members/:id', auth, async (req, res) => {
    if (!req.member.isLeader) {
        return res.status(codes.UNAUTHORIZED).send({ error: 'Only leaders can update data' });
    }
    try {
        req.member.findOne(req.params.id);

        if (!member) {
            return res.status(codes.NOT_FOUND).send();
        }

        res.send(member);
    } catch (e) {
        res.status(codes.INTERNAL_SERVER_ERROR).send();
    }
});


router.get('/members/:idfNum/team', auth, async (req, res) => {
    const idfNumber = req.params.idfNum;
    try {
        const member = await Member.findOne({ idfNumber });

        if (!member) {
            return res.status(codes.NOT_FOUND).send();
        }

        await member.populate('team');

        if (!member.team) {
            return res.status(codes.NOT_FOUND).send('Member not in a team');
        }

        res.send(member.team.name);
    } catch (e) {
        res.status(codes.INTERNAL_SERVER_ERROR).send();
    }
});

module.exports = router;
