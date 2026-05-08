const titleScreen = document.getElementById("titleScreen");
const ruleScreen = document.getElementById("ruleScreen");
const gameScreen = document.getElementById("gameScreen");
const resultScreen = document.getElementById("resultScreen");

const titleImage = document.querySelector(".title-image");
const startText = document.querySelector("#titleScreen .start-text");

const grid = document.getElementById("grid");

const scoreText = document.getElementById("score");
const timerText = document.getElementById("timer");
const phaseText = document.getElementById("phase");

const rankText = document.getElementById("rank");
const rankTitleText = document.getElementById("rankTitle");
const finalScoreText = document.getElementById("finalScore");

const retryButton = document.getElementById("retryButton");

const CELL_COUNT = 9;
const GAME_TIME = 94;

// 通常
const SPAWN_NORMAL = 1150;
const SMALL_TO_MID_NORMAL = 650;
const MID_TO_LOCK_NORMAL = 1500;

// 成長注意！
const SPAWN_SABI = 520;
const SMALL_TO_MID_SABI = 380;
const MID_TO_LOCK_SABI = 900;

// BONUS
const BONUS_RATE = 0.08;
const BONUS_SCORE = 300;

// AUDIO
const bgm = new Audio("bgm.mp3");
const startSe = new Audio("start.mp3");
const harvestSe = new Audio("harvest.mp3");
const perfectSe = new Audio("perfect.mp3");
const lockSe = new Audio("lock.mp3");
const warningSe = new Audio("warning.mp3");
const resultSe = new Audio("result.mp3");

bgm.loop = false;
bgm.volume = 0.45;

startSe.volume = 0.55;
harvestSe.volume = 0.45;
perfectSe.volume = 0.7;
lockSe.volume = 0.55;
warningSe.volume = 0.6;
resultSe.volume = 0.65;

let cells = [];
let bamboos = [];

let score = 0;
let gameOver = false;
let movedToRule = false;
let warningPlayed = false;

let startTime = 0;

function playSe(sound) {
  sound.currentTime = 0;
  sound.play().catch(() => {});
}

function goToRuleScreen() {
  if (movedToRule) return;

  movedToRule = true;

  playSe(startSe);

  titleScreen.classList.add("hidden");
  ruleScreen.classList.remove("hidden");
}

titleScreen.addEventListener("click", goToRuleScreen);
titleImage.addEventListener("click", goToRuleScreen);
startText.addEventListener("click", goToRuleScreen);

ruleScreen.addEventListener("click", startGame, { once: true });

retryButton.addEventListener("click", () => {
  location.reload();
});

function startGame() {
  playSe(startSe);

  ruleScreen.classList.add("hidden");
  gameScreen.classList.remove("hidden");

  startTime = Date.now();

  createGrid();

  bgm.currentTime = 0;
  bgm.play().catch(() => {});

  spawnLoop();
  timerLoop();
}

function createGrid() {
  grid.innerHTML = "";

  cells = [];
  bamboos = [];

  for (let i = 0; i < CELL_COUNT; i++) {
    const cell = document.createElement("div");

    cell.className = "cell";

    cell.addEventListener("click", () => harvest(i));

    grid.appendChild(cell);

    cells.push(cell);
    bamboos.push(null);
  }
}

function getElapsedSeconds() {
  return (Date.now() - startTime) / 1000;
}

function isSabiTime() {
  const elapsed = getElapsedSeconds();

  const sabi1 =
    elapsed >= 18 &&
    elapsed < 36;

  const sabi2 =
    elapsed >= 54 &&
    elapsed < 94;

  return sabi1 || sabi2;
}

function updatePhaseDisplay() {
  if (isSabiTime()) {
    phaseText.textContent = "成長注意！";
    phaseText.classList.add("warning");

    if (!warningPlayed) {
      playSe(warningSe);
      warningPlayed = true;
    }
  } else {
    phaseText.textContent = "";
    phaseText.classList.remove("warning");
    warningPlayed = false;
  }
}

function spawnBamboo() {
  if (gameOver) return;

  const emptyIndexes = [];

  bamboos.forEach((bamboo, index) => {
    if (!bamboo) {
      emptyIndexes.push(index);
    }
  });

  if (emptyIndexes.length === 0) {
    checkAllLocked();
    return;
  }

  const index =
    emptyIndexes[Math.floor(Math.random() * emptyIndexes.length)];

  const isBonus = Math.random() < BONUS_RATE;

  const bamboo = {
    stage: 1,
    bonus: isBonus
  };

  bamboos[index] = bamboo;

  render();

  const smallToMid =
    isSabiTime()
      ? SMALL_TO_MID_SABI
      : SMALL_TO_MID_NORMAL;

  const midToLock =
    isSabiTime()
      ? MID_TO_LOCK_SABI
      : MID_TO_LOCK_NORMAL;

  // 金タケノコは中タケノコにならず、短時間で消える
  if (isBonus) {
    setTimeout(() => {
      if (gameOver) return;
      if (bamboos[index] !== bamboo) return;

      bamboos[index] = null;

      render();
    }, smallToMid);

    return;
  }

  setTimeout(() => {
    if (gameOver) return;
    if (bamboos[index] !== bamboo) return;

    bamboo.stage = 2;

    render();
  }, smallToMid);

  setTimeout(() => {
    if (gameOver) return;
    if (bamboos[index] !== bamboo) return;

    bamboo.stage = 3;

    playSe(lockSe);

    render();
  }, smallToMid + midToLock);
}

function harvest(index) {
  if (gameOver) return;

  const bamboo = bamboos[index];

  if (!bamboo) return;

  if (bamboo.stage === 3) return;

  if (bamboo.bonus) {
    score += BONUS_SCORE;
    playSe(perfectSe);
  } else if (bamboo.stage === 1) {
    score += 100;
    playSe(harvestSe);
  } else if (bamboo.stage === 2) {
    score += 20;
    playSe(harvestSe);
  }

  scoreText.textContent = "SCORE " + score;

  bamboos[index] = null;

  render();
}

function render() {
  for (let i = 0; i < CELL_COUNT; i++) {
    const cell = cells[i];

    cell.innerHTML = "";
    cell.className = "cell";

    const bamboo = bamboos[i];

    if (!bamboo) continue;

    const img = document.createElement("img");

    if (bamboo.bonus) {
      img.src = "gold_bamboo.png";

      cell.classList.add("stage-1");
      cell.classList.add("bonus");
    } else if (bamboo.stage === 1) {
      img.src = "bamboo1.png";

      cell.classList.add("stage-1");
    } else if (bamboo.stage === 2) {
      img.src = "bamboo2.png";

      cell.classList.add("stage-2");
    } else if (bamboo.stage === 3) {
      img.src = "bamboo3.png";

      cell.classList.add("stage-3");
      cell.classList.add("locked");
    }

    cell.appendChild(img);
  }

  checkAllLocked();
}

function isAllLocked() {
  return bamboos.every((bamboo) => {
    return bamboo && bamboo.stage === 3;
  });
}

function checkAllLocked() {
  if (gameOver) return;

  if (isAllLocked()) {
    endGame();
  }
}

function spawnLoop() {
  if (gameOver) return;

  spawnBamboo();

  const nextSpawn =
    isSabiTime()
      ? SPAWN_SABI
      : SPAWN_NORMAL;

  setTimeout(spawnLoop, nextSpawn);
}

function timerLoop() {
  if (gameOver) return;

  const elapsed =
    Math.floor(getElapsedSeconds());

  const remain =
    Math.max(0, GAME_TIME - elapsed);

  timerText.textContent = remain;

  updatePhaseDisplay();

  if (remain <= 0) {
    endGame();
    return;
  }

  requestAnimationFrame(timerLoop);
}

function getRank(score) {
  if (score >= 5000) return "S";
  if (score >= 3200) return "A";
  if (score >= 1800) return "B";

  return "C";
}

function getRankTitle(score) {
  if (score >= 5000) return "タケノコ神";
  if (score >= 3200) return "タケノコ名人";
  if (score >= 1800) return "タケノコビギナー";

  return "また掘ろう";
}

function endGame() {
  if (gameOver) return;

  gameOver = true;

  bgm.pause();

  playSe(resultSe);

  gameScreen.classList.add("hidden");
  resultScreen.classList.remove("hidden");

  rankText.textContent = getRank(score);
  rankTitleText.textContent = getRankTitle(score);
  finalScoreText.textContent = "SCORE " + score;
}