const express = require('express');
const Team = require('../models/team');
const auth = require('../middleware/auth');
const codes = require('../enums/status-codes');
const router = new express.Router();

router.post('/teams', auth, async (req, res) => {
    if (!req.member.isLeader) {
        return res.status(codes.UNAUTHORIZED).send({ error: 'Only leaders can update data' });
    }
    if (req.member.team) {
        return res.status(codes.FORBIDDEN).send({ error: 'Leader can only create one team' });
    }

    const team = new Team(req.body);

    try {
        await team.save();
        req.member.team = team._id;
        req.member.save();
        res.status(codes.CREATED).send(team);
    } catch (e) {
        res.status(codes.BAD_REQUEST).send(e);
    }
});

router.get('/teams', auth, async (req, res) => {
    try {
        const teams = await Team.find({});
        res.send(teams);
    } catch (e) {
        res.status(codes.INTERNAL_SERVER_ERROR).send();
    }
});

router.get('/teams/:id', auth, async (req, res) => {
    try {
        const team = await Team.findById(req.params.id);

        if (!team) {
            return res.status(codes.NOT_FOUND).send();
        }

        res.send(team);
    } catch (e) {
        res.status(codes.INTERNAL_SERVER_ERROR).send();
    }
});

router.patch('/teams/:id', auth, async (req, res) => {
    if (!req.member.isLeader) {
        return res.status(codes.UNAUTHORIZED).send({ error: 'Only leaders can update data' });
    }
    const updates = Object.keys(req.body);
    const allowedUpdates = ['name'];
    const isValidOperation = updates.every((update) => allowedUpdates.includes(update));

    if (!isValidOperation) {
        return res.status(codes.BAD_REQUEST).send({ error: 'Invalid updates' });
    }

    try {
        const team = await Team.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });

        if (!team) {
            return res.status(codes.NOT_FOUND).send();
        }

        res.send(team);
    } catch (e) {
        res.status(codes.INTERNAL_SERVER_ERROR).send();
    }
});

router.delete('/teams/:id', auth, async (req, res) => {
    if (!req.member.isLeader) {
        return res.status(codes.UNAUTHORIZED).send({ error: 'Only leaders can update data' });
    }
    try {

        // The schema pre method execute with findByIdAndDelete so it's seperated here
        const team = await Team.findById(req.params.id);
        await team.deleteOne();

        if (!team) {
            return res.status(codes.NOT_FOUND).send();
        }

        res.send(team);
    } catch (e) {
        res.status(codes.INTERNAL_SERVER_ERROR).send();
    }
});

router.get('/teams/:name/leader', auth, async (req, res) => {
    try {
        const team = await Team.findOne({ name: req.params.name });

        if (!team) {
            return res.status(codes.NOT_FOUND).send();
        }

        await team.populate('members');
        const leader = team.members.find((member) => member.isLeader);
    
        if (!leader) {
            return res.status(codes.NOT_FOUND).send();
        }

        res.send(leader);
    } catch (e) {
        res.status(codes.INTERNAL_SERVER_ERROR).send();
    }
});

// router.get('/teams/:name/members', auth, async (req, res) => {
//     try {
//         const team = await Team.findOne({ name: req.params.name });

//         if (!team) {
//             return res.status(codes.NOT_FOUND).send();
//         }

//         res.send(team.members.length);
//     } catch (e) {
//         res.status(codes.INTERNAL_SERVER_ERROR).send();
//     }
// });

router.get('/teams/:name/members', auth, async (req, res) => {
    try {
        const team = await Team.findOne({ name: req.params.name });

        if (!team) {
            return res.status(codes.NOT_FOUND).send();
        }

        await team.populate('members');
        res.send(team.members);
    } catch (e) {
        res.status(codes.INTERNAL_SERVER_ERROR).send();
    }
});

module.exports = router;
