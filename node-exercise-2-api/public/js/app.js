console.log("We are here to stay");

const searchWord = (word) => {
    fetch(`http://localhost:8000/dictionary?word=${word}`).then((response) => {
        response.json().then((data) => {
            if (data.error) {
                p1.textContent = data.error;
            } else {
                p1.textContent = `${data.partOfSpeech.toUpperCase()}. ${data.definition}`;
                p2.textContent = data.synonyms;
                p2.innerHTML += '<br/><button id="translate">Translate this page</button>';
                const translateBtn = document.querySelector('#translate');
                translateBtn.addEventListener('click', translatePage);
            }
        });
    });
}

const randomizeWord = () => {
    fetch('http://localhost:8000/random').then((response) => {
        response.json().then((data) => {
            if (data.error) {
                p1.textContent = data.error;
            } else {
                input.value = data.word;
                p1.textContent = '';
            }
        });
    });
}

const translatePage = () => {
    let fullText = '';
    texts.forEach((textEl) => {
        fullText += `${textEl.textContent}%%`;
    });
    fetch(`http://localhost:8000/translate?text=${fullText}`).then((response) => {
        response.json().then((data) => {
            if (data.error) {
                p2.textContent = data.error;
            } else {
                const newTexts = data.translation.split('%%');
                texts.forEach((textEl, index) => {
                    textEl.textContent = newTexts[index];
                });
            }
        });
    });
}

const loader = (event) => {
    event.preventDefault();
    p1.textContent = 'Loading...';
    p2.textContent = '';
    if (event.target.id === 'search') {
        searchWord(input.value);
    } else if (event.target.id === 'random') {
        randomizeWord();
    }
}

const input = document.querySelector('input');
const searchBtn = document.querySelector('#search');
const randomBtn = document.querySelector('#random')
const p1 = document.querySelector('#p1');
const p2 = document.querySelector('#p2');

const texts = document.querySelectorAll(".text");

searchBtn.addEventListener('click', loader);

randomBtn.addEventListener('click', loader);
