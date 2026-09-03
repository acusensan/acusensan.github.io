const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");
canvas.width = innerWidth;
canvas.height = innerHeight;

// ===== GAME STATE =====
let gameRunning = false;
let score = 0;
let difficulty = 1;
let gameTime = 0;

let purpleBox = null;
let redSpawnTimer = 0;

let powerUp = null;

// ===== POWER UPS ACTIVE =====
let effects = {
    speed: 0,
    freeze: 0,
    multiplier: 0
};

const DELIVERY_POINTS = 40;
const MAX_ZONE_POINTS = 360;

// ===== PLAYER =====
const player = {
    x: 120,
    y: canvas.height / 2,
    size: 22,
    speed: 6,
    carrying: false
};

// ===== INPUT =====
const keys = {};
addEventListener("keydown", e => keys[e.key.toLowerCase()] = true);
addEventListener("keyup", e => keys[e.key.toLowerCase()] = false);

// ===== SUPPLY =====
const supply = {
    x: 60,
    y: 80,
    size: 120
};

// ===== POWER TYPES =====
const powerTypes = [{
        type: "speed",
        color: "orange"
    },
    {
        type: "freeze",
        color: "cyan"
    },
    {
        type: "multiplier",
        color: "gold"
    },
    {
        type: "repair",
        color: "pink"
    }
];

// ===== ZONES =====
const zones = [];
const colors = {
    green: "#2ecc71",
    yellow: "#f1c40f",
    red: "#e74c3c",
    locked: "#00ffaa",
    dead: "#777"
};

const startX = canvas.width - 190;

for (let i = 0; i < 6; i++) {
    zones.push({
        x: startX,
        y: 60 + i * 80,
        w: 130,
        h: 60,
        state: "green",
        timer: 0,
        flash: 0,
        warning: false,
        points: 0,
        locked: false,
        failCount: 0,
        dead: false,
        redCooldown: 0
    });
}

// ===== START =====
function startGame() {
    score = 0;
    difficulty = 1;
    gameTime = 0;
    purpleBox = null;
    powerUp = null;

    zones.forEach(z => {
        z.state = "green";
        z.points = 0;
        z.locked = false;
        z.failCount = 0;
        z.dead = false;
        z.redCooldown = 0;
    });

    effects = {
        speed: 0,
        freeze: 0,
        multiplier: 0
    };

    gameRunning = true;
    document.getElementById("menu").style.display = "none";
    document.getElementById("gameOver").hidden = true;
}

// ===== HELPERS =====
function collide(a, b) {
    return a.x < b.x + b.w &&
        a.x + a.size > b.x &&
        a.y < b.y + b.h &&
        a.y + a.size > b.y;
}

function activateZone() {
    const available = zones.filter(z => !z.locked && !z.dead && z.state === "green");
    if (!available.length) return;

    const z = available[Math.floor(Math.random() * available.length)];
    z.state = "yellow";
    z.timer = Math.max(3.5, 5.5 - difficulty * 0.1);
    z.startTime = z.timer;
}

// ===== UPDATE =====
function update(dt) {
    if (!gameRunning) return;

    gameTime += dt;

    // ===== POWER EFFECT TIMERS =====
    Object.keys(effects).forEach(k => {
        if (effects[k] > 0) effects[k] -= dt;
    });

    // speed effect
    player.speed = effects.speed > 0 ? 10 : 6;

    // movement
    if (keys["w"] || keys["arrowup"]) player.y -= player.speed;
    if (keys["s"] || keys["arrowdown"]) player.y += player.speed;
    if (keys["a"] || keys["arrowleft"]) player.x -= player.speed;
    if (keys["d"] || keys["arrowright"]) player.x += player.speed;

    player.x = Math.max(0, Math.min(canvas.width - player.size, player.x));
    player.y = Math.max(0, Math.min(canvas.height - player.size, player.y));

    // ===== PICKUP BLUE =====
    if (!player.carrying &&
        player.x < supply.x + supply.size &&
        player.y < supply.y + supply.size &&
        player.x + player.size > supply.x &&
        player.y + player.size > supply.y) {
        player.carrying = "blue";
    }

    // ===== PICKUP POWER-UP =====
    if (powerUp &&
        collide(player, {
            ...powerUp,
            w: powerUp.size,
            h: powerUp.size
        })) {
        activatePower(powerUp.type);
        powerUp = null;
    }

    // ===== ZONES =====
    zones.forEach(z => {
        if (z.locked || z.dead) return;

        if (z.state === "yellow") {
            z.flash += dt * 10;

            if (effects.freeze <= 0) {
                z.timer -= dt;
            }

            z.warning = z.timer < 1;

            if (z.timer <= 0) {
                z.state = "red";
                z.failCount++;
                z.redCooldown = 2;

                if (z.failCount >= 2) {
                    z.dead = true;
                    score -= 100;
                }
            }
        }

        if (z.state === "red" && z.redCooldown > 0) {
            z.redCooldown -= dt;
        }

        // DELIVER BLUE
        if (z.state === "yellow" && player.carrying === "blue" && collide(player, z)) {
            let bonus = Math.floor((z.timer / z.startTime) * 20);

            let totalPoints = DELIVERY_POINTS + bonus;

            if (effects.multiplier > 0) {
                totalPoints *= 2;
            }

            z.points += DELIVERY_POINTS;
            score += totalPoints;

            player.carrying = false;

            if (z.points >= MAX_ZONE_POINTS) {
                z.locked = true;
                z.state = "green";
            } else {
                z.state = "green";
            }
        }
    });

    // ===== DIFFICULTY =====
    difficulty += dt * 0.008;

    // ===== SPAWN POWER-UP =====
    if (!powerUp && Math.random() < dt * 0.08) {
        const p = powerTypes[Math.floor(Math.random() * powerTypes.length)];

        powerUp = {
            x: Math.random() * (canvas.width * 0.6),
            y: Math.random() * (canvas.height - 40),
            size: 20,
            type: p.type,
            color: p.color
        };
    }

    // ===== GAME END =====
    if (zones.every(z => z.locked || z.dead)) {
        gameRunning = false;
        document.getElementById("finalScore").textContent = `${score} puntos`;
        document.getElementById("gameOver").hidden = false;
    }

    // ===== SPAWN ZONES =====
    const active = zones.filter(z => z.state === "yellow").length;
    const maxActive = difficulty < 2 ? 1 : 2;

    if (gameTime > 2 && active < maxActive &&
        Math.random() < dt * (0.25 + difficulty * 0.15)) {
        activateZone();
    }

    // HUD
    document.getElementById("hud").innerHTML =
        `Score: ${score} | Speed:${effects.speed>0? "ON":"OFF"} | Freeze:${effects.freeze>0?"ON":"OFF"} | x2:${effects.multiplier>0?"ON":"OFF"}`;
}

// ===== POWER ACTIVATION =====
function activatePower(type) {
    if (type === "speed") {
        effects.speed = 5;
    }

    if (type === "freeze") {
        effects.freeze = 3;
    }

    if (type === "multiplier") {
        effects.multiplier = 5;
    }

    if (type === "repair") {
        zones.forEach(z => {
            if (z.state === "red") {
                z.state = "green";
            }
        });
    }
}

// ===== DRAW =====
function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // supply
    ctx.fillStyle = "#333";
    ctx.fillRect(supply.x, supply.y, supply.size, supply.size);
    ctx.fillStyle = "blue";
    ctx.fillRect(supply.x + 30, supply.y + 30, 60, 60);

    // power-up
    if (powerUp) {
        ctx.fillStyle = powerUp.color;
        ctx.fillRect(powerUp.x, powerUp.y, powerUp.size, powerUp.size);
    }

    // zones
    zones.forEach(z => {
        ctx.fillStyle = z.dead ? "#777" :
            z.locked ? "#0ff" :
            z.state === "yellow" ? "#f1c40f" :
            z.state === "red" ? "#e74c3c" :
            "#2ecc71";

        ctx.fillRect(z.x, z.y, z.w, z.h);

        ctx.fillStyle = "#fff";
        ctx.fillText(`${z.points}/${MAX_ZONE_POINTS}`, z.x + 10, z.y + 20);

        if (z.dead) {
            ctx.fillText("PARADO", z.x + 30, z.y + 40);
        }
    });

    // player
    ctx.fillStyle = "#2ecc71";
    ctx.fillRect(player.x, player.y, player.size, player.size);

    if (player.carrying) {
        ctx.fillStyle = "blue";
        ctx.fillRect(player.x + 5, player.y + 5, 12, 12);
    }
}

// LOOP
let last = 0;

function loop(t) {
    const dt = (t - last) / 1000;
    last = t;

    update(dt);
    draw();

    requestAnimationFrame(loop);
}
requestAnimationFrame(loop);

addEventListener("resize", () => {
    canvas.width = innerWidth;
    canvas.height = innerHeight;
});
document.getElementById("startGameBtn").addEventListener("click", startGame);
document.getElementById("restartGameBtn").addEventListener("click", startGame);