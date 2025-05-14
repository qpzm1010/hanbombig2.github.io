document.addEventListener("DOMContentLoaded", () => {
  const slots = [0, 1, 2].map(i => document.getElementById('slot' + i));
  const spinSound = document.getElementById("spinSound");
  const result = document.getElementById("result");
  const coinDisplay = document.getElementById("coinDisplay");
  const menuBtn = document.getElementById("menuBtn");

const gradeChances = [
  { grade: "1등", weight: 0.0001, numbers: [7, 7, 7] },
  { grade: "2등", weight: 17_000_000_000, numbers: [6, 6, 6] },       // 1.7%
  { grade: "3등", weight: 58_000_000_000, numbers: [5, 5, 5] },       // ↓ 6% → 5.8%
  { grade: "4등", weight: 84_000_000_000, numbers: [4, 4, 4] },       // ↓ 10% → 8.4%
  { grade: "5등", weight: 250_000_000_000 },                          // ↑ 25%
  { grade: "6등", weight: 590_999_999_999 }                           // ↑ 나머지 59.1%
];


  let coins = parseInt(localStorage.getItem("coins")) || 3;
  coinDisplay.textContent = `💰 남은 코인: ${coins}`;
  localStorage.setItem("coins", coins);

  let intervals = [null, null, null];
  let resultValues = [0, 0, 0];
  let chosenGrade = "6등";
  let slotsStopped = 0;
  let state = "idle"; // "idle", "spinning", "stopping"

  function logState(action) {
    console.log(`[STATE] ${action} | state: ${state} | coins: ${coins} | slotsStopped: ${slotsStopped}`);
  }

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
    if (state !== "idle" || coins <= 0) return;
    logState("startSpin");

    state = "spinning";
    result.textContent = "";
    spinSound.currentTime = 0;

    spinSound.play().catch(err => console.warn("오디오 재생 실패:", err));

    chosenGrade = pickGrade();
    resultValues = generateByGrade(chosenGrade);
    slotsStopped = 0;

    for (let i = 0; i < 3; i++) {
      intervals[i] = setInterval(() => {
        slots[i].textContent = Math.floor(Math.random() * 9) + 1;
      }, 80);
    }

    coins--;
    localStorage.setItem("coins", coins);
    coinDisplay.textContent = `💰 남은 코인: ${coins}`;

    setTimeout(() => {
      state = "stopping";
      logState("changed to stopping");
    }, 100);
  }

  function stopOne() {
    if (state !== "stopping" || slotsStopped >= 3) return;
    logState("stopOne");

    clearInterval(intervals[slotsStopped]);
    slots[slotsStopped].textContent = resultValues[slotsStopped];
    intervals[slotsStopped] = null;
    slotsStopped++;

    if (slotsStopped === 3) {
      spinSound.pause();
      result.textContent = `${chosenGrade} 당첨! 🎉`;
      state = "idle";
      logState("finished spin");

      if (coins <= 0) {
        setTimeout(() => {
          result.textContent = "코인을 모두 사용했습니다! ⛔";
          menuBtn.style.display = "inline-block";
        }, 1000);
      }
    }
  }

  window.addEventListener("keyup", e => {
    if (e.code !== "Space") return;
    logState("Space pressed");

    if (state === "idle") {
      startSpin();
    } else if (state === "stopping" && slotsStopped < 3) {
      stopOne();
    }
  });
});
