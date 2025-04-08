const express = require('express');
const mongoose = require('mongoose');
const Member = require('../models/member');
const Team = require('../models/team');
const auth = require('../middleware/auth');
const router = new express.Router();

router.post('/members', async (req, res) => {
    const member = new Member(req.body);

    try {
        await member.save();
        const token = await member.generateAuthToken();
        res.status(201).send({ member, token });
    } catch (e) {
        res.status(400).send(e);
    }
});

router.post('/members/login', async (req, res) => {
    try {
        const member = await Member.findByCredentials(req.body.idfNumber, req.body.password);
        const token = await member.generateAuthToken();
        res.send({ member, token });
    } catch (e) {
        res.status(400).send();
    }
});

router.post('/members/logout', auth, async (req, res) => {
    try {
        req.member.tokens = req.member.tokens.filter((token) => token.token !== req.token);
        await req.member.save();

        res.send();
    } catch (e) {
        res.status(500).send();
    }
});

router.post('/members/logoutall', auth, async (req, res) => {
    try {
        req.member.tokens = [];
        await req.member.save();
        res.send();
    } catch (e) {
        res.status(500).send();
    }
});

router.get('/members/me', auth, async (req, res) => {
    try {
        res.send(req.member);
    } catch (e) {
        res.status(500).send();
    }
});

router.patch('/members/:id', auth, async (req, res) => {
    if (!req.member.isLeader) {
        return res.status(401).send({ error: 'Only leaders can update data' });
    }
    const updates = Object.keys(req.body);
    const allowedUpdates = ['name', 'idfNumber', 'password', 'isLeader', 'team', 'pazam'];
    const isValidOperation = updates.every((update) => allowedUpdates.includes(update));

    if (!isValidOperation) {
        return res.status(400).send({ error: 'Invalid updates' });
    }

    try {
        
        const member = await Member.findById(req.params.id);
        
        if (updates.includes('team')) {
            const team = await Team.findOne({ name: req.body.team });
            if (!team) {
                return res.status(400).send({  error: 'No such team' });
            }

            if (member.isLeader) {
                return res.status(403).send({ error: 'Leader cannot switch teams' });
            }
            req.body.team = team._id;
        }

        await member.updateOne(req.params.id, req.body, { new: true, runValidators: true });
        if (!member) {
            return res.status(404).send();
        }

        res.send(member);
    } catch (e) {
        res.status(500).send();
    }
});

router.delete('/members/:id', auth, async (req, res) => {
    if (!req.member.isLeader) {
        return res.status(401).send({ error: 'Only leaders can update data' });
    }
    try {
        req.member.findOne(req.params.id);

        if (!member) {
            return res.status(404).send();
        }

        res.send(member);
    } catch (e) {
        res.status(500).send();
    }
});


router.get('/members/:idfNum/team', async (req, res) => {
    const idfNumber = req.params.idfNum;
    try {
        const member = await Member.findOne({ idfNumber });

        if (!member) {
            return res.status(404).send();
        }

        await member.populate('team');

        if (!member.team) {
            return res.status(404).send('Member not in a team');
        }

        res.send(member.team.name);
    } catch (e) {
        res.status(500).send();
    }
});

module.exports = router;
