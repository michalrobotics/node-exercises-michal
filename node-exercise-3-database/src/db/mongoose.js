const mongoose = require('mongoose');

const uri = 'mongodb+srv://MichalH:michal110306@cluster0.xv978a0.mongodb.net/artech-db';

mongoose.connect(uri).then(() => {
    console.log("Connected!");
});
