const titleScreen = document.getElementById("titleScreen");
const gameScreen = document.getElementById("gameScreen");
const resultScreen = document.getElementById("resultScreen");

const titleStartButton =
  document.getElementById("titleStartButton");

const backTitleButton =
  document.getElementById("backTitleButton");

const grid = document.getElementById("grid");

const scoreText = document.getElementById("score");
const timerText = document.getElementById("timer");
const phaseText = document.getElementById("phase");

const resultImage =
  document.getElementById("resultImage");

const rankTitleText =
  document.getElementById("rankTitle");

const finalScoreText =
  document.getElementById("finalScore");

const shareButton =
  document.getElementById("shareButton");

const retryButton =
  document.getElementById("retryButton");

const homeButton =
  document.getElementById("homeButton");

const CELL_COUNT = 9;
const GAME_TIME = 40;

// 通常

const SPAWN_NORMAL = 1150;
const SMALL_TO_MID_NORMAL = 650;
const MID_TO_LOCK_NORMAL = 1500;

// 成長注意！

const SPAWN_SABI = 460;
const SMALL_TO_MID_SABI = 260;
const MID_TO_LOCK_SABI = 620;

// BONUS

const BONUS_RATE = 0.08;
const BONUS_SCORE = 300;

// AUDIO

const bgm = new Audio("bgm.mp3");

const startSe =
  new Audio("start.mp3");

const harvestSe =
  new Audio("harvest.mp3");

const perfectSe =
  new Audio("perfect.mp3");

const lockSe =
  new Audio("lock.mp3");

const warningSe =
  new Audio("warning.mp3");

const resultSe =
  new Audio("result.mp3");

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

let warningPlayed = false;

let startTime = 0;

function playSe(sound) {

  sound.currentTime = 0;

  sound.play().catch(() => {});
}

function stopBgm() {

  bgm.pause();

  bgm.currentTime = 0;
}

function showOnly(screen) {

  titleScreen.classList.add("hidden");
  gameScreen.classList.add("hidden");
  resultScreen.classList.add("hidden");

  screen.classList.remove("hidden");
}

function resetGameState() {

  cells = [];
  bamboos = [];

  score = 0;

  gameOver = false;

  warningPlayed = false;

  startTime = 0;

  scoreText.textContent =
    "SCORE 0";

  timerText.textContent =
    GAME_TIME;

  phaseText.textContent = "";

  phaseText.classList.remove("warning");

  grid.innerHTML = "";

  stopBgm();
}

titleStartButton.addEventListener("click", () => {

  startGame();

});

backTitleButton.addEventListener("click", () => {

  goToTitleScreen();

});

retryButton.addEventListener("click", () => {

  goToTitleScreen();

});

homeButton.addEventListener("click", () => {

  window.location.href =
    "https://afoolhippo.github.io/home/?skipTitle=1";

});

shareButton.addEventListener("click", () => {

  const text =
    getShareText(score);

  const shareUrl =
    "https://twitter.com/intent/tweet?text=" +
    encodeURIComponent(text);

  window.open(shareUrl, "_blank");

});

function goToTitleScreen() {

  resetGameState();

  showOnly(titleScreen);
}

function startGame() {

  playSe(startSe);

  showOnly(gameScreen);

  score = 0;

  gameOver = false;

  warningPlayed = false;

  scoreText.textContent =
    "SCORE 0";

  timerText.textContent =
    GAME_TIME;

  phaseText.textContent = "";

  phaseText.classList.remove("warning");

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

    const cell =
      document.createElement("div");

    cell.className = "cell";

    cell.addEventListener("click", () => {

      harvest(i);

    });

    grid.appendChild(cell);

    cells.push(cell);

    bamboos.push(null);
  }
}

function getElapsedSeconds() {

  return (
    Date.now() - startTime
  ) / 1000;
}

function isSabiTime() {

  const elapsed =
    getElapsedSeconds();

  return (
    elapsed >= 18 &&
    elapsed < 36
  );
}

function updatePhaseDisplay() {

  if (isSabiTime()) {

    phaseText.textContent =
      "成長注意！";

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
    emptyIndexes[
      Math.floor(
        Math.random() *
        emptyIndexes.length
      )
    ];

  const isBonus =
    Math.random() < BONUS_RATE;

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

  // BONUS

  if (isBonus) {

    setTimeout(() => {

      if (gameOver) return;

      if (bamboos[index] !== bamboo)
        return;

      bamboos[index] = null;

      render();

    }, smallToMid);

    return;
  }

  // 小 → 中

  setTimeout(() => {

    if (gameOver) return;

    if (bamboos[index] !== bamboo)
      return;

    bamboo.stage = 2;

    render();

  }, smallToMid);

  // 中 → 竹林

  setTimeout(() => {

    if (gameOver) return;

    if (bamboos[index] !== bamboo)
      return;

    bamboo.stage = 3;

    playSe(lockSe);

    render();

  }, smallToMid + midToLock);
}

function harvest(index) {

  if (gameOver) return;

  const bamboo =
    bamboos[index];

  if (!bamboo) return;

  if (bamboo.stage === 3)
    return;

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

  scoreText.textContent =
    "SCORE " + score;

  bamboos[index] = null;

  render();
}

function render() {

  for (let i = 0; i < CELL_COUNT; i++) {

    const cell =
      cells[i];

    cell.innerHTML = "";

    cell.className = "cell";

    const bamboo =
      bamboos[i];

    if (!bamboo)
      continue;

    const img =
      document.createElement("img");

    if (bamboo.bonus) {

      img.src =
        "gold_bamboo.png";

      cell.classList.add("stage-1");

      cell.classList.add("bonus");

    } else if (bamboo.stage === 1) {

      img.src =
        "bamboo1.png";

      cell.classList.add("stage-1");

    } else if (bamboo.stage === 2) {

      img.src =
        "bamboo2.png";

      cell.classList.add("stage-2");

    } else if (bamboo.stage === 3) {

      img.src =
        "bamboo3.png";

      cell.classList.add("stage-3");

      cell.classList.add("locked");
    }

    cell.appendChild(img);
  }

  checkAllLocked();
}

function isAllLocked() {

  return bamboos.every((bamboo) => {

    return (
      bamboo &&
      bamboo.stage === 3
    );
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

  setTimeout(
    spawnLoop,
    nextSpawn
  );
}

function timerLoop() {

  if (gameOver) return;

  const elapsed =
    Math.floor(
      getElapsedSeconds()
    );

  const remain =
    Math.max(
      0,
      GAME_TIME - elapsed
    );

  timerText.textContent =
    remain;

  updatePhaseDisplay();

  if (remain <= 0) {

    endGame();

    return;
  }

  requestAnimationFrame(
    timerLoop
  );
}

function getRankTitle(score) {

  if (score >= 2800)
    return "タケノコ神";

  if (score >= 2000)
    return "タケノコ名人";

  if (score >= 1200)
    return "タケノコビギナー";

  return "また掘ろう";
}

function getShareText(score) {

  const title =
    getRankTitle(score);

  let message = "";

  if (title === "タケノコ神") {

    message =
      "タケノコ神、爆誕。🎋👴✨";

  } else if (
    title === "タケノコ名人" ||
    title === "タケノコビギナー"
  ) {

    message =
      "タケノコ、掘りまくった！🎋✨";

  } else {

    message =
      "竹林に埋もれました…🎋💦";
  }

  return `${message}
SCORE ${score}

無料ブラウザゲーム
「BABY BABY BAMBOO」
https://afoolhippo.github.io/game5/

#BABYBABYBAMBOO #カバゲーセン`;
}

function endGame() {

  if (gameOver) return;

  gameOver = true;

  bgm.pause();

  playSe(resultSe);

  showOnly(resultScreen);

  const title =
    getRankTitle(score);

  rankTitleText.textContent =
    title;

  finalScoreText.textContent =
    "SCORE " + score;

  if (title === "タケノコ神") {

    resultImage.src =
      "result_god.png";

  } else if (
    title === "タケノコ名人" ||
    title === "タケノコビギナー"
  ) {

    resultImage.src =
      "result_normal.png";

  } else {

    resultImage.src =
      "result_sad.png";
  }
}