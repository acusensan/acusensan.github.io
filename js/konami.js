/* =========================
   🎮 KONAMI CODE (DESKTOP)
========================= */
const konamiSequence = [
  "arrowup","arrowup",
  "arrowdown","arrowdown",
  "arrowleft","arrowright",
  "arrowleft","arrowright",
  "b","a"
];

let userInput = [];

document.addEventListener("keydown", (e) => {
  const key = e.key.toLowerCase();

  // 👉 Hint system
  if (userInput.length === 0) {
    showKonamiHint("👀 Something is happening...");
  } else {
    showKonamiHint("Keep going...");
  }

  userInput.push(key);

  if (userInput.length > konamiSequence.length) {
    userInput.shift();
  }

  const expected = konamiSequence[userInput.length - 1];

  if (key === expected) {
    triggerButtonSmash(key);
  } else {
    userInput = [];
  }

  if (JSON.stringify(userInput) === JSON.stringify(konamiSequence)) {
    activateEasterEgg();
    userInput = [];
  }
});


/* =========================
   📱 KONAMI (MOBILE SWIPE)
========================= */
const touchSequence = [
  "up","up",
  "down","down",
  "left","right",
  "left","right",
  "tap","tap"
];

let touchInput = [];

let startX = 0;
let startY = 0;

document.addEventListener("touchstart", (e) => {
  startX = e.touches[0].clientX;
  startY = e.touches[0].clientY;
});

document.addEventListener("touchend", (e) => {
  const endX = e.changedTouches[0].clientX;
  const endY = e.changedTouches[0].clientY;

  const dx = endX - startX;
  const dy = endY - startY;

  let action = "tap";

  if (Math.abs(dx) > 30 || Math.abs(dy) > 30) {
    if (Math.abs(dx) > Math.abs(dy)) {
      action = dx > 0 ? "right" : "left";
    } else {
      action = dy > 0 ? "down" : "up";
    }
  }

  // Hint system (mobile)
  if (touchInput.length === 0) {
    showKonamiHint("👀 Secret input...");
  } else {
    showKonamiHint("...");
  }

  touchInput.push(action);

  if (touchInput.length > touchSequence.length) {
    touchInput.shift();
  }

  if (JSON.stringify(touchInput) === JSON.stringify(touchSequence)) {
    activateEasterEgg();
    touchInput = [];
  }
});


/* =========================
   ✨ HINT UI
========================= */
function showKonamiHint(text) {
  let hint = document.getElementById("konami-hint");

  if (!hint) {
    hint = document.createElement("div");
    hint.id = "konami-hint";
    document.body.appendChild(hint);
  }

  hint.innerText = text;
  hint.style.opacity = "1";

  clearTimeout(hint._timeout);
  hint._timeout = setTimeout(() => {
    hint.style.opacity = "0";
  }, 1200);
}


/* =========================
   🔥 BUTTON SMASH EFFECT
========================= */
function triggerButtonSmash(key) {
  const div = document.createElement("div");
  div.className = "key-flash";
  div.textContent = formatKey(key);
  document.body.appendChild(div);
  setTimeout(() => div.remove(), 400);
}

function formatKey(key) {
  const map = {
    arrowup: "↑",
    arrowdown: "↓",
    arrowleft: "←",
    arrowright: "→",
    b: "B",
    a: "A"
  };

  return map[key] || key;
}


/* =========================
   💥 ACTIVATION
========================= */
function activateEasterEgg() {
  document.body.style.animation = "screenFlash 0.4s 3, shake 0.2s";
  startSnakeGame();
}


/* =========================
   🐍 SNAKE GAME
========================= */
function startSnakeGame() {
  const gameContainer = document.createElement("div");
  gameContainer.id = "konami-game";

  const canvas = document.createElement("canvas");
  canvas.width = 400;
  canvas.height = 400;

  gameContainer.appendChild(canvas);

  const text = document.createElement("p");
  text.innerText = "Use arrows • ESC to exit";
  text.style.color = "#0f0";
  gameContainer.appendChild(text);

  document.body.appendChild(gameContainer);

  const ctx = canvas.getContext("2d");

  const grid = 20;
  let count = 0;

  let snake = {
    x: 160,
    y: 160,
    dx: grid,
    dy: 0,
    cells: [],
    maxCells: 4
  };

  let apple = {
    x: 320,
    y: 320
  };

  function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min)) + min;
  }

  function loop() {
    requestAnimationFrame(loop);
    if (++count < 4) return;
    count = 0;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    snake.x += snake.dx;
    snake.y += snake.dy;

    if (snake.x < 0) snake.x = canvas.width - grid;
    else if (snake.x >= canvas.width) snake.x = 0;

    if (snake.y < 0) snake.y = canvas.height - grid;
    else if (snake.y >= canvas.height) snake.y = 0;

    snake.cells.unshift({ x: snake.x, y: snake.y });

    if (snake.cells.length > snake.maxCells) {
      snake.cells.pop();
    }

    ctx.fillStyle = "red";
    ctx.fillRect(apple.x, apple.y, grid - 1, grid - 1);

    ctx.fillStyle = "#0f0";
    snake.cells.forEach((cell, index) => {
      ctx.fillRect(cell.x, cell.y, grid - 1, grid - 1);

      if (cell.x === apple.x && cell.y === apple.y) {
        snake.maxCells++;
        apple.x = getRandomInt(0, 20) * grid;
        apple.y = getRandomInt(0, 20) * grid;
      }

      for (let i = index + 1; i < snake.cells.length; i++) {
        if (cell.x === snake.cells[i].x &&
            cell.y === snake.cells[i].y) {

          snake = {
            x: 160,
            y: 160,
            dx: grid,
            dy: 0,
            cells: [],
            maxCells: 4
          };
        }
      }
    });
  }

  document.addEventListener("keydown", function(e) {
    if (e.key === "ArrowLeft" && snake.dx === 0) {
      snake.dx = -grid;
      snake.dy = 0;
    } 
    else if (e.key === "ArrowUp" && snake.dy === 0) {
      snake.dy = -grid;
      snake.dx = 0;
    } 
    else if (e.key === "ArrowRight" && snake.dx === 0) {
      snake.dx = grid;
      snake.dy = 0;
    } 
    else if (e.key === "ArrowDown" && snake.dy === 0) {
      snake.dy = grid;
      snake.dx = 0;
    } 
    else if (e.key === "Escape") {
      gameContainer.remove();
    }
  });

  loop();
}