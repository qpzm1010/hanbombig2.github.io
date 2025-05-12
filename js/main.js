function startGame() {
    const coin = parseInt(document.getElementById('coinInput').value);
    if (!coin || coin <= 0) {
      alert("1개 이상의 코인을 입력하세요.");
      return;
    }
    localStorage.setItem("coins", coin);
    window.location.href = "slot.html";
  }

  let unlocked = false;
  let inputBuffer = "";
  
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
  });
  
  ["contextmenu", "mousedown", "mouseup", "mousemove"].forEach(event =>
    document.addEventListener(event, e => { if (!unlocked) e.preventDefault(); })
  );
  