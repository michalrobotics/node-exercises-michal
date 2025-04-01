const express = require('express');
require('./db/mongoose');
const teamRouter = require('./routers/team');
const memberRouter = require('./routers/member');

const app = express();

app.use(express.json());
app.use(teamRouter);
app.use(memberRouter);

app.get('', (req, res) => {
    res.send('This is working just fine.');
});

app.listen(8000, () => {
    console.log("Server up on port 8000");
});