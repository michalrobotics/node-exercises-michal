const express = require('express');
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

router.get('/members', async (req, res) => {
    try {
        const members = await Member.find({});
        res.send(members);
    } catch (e) {
        res.status(500).send();
    }
});

router.get('/members/:id', auth, async (req, res) => {
    try {
        const member = await Member.findById(req.params.id);

        if (!member) {
            return res.status(404).send();
        }

        res.send(member);
    } catch (e) {
        res.status(500).send();
    }
});

router.patch('/members/:id', auth, async (req, res) => {
    const updates = Object.keys(req.body);
    const allowedUpdates = ['name', 'idfNumber', 'email', 'isOpenBase'];
    const isValidOperation = updates.every((update) => allowedUpdates.includes(update));

    if (!isValidOperation) {
        return res.status(400).send({ error: 'Invalid updates' });
    }

    try {
        const member = await Member.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });

        if (!member) {
            return res.status(404).send();
        }

        res.send(member);
    } catch (e) {
        res.status(500).send();
    }
});

router.delete('/members/:id', async (req, res) => {
    try {
        const member = await Member.findByIdAndDelete(req.params.id);

        if (!member) {
            return res.status(404).send();
        }

        const teams = await Team.find({});

        let index;
        const team = teams.find((team) => {
            index = team.members.findIndex((member) => member === req.params.id);

            return (index >= 0 ? true : false);
        });

        if (team) {
            const updatedMembers = team.members;
            updatedMembers.splice(index, 1);

            await Team.updateOne({ _id: team.id }, { members: updatedMembers }, { runValidators: true });
        }

        res.send(member);
    } catch (e) {
        res.status(500).send();
    }
});

module.exports = router;
