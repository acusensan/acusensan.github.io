'use strict';
let konamiEnabled = localStorage.getItem('konamiEnabled') !== 'false';
const konamiSequence = ['arrowup', 'arrowup', 'arrowdown', 'arrowdown', 'arrowleft', 'arrowright', 'arrowleft', 'arrowright', 'b', 'a'];
const touchSequence = ['up', 'up', 'down', 'down', 'left', 'right', 'left', 'right', 'tap', 'tap'];
let keyboardProgress = [];
let touchProgress = [];
let touchStart = null;
let gameState = null;

function toggleKonami() {
    konamiEnabled = !konamiEnabled;
    localStorage.setItem('konamiEnabled', String(konamiEnabled));
    resetKonamiProgress();
    showKonamiHint(konamiEnabled ? 'Easter egg activado' : 'Easter egg desactivado');
    return konamiEnabled;
}

function resetKonamiProgress() {
    keyboardProgress = [];
    touchProgress = [];
}

function advanceSequence(progress, sequence, input) {
    const expected = sequence[progress.length];
    if (input === expected) {
        progress.push(input);
        return true;
    }
    progress.length = 0;
    if (input === sequence[0]) progress.push(input);
    return false;
}
document.addEventListener('keydown', event => {
    if (gameState) return;
    if (!konamiEnabled || isTypingTarget(event.target)) return;
    const key = event.key.toLowerCase();
    if (!konamiSequence.includes(key)) {
        keyboardProgress = [];
        return;
    }
    const matched = advanceSequence(keyboardProgress, konamiSequence, key);
    if (matched) {
        triggerButtonSmash(key);
        showKonamiHint(keyboardProgress.length === 1 ? 'Secuencia detectada...' : `${keyboardProgress.length} de ${konamiSequence.length}`);
    }
    if (keyboardProgress.length === konamiSequence.length) {
        keyboardProgress = [];
        activateEasterEgg();
    }
});
document.addEventListener('touchstart', event => {
    if (!konamiEnabled || gameState || event.touches.length !== 1) return;
    touchStart = {
        x: event.touches[0].clientX,
        y: event.touches[0].clientY,
        time: Date.now()
    };
}, {
    passive: true
});
document.addEventListener('touchend', event => {
    if (!konamiEnabled || gameState || !touchStart) return;
    const touch = event.changedTouches[0],
        dx = touch.clientX - touchStart.x,
        dy = touch.clientY - touchStart.y,
        distance = Math.hypot(dx, dy);
    let action = 'tap';
    if (distance > 42) action = Math.abs(dx) > Math.abs(dy) ? (dx > 0 ? 'right' : 'left') : (dy > 0 ? 'down' : 'up');
    touchStart = null;
    const matched = advanceSequence(touchProgress, touchSequence, action);
    if (matched) showKonamiHint(`${touchProgress.length} de ${touchSequence.length}`);
    if (touchProgress.length === touchSequence.length) {
        touchProgress = [];
        activateEasterEgg();
    }
}, {
    passive: true
});

function isTypingTarget(target) {
    return target instanceof HTMLElement && (target.matches('input,textarea,select,[contenteditable="true"]') || target.isContentEditable);
}

function showKonamiHint(text) {
    let hint = document.getElementById('konami-hint');
    if (!hint) {
        hint = document.createElement('div');
        hint.id = 'konami-hint';
        hint.setAttribute('role', 'status');
        hint.setAttribute('aria-live', 'polite');
        document.body.append(hint);
    }
    hint.textContent = text;
    hint.classList.add('visible');
    clearTimeout(hint._timeout);
    hint._timeout = setTimeout(() => hint.classList.remove('visible'), 1300);
}

function triggerButtonSmash(key) {
    const flash = document.createElement('div');
    flash.className = 'key-flash';
    flash.setAttribute('aria-hidden', 'true');
    flash.textContent = formatKey(key);
    document.body.append(flash);
    flash.addEventListener('animationend', () => flash.remove(), {
        once: true
    });
    setTimeout(() => flash.remove(), 700);
}

function formatKey(key) {
    return {
        arrowup: '↑',
        arrowdown: '↓',
        arrowleft: '←',
        arrowright: '→',
        b: 'B',
        a: 'A'
    } [key] || key;
}

function activateEasterEgg() {
    if (document.getElementById('konami-game')) return;
    document.body.classList.add('konami-activate');
    setTimeout(() => document.body.classList.remove('konami-activate'), 900);
    startSnakeGame();
}

function startSnakeGame() {
    const overlay = document.createElement('div');
    overlay.id = 'konami-game';
    overlay.setAttribute('role', 'dialog');
    overlay.setAttribute('aria-modal', 'true');
    overlay.setAttribute('aria-label', 'Juego Snake');
    const header = document.createElement('div');
    header.className = 'konami-game-header';
    const title = document.createElement('h2');
    title.className = 'konami-game-title';
    title.textContent = 'Snake secreto';
    const score = document.createElement('span');
    score.className = 'konami-score';
    score.textContent = 'Puntos: 0';
    const close = document.createElement('button');
    close.className = 'konami-close';
    close.type = 'button';
    close.textContent = 'Salir';
    header.append(title, score, close);
    const canvas = document.createElement('canvas');
    const size = Math.max(280, Math.min(600, Math.floor(Math.min(innerWidth * .82, innerHeight * .72) / 20) * 20));
    canvas.width = size;
    canvas.height = size;
    const controls = document.createElement('div');
    controls.className = 'konami-controls';
    controls.textContent = 'Flechas o WASD para mover · ESC para salir';
    overlay.append(header, canvas, controls);
    document.body.append(overlay);
    document.body.classList.add('konami-game-open');
    const ctx = canvas.getContext('2d'),
        grid = 20,
        cells = size / grid;
    let snake = [{
            x: Math.floor(cells / 2),
            y: Math.floor(cells / 2)
        }],
        direction = {
            x: 1,
            y: 0
        },
        nextDirection = {
            x: 1,
            y: 0
        },
        apple = randomFreeCell(),
        points = 0,
        lastTime = 0,
        animationId = 0,
        closed = false;

    function randomFreeCell() {
        let candidate;
        do {
            candidate = {
                x: Math.floor(Math.random() * cells),
                y: Math.floor(Math.random() * cells)
            };
        } while (snake.some(cell => cell.x === candidate.x && cell.y === candidate.y));
        return candidate;
    }

    function setDirection(x, y) {
        if (x === -direction.x && y === -direction.y) return;
        nextDirection = {
            x,
            y
        };
    }

    function onKey(event) {
        const key = event.key.toLowerCase(),
            moves = {
                arrowleft: [-1, 0],
                a: [-1, 0],
                arrowup: [0, -1],
                w: [0, -1],
                arrowright: [1, 0],
                d: [1, 0],
                arrowdown: [0, 1],
                s: [0, 1]
            };
        if (key === 'escape') {
            closeGame();
            return;
        }
        if (moves[key]) {
            event.preventDefault();
            setDirection(...moves[key]);
        }
    }

    function step() {
        direction = nextDirection;
        const head = {
            x: (snake[0].x + direction.x + cells) % cells,
            y: (snake[0].y + direction.y + cells) % cells
        };
        if (snake.some(cell => cell.x === head.x && cell.y === head.y)) {
            snake = [{
                x: Math.floor(cells / 2),
                y: Math.floor(cells / 2)
            }];
            direction = nextDirection = {
                x: 1,
                y: 0
            };
            points = 0;
            score.textContent = 'Puntos: 0';
            apple = randomFreeCell();
            return;
        }
        snake.unshift(head);
        if (head.x === apple.x && head.y === apple.y) {
            points++;
            score.textContent = `Puntos: ${points}`;
            apple = randomFreeCell();
        } else snake.pop();
    }

    function draw() {
        ctx.fillStyle = '#0a0f0c';
        ctx.fillRect(0, 0, size, size);
        ctx.fillStyle = '#ff5252';
        ctx.fillRect(apple.x * grid + 2, apple.y * grid + 2, grid - 4, grid - 4);
        snake.forEach((cell, index) => {
            ctx.fillStyle = index === 0 ? '#9dffb4' : '#45ff79';
            ctx.fillRect(cell.x * grid + 1, cell.y * grid + 1, grid - 2, grid - 2);
        });
    }

    function loop(time) {
        if (closed) return;
        if (time - lastTime > 95) {
            step();
            draw();
            lastTime = time;
        }
        animationId = requestAnimationFrame(loop);
    }

    function closeGame() {
        if (closed) return;
        closed = true;
        cancelAnimationFrame(animationId);
        document.removeEventListener('keydown', onKey, true);
        overlay.remove();
        document.body.classList.remove('konami-game-open');
        gameState = null;
    }
    close.addEventListener('click', closeGame);
    document.addEventListener('keydown', onKey, true);
    gameState = {
        close: closeGame
    };
    draw();
    animationId = requestAnimationFrame(loop);
    close.focus();
}