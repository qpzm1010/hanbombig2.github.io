const slots = [0, 1, 2].map(i => document.getElementById('slot' + i));
const spinSound = document.getElementById("spinSound");
const result = document.getElementById("result");
const coinDisplay = document.getElementById("coinDisplay");
const menuBtn = document.getElementById("menuBtn");

// 확률표 수정 반영 가능티비
const gradeChances = {
  "1등": 1,
  "2등": 3,
  "3등": 5,
  "4등": 10,
  "5등": 15,
  "6등": 66
};

const gradeMap = {
  7: "1등",
  6: "2등",
  5: "3등",
  4: "4등",
  3: "5등"
};

// if좀 그만 쓰게해주세요
function getRandomSymbol() {
  const table = [
    { num: 7, weight: gradeChances["1등"] },
    { num: 6, weight: gradeChances["2등"] },
    { num: 5, weight: gradeChances["3등"] },
    { num: 4, weight: gradeChances["4등"] },
    { num: 3, weight: gradeChances["5등"] }
  ];

  const total = table.reduce((sum, item) => sum + item.weight, 0);
  const rand = Math.random() * total;

  let acc = 0;
  for (const item of table) {
    acc += item.weight;
    if (rand <= acc) return item.num;
  }
  return 3;
}

let values = [7, 7, 7];
let intervals = [null, null, null];
let stopped = 0;
let unlocked = false;
let inputBuffer = "";

let coins = parseInt(localStorage.getItem("coins")) || 0;
coinDisplay.textContent = `💰 남은 코인: ${coins}`;

function startSpinning() {
  if (intervals.some(v => v !== null)) return;
  if (coins <= 0) {
    result.textContent = "코인을 모두 사용했습니다!⛔";
    menuBtn.style.display = "inline-block";
    return;
  }

  stopped = 0;
  result.textContent = "";
  spinSound.currentTime = 0;
  spinSound.play();

  for (let i = 0; i < 3; i++) {
    intervals[i] = setInterval(() => {
      const rand = getRandomSymbol();
      slots[i].style.opacity = 0.2;
      setTimeout(() => {
        slots[i].textContent = rand;
        values[i] = rand;
        slots[i].style.opacity = 1;
      }, 100);
    }, 80);
  }

  coins--;
  coinDisplay.textContent = `💰 남은 코인: ${coins}`;
}

function stopOne() {
  if (stopped < 3) {
    clearInterval(intervals[stopped]);
    intervals[stopped] = null;
    stopped++;
    if (stopped === 3) {
      spinSound.pause();
      evaluate();
    }
  }
}

function evaluate() {
  const [a, b, c] = values;
  if (a === b && b === c) {
    const rank = gradeMap[a] || "6등";
    result.textContent = `${rank} 당첨!🎉`;
  } else {
    result.textContent = "6등 (다음 기회에...😢)";
  }

  if (coins <= 0) {
    menuBtn.style.display = "inline-block";
    setTimeout(() => {
      result.textContent = "코인을 모두 사용했습니다!⛔";
    }, 1000);
  }
}

function goToMenu() {
  window.location.href = "index.html";
}


window.addEventListener("keydown", e => {
  if (!unlocked) {
    if (e.code === "F11") return;

    if (e.key.length === 1 && /^[a-zA-Z0-9]$/.test(e.key)) {
      inputBuffer += e.key;
      if (inputBuffer.length > 20) inputBuffer = inputBuffer.slice(-20);
    }
    if (e.key === "Enter") {
      if (inputBuffer === "unlock") {
        const pw = prompt("비밀번호를 입력하세요:");
        if (pw === "kim") {
          alert("제어 해제됨");
          unlocked = true;
        } else {
          alert("비밀번호 틀림");
          inputBuffer = "";
        }
      } else {
        inputBuffer = "";
      }
    }

    const allowedCodes = ["Tab", "Enter", "Backspace", "Delete", "Space"];
    if (
      !allowedCodes.includes(e.code) &&
      !/^\d$/.test(e.key)
    ) {
      e.preventDefault();
    }

    if (["F12", "F5", "Escape"].includes(e.key)) e.preventDefault();
    if (e.ctrlKey && (e.shiftKey || ["u", "s", "i", "j"].includes(e.key.toLowerCase()))) {
      e.preventDefault();
    }
  }

  if (e.code === "Space") {
    if (intervals.every(i => i === null)) {
      startSpinning();
    } else {
      stopOne();
    }
  }
});

["contextmenu", "mousedown", "mouseup", "mousemove"].forEach(event =>
  document.addEventListener(event, e => { if (!unlocked) e.preventDefault(); })
);
