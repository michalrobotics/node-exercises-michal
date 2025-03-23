const yargs = require('yargs');
const jokes = require('./jokes.js');

yargs.command({
    command: 'add',
    describe: 'Add a random joke',
    handler() {
        jokes.addJoke();
    }
});

yargs.command({
    command: 'delete',
    describe: 'Delete a note',
    builder: {
        name: {
            describe: 'Author of joke to delete',
            demandOption: true,
            type: 'string'
        }
    },
    handler(argv) {
        jokes.deleteJoke(argv.name);
    }
});

yargs.command({
    command: 'list',
    describe: 'List all jokes',
    handler() {
        jokes.listJokes();
    }
});

yargs.command({
    command: 'search',
    describe: 'Search note by author',
    builder: {
        name: {
            describe: 'Author of joke',
            demandOption: true,
            type: 'string'
        }
    },
    handler(argv) {
        jokes.searchJoke(argv.name);
    }
});

yargs.command({
    command: 'pet',
    describe: 'Add a pet to joke author',
    builder: {
        name: {
            describe: 'Author of joke',
            demandOption: true,
            type: 'string'
        }
    },
    handler(argv) {
        jokes.addPet(argv.name);
    }
});


yargs.parse();