const phrases = ["平安喜乐", "有福之州", "越来越好", "万事胜意", "福韵榕城", "禅心菩提", "茉莉飘香", "陪你长大"];

function initPresetPhrases() {
    const presetContainer = document.getElementById('presetPhrases');
    if (!presetContainer) return;
    presetContainer.innerHTML = '';
    phrases.forEach(phrase => {
        const span = document.createElement('span');
        span.className = 'preset-phrase';
        span.innerText = phrase;
        span.addEventListener('click', () => {
            const input = document.getElementById('userTextInput');
            if (input) {
                input.value = phrase;
            }
            if (typeof addUserText === 'function') {
                addUserText(phrase);
            }
        });
        presetContainer.appendChild(span);
    });
}

function initTextEditor() {
    initPresetPhrases();
    const addTextBtn = document.getElementById('addTextBtn');
    if (addTextBtn) {
        addTextBtn.addEventListener('click', () => {
            if (typeof addUserText === 'function') {
                addUserText();
            }
        });
    }
}