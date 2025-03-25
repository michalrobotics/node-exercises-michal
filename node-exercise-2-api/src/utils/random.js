const request = require('request');

const randomize = (callback) => {
    // const url = 'https://random-word-api.herokuapp.com/wosrd';
    const url = 'https://random-word-api.vercel.app/api';

    request({ url, json: true}, (error, { body } = {}) => {
        if (error) {
            callback("Couldn't connect to word generator.", undefined);
        } else {
            callback(undefined, {
                word: body[0]
            });
        }
    });
}

module.exports = randomize;
