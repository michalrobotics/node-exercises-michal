const fs = require('fs');
const chance = require('chance').Chance();
const giveMeAJoke = require('give-me-a-joke');

const addJoke = () => {
    const jokes = loadJokes();

    giveMeAJoke.getRandomDadJoke((joke) => {
        let name = chance.name();
        while (jokes.find((obj) => obj.name === name)) {
            name = chance.name();
        }
        jokes.push({
            name: name,
            age: chance.age(),
            joke: joke
        });
        saveJokes(jokes);
    });

}

const deleteJoke = (name) => {
    const jokes = loadJokes();

    const jokesToKeep = jokes.filter((joke) => joke.name.toLowerCase() !== name.toLowerCase());

    if (jokes.length > jokesToKeep.length) {
        saveJokes(jokesToKeep);
        console.log("Joke deleted!");
    } else {
        console.log("No jokes under that name!");
    }
}

const listJokes = () => {
    const jokes = loadJokes();

    console.log("Jokes")
    jokes.forEach((joke) => {
        console.log(joke.joke);
    });
}

const searchJoke = (name) => {
    const jokes = loadJokes();

    const joke = jokes.find((joke) => joke.name.toLowerCase() === name.toLowerCase());

    if (joke) {
        console.log(joke.joke);
    } else {
        console.log("No joke found under that name!");
    }
}

const loadJokes = () => {
    try {
        const jokesBuffer = fs.readFileSync('jokes.json');
        const jokesJSON = jokesBuffer.toString();
        return JSON.parse(jokesJSON);
    } catch (e) {
        return [];
    }
}

const saveJokes = (jokes) => {
    const jokesJSON = JSON.stringify(jokes);
    fs.writeFileSync('jokes.json', jokesJSON);
}

module.exports = {
    addJoke,
    deleteJoke,
    listJokes,
    searchJoke
}