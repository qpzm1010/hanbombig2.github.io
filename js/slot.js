const slots = [0, 1, 2].map(i => document.getElementById('slot' + i));
const spinSound = document.getElementById("spinSound");
const result = document.getElementById("result");
const coinDisplay = document.getElementById("coinDisplay");
const menuBtn = document.getElementById("menuBtn");

const gradeChances = [
  { grade: "1등", weight: 0 }, 
  { grade: "2등", weight: 0.1 }, 
  { grade: "3등", weight: 1 }, 
  { grade: "4등", weight: 35_000_000_000_000_000 }, 
  { grade: "5등", weight: 300_000_000_000_000_000 }, 
  { grade: "6등", weight: 665_000_000_000_000_000 }
];

let coins = parseInt(localStorage.getItem("coins")) || 0;
coinDisplay.textContent = `💰 남은 코인: ${coins}`;

let intervals = [null, null, null];
let stopped = 0;
let chosenGrade = "6등";
let resultValues = [0, 0, 0];

function pickGrade() {
  const total = gradeChances.reduce((sum, g) => sum + g.weight, 0);
  const rand = Math.random() * total;
  let acc = 0;
  for (const g of gradeChances) {
    acc += g.weight;
    if (rand <= acc) return g.grade;
  }
  return "6등";
}

function generateByGrade(grade) {
  if (grade === "5등") {
    const same = Math.floor(Math.random() * 9) + 1;
    let diff;
    do {
      diff = Math.floor(Math.random() * 9) + 1;
    } while (diff === same);
    const pos = [0, 1, 2];
    const i1 = pos.splice(Math.floor(Math.random() * pos.length), 1)[0];
    const i2 = pos.splice(Math.floor(Math.random() * pos.length), 1)[0];
    const i3 = pos[0];
    const result = [];
    result[i1] = same;
    result[i2] = same;
    result[i3] = diff;
    return result;
  }
  if (grade === "6등") {
    const nums = [];
    while (nums.length < 3) {
      const n = Math.floor(Math.random() * 9) + 1;
      if (!nums.includes(n)) nums.push(n);
    }
    return nums;
  }
  return gradeChances.find(g => g.grade === grade).numbers;
}

function startSpin() {
  if (intervals.some(x => x !== null)) return;
  if (coins <= 0) {
    result.textContent = "코인을 모두 사용했습니다!⛔";
    menuBtn.style.display = "inline-block";
    return;
  }
  result.textContent = "";
  spinSound.currentTime = 0;
  spinSound.play();
  stopped = 0;
  chosenGrade = pickGrade();
  resultValues = generateByGrade(chosenGrade);
  for (let i = 0; i < 3; i++) {
    intervals[i] = setInterval(() => {
      slots[i].textContent = Math.floor(Math.random() * 9) + 1;
    }, 80);
  }
  coins--;
  coinDisplay.textContent = `💰 남은 코인: ${coins}`;
}

function stopOne() {
  if (stopped < 3) {
    clearInterval(intervals[stopped]);
    slots[stopped].textContent = resultValues[stopped];
    intervals[stopped] = null;
    stopped++;
    if (stopped === 3) {
      spinSound.pause();
      result.textContent = `${chosenGrade} 당첨! 🎉`;
      if (coins <= 0) {
        setTimeout(() => {
          result.textContent = "코인을 모두 사용했습니다!⛔";
          menuBtn.style.display = "inline-block";
        }, 1000);
      }
    }
  }
}

function goToMenu() {
  window.location.href = "index.html";
}

// 🔒 제어 제한 관련
let unlocked = false;
let inputBuffer = "";

window.addEventListener("keydown", e => {
  if (!unlocked) {
    // unlock 커맨드 입력 감지
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

  // 실제 게임 제어
  if (e.code === "Space") {
    if (intervals.every(x => x === null)) {
      startSpin();
    } else {
      stopOne();
    }
  }
});

// 🔒 마우스 제어도 제한
["contextmenu", "mousedown", "mouseup", "mousemove"].forEach(event =>
  document.addEventListener(event, e => { if (!unlocked) e.preventDefault(); })
);
