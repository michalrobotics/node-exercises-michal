const request = require('request');

const translate = (text, callback) => {
    const url = `https://api.funtranslations.com/translate/gungan.json?text=${text}`;

    request({ url, json: true}, (error, { body } = {}) => {
        if (error) {
            callback("Couldn't connect to translator", undefined);
        } else if (body.error) {
            callback("Service unavailable. Try again later");
        } else {
            callback(undefined, {
                translation: body.contents.translated
            });
        }
    });
}

module.exports = translate;
