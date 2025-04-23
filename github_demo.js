let questionBank = {};
let currentType = null;

const buttonTexts = ['开始抽题', '查看题号', '抽下一题', '重置'];
const questionStates = {
    single: { step: 0, current: null, button: null, countdownId: null },
    multi:  { step: 0, current: null, button: null, countdownId: null },
    short:  { step: 0, current: null, button: null, countdownId: null }
};

document.addEventListener('DOMContentLoaded', function() {
    fetch('./questionBank.json')
        .then(response => response.json())
        .then(data => {
            questionBank = data;
            updateQuestionCounts();
            initializeButtons();
        })
        .catch(error => {
            console.error('加载题库失败:', error);
            alert('题库加载失败，请检查网络连接或联系管理员！');
        });
});

function updateQuestionCounts() {
    document.getElementById('singleCount').textContent = Object.keys(questionBank.single).length;
    document.getElementById('multiCount').textContent = Object.keys(questionBank.multi).length;
    document.getElementById('shortCount').textContent = Object.keys(questionBank.short).length;
}

function initializeButtons() {
    ['single', 'multi', 'short'].forEach(type => {
        const btn = document.getElementById(type + 'Btn');
        questionStates[type].button = btn;
        btn.textContent = buttonTexts[0];
    });
}

function handleButtonClick(type) {
    const state = questionStates[type];
    const max = Object.keys(questionBank[type]).length;

    switch (state.step) {
        case 0:
            state.current = Math.floor(Math.random() * max) + 1;
            document.getElementById(type + 'Num').textContent = state.current.toString().padStart(2, '0');
            break;
        case 1:
            showQuestion(type, state.current);
            break;
        case 2:
            clearInterval(state.countdownId);
            state.current = Math.floor(Math.random() * max) + 1;
            document.getElementById(type + 'Num').textContent = state.current.toString().padStart(2, '0');
            break;
        case 3:
            clearInterval(state.countdownId);
            document.getElementById(type + 'Num').textContent = '00';
            break;
    }

    state.step = (state.step + 1) % 4;
    state.button.textContent = buttonTexts[state.step];
}

function showQuestion(type, questionNumber) {
    currentType = type;
    questionStates[type].current = questionNumber;

    const question = questionBank[type][questionNumber.toString()];
    const panelContent = document.getElementById('panelContent');
    panelContent.innerHTML = `
        <h3>${type === 'single' ? '单选题' : type === 'multi' ? '多选题' : '简答题'} - 第${questionNumber}题</h3>
        <p>${question.question}</p>
        ${type !== 'short' ? question.options.map(opt => `<div class="option">${opt}</div>`).join('') : ''}
    `;
    document.getElementById('questionPanel').style.display = 'block';
    document.getElementById('overlay').style.display = 'block';
    document.getElementById('showAnswerBtn').style.display = 'block';
    document.getElementById('countdown').style.display = 'block';
    startCountdown(type);
}

function showAnswer() {
    if (!currentType) return;
    const state = questionStates[currentType];
    const question = questionBank[currentType][state.current.toString()];
    const panelContent = document.getElementById('panelContent');
    panelContent.insertAdjacentHTML('beforeend',
        `<div class="answer">正确答案：${question.answer}</div>`
    );
    document.getElementById('showAnswerBtn').style.display = 'none';
}

function closePanel() {
    currentType = null;
    document.getElementById('questionPanel').style.display = 'none';
    document.getElementById('overlay').style.display = 'none';
    document.getElementById('countdown').style.display = 'none';
    ['single', 'multi', 'short'].forEach(type => {
        clearInterval(questionStates[type].countdownId);
        if (questionStates[type].step === 3) {
            questionStates[type].step = 0;
            questionStates[type].button.textContent = buttonTexts[0];
        }
    });
}

function startCountdown(type) {
    const timerEl = document.getElementById('countdownTimer');
    let timeLeft = 30;
    timerEl.textContent = timeLeft;
    const state = questionStates[type];
    state.countdownId = setInterval(() => {
        timeLeft--;
        timerEl.textContent = timeLeft;
        if (timeLeft <= 0) {
            clearInterval(state.countdownId);
            showAnswer();
        }
    }, 1000);
}
