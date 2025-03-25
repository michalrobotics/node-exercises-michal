const path = require('path');
const express = require('express');
const dictionary = require('./utils/dictionary');
const translate = require('./utils/translate');
const random = require('./utils/random');

const app = express();

const publicDirectoryPath = path.join(__dirname, '../public');
const viewsPath = path.join(__dirname, '../views');

app.set('view engine', 'hbs');
app.set('views', viewsPath);

app.use(express.static(publicDirectoryPath));

app.get('', (req, res) => {
    res.render('index', {
        name: 'something'
    });
});

app.get('/dictionary', (req, res) => {
    if (!req.query.word) {
        return res.send({
            error: 'You must enter a word'
        });
    }
    dictionary(req.query.word, (error, response = {}) => {
        if (error) {
            return res.send({ error });
        }
        res.send(response);
    });
});

app.get('/random', (req, res) => {
    random((error, response) => {
        if (error) {
            res.send({ error });
        } else {
            res.send(response);
        }
    });
});

app.get('/translate', (req, res) => {
    if (!req.query.text) {
        res.send({
            error: 'You must enter text'
        });
    } else {
        translate(req.query.text, (error, response) => {
            if (error) { 
                res.send({ error });
            } else {
                res.send(response);
            }
        });
    }
});

app.get('*', (req, res) => {
    res.render('404');
});

app.listen(8000, () => {
    console.log('Server is up on port 8000.');
});
