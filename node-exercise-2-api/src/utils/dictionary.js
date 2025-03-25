const request = require('request');

const dictionary = (word, callback) => {
    const url = `https://api.dictionaryapi.dev/api/v2/entries/en/${word}`;

    request({ url, json: true }, (error, { body } = {}) => {
        if (error) {
            callback("Couldn't connect to dictionary.", undefined);
        } else if (body.title) {
            callback("Word not found. Try a different search.", undefined);
        } else {
            let synonyms = body[0].meanings[0].synonyms;
            if (synonyms.length === 0) {
                synonyms = 'No synonyms found';
            }
            callback(undefined, {
                definition: body[0].meanings[0].definitions[0].definition,
                synonyms,
                partOfSpeech: body[0].meanings[0].partOfSpeech
            });
        }
    });
}

module.exports = dictionary;
