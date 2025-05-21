// --- Story Data ---
const chapters = [
  {
    audio: "audio/chapter0.mp3",
    transcript: [
      { text: "Summer ’97.", start: 0, end: 2 },
      { text: "A few months back, we lost Biggie Smalls...", start: 2, end: 7 },
      // ...add more lines
    ],
  },
  {
    audio: "audio/chapter1.mp3",
    transcript: [
      { text: "Normally, I wouldn’t be caught dead in a place like this.", start: 0, end: 4 },
      // ...add more lines
    ],
  },
  {
    audio: "audio/chapter2.mp3",
    transcript: [
      { text: "Access terminal at NepoCorp HQ 50th sub-level.", start: 0, end: 4 },
      // ...add more lines
    ],
  },
  {
    audio: "audio/chapter3.mp3",
    transcript: [
      { text: "Soon as I get to Little Odessa, I find a pay phone and ring Charlene.", start: 0, end: 5 },
      { text: "No answer. No matter.", start: 5, end: 8 },
      // ...add more lines
    ],
  },
];

const steps = [
  "login",
  "chapter0",
  "chapter1",
  "arcade",
  "chapter2",
  "nepocorphq",
  "chapter3"
];

let state = {
  step: 0,
  arcadeComplete: false,
  hqComplete: false,
};

const app = document.getElementById("app");

// --- Navigation ---
function renderNav() {
  const nav = document.createElement("nav");
  steps.forEach((label, i) => {
    const btn = document.createElement("button");
    btn.textContent = label.replace(/^chapter/, "Ch.");
    btn.disabled = i > state.step;
    btn.className = i === state.step ? "active" : "";
    btn.onclick = () => {
      if (i <= state.step) {
        state.step = i;
        render();
      }
    };
    nav.appendChild(btn);
  });
  return nav;
}

// --- Login ---
function renderLogin() {
  const div = document.createElement("div");
  div.innerHTML = `
    <h2>Enter Access Code</h2>
    <form id="login-form">
      <input id="code" autocomplete="off" />
      <button type="submit">Login</button>
    </form>
    <div id="login-error" style="color:#f44"></div>
  `;
  div.querySelector("form").onsubmit = e => {
    e.preventDefault();
    const code = div.querySelector("#code").value;
    if (code === "1997") {
      state.step = 1;
      render();
    } else {
      div.querySelector("#login-error").textContent = "Access Denied";
    }
  };
  return div;
}

// --- Typed Text & Audio Sync ---
function renderChapter(num, onComplete) {
  const { audio, transcript } = chapters[num];
  const div = document.createElement("div");
  div.innerHTML = `
    <audio id="audio" src="${audio}" controls autoplay></audio>
    <div class="typed-text"></div>
  `;
  const typedDiv = div.querySelector(".typed-text");
  transcript.forEach((line, i) => {
    const span = document.createElement("span");
    span.textContent = line.text + " ";
    typedDiv.appendChild(span);
  });
  const spans = typedDiv.querySelectorAll("span");
  const audioEl = div.querySelector("#audio");

  function updateText() {
    const t = audioEl.currentTime;
    transcript.forEach((line, i) => {
      if (t >= line.start && t < line.end) {
        spans[i].classList.add("active");
      } else {
        spans[i].classList.remove("active");
      }
    });
    if (t >= transcript[transcript.length - 1].end) {
      if (onComplete) onComplete();
    }
  }
  audioEl.addEventListener("timeupdate", updateText);
  updateText();

  return div;
}

// --- Arcade Overlay ---
function renderArcadeOverlay(onComplete) {
  const overlay = document.createElement("div");
  overlay.className = "overlay";
  overlay.innerHTML = `
    <iframe src="arcade/index.html" width="800" height="600" style="border:2px solid #39ff14"></iframe>
    <button id="arcade-done">Continue</button>
  `;
  overlay.querySelector("#arcade-done").onclick = () => {
    state.arcadeComplete = true;
    state.step = 4;
    render();
  };
  return overlay;
}

// --- NepoCorpHQ Overlay ---
function renderHQOverlay(onComplete) {
  const overlay = document.createElement("div");
  overlay.className = "overlay";
  overlay.innerHTML = `
    <iframe src="nepocorphq/index.html" width="800" height="600" style="border:2px solid #39ff14"></iframe>
    <button id="hq-done">Continue</button>
  `;
  overlay.querySelector("#hq-done").onclick = () => {
    state.hqComplete = true;
    state.step = 6;
    render();
  };
  return overlay;
}

// --- Main Render ---
function render() {
  app.innerHTML = "";
  document.body.querySelectorAll("nav").forEach(n => n.remove());
  document.body.appendChild(renderNav());

  switch (state.step) {
    case 0:
      app.appendChild(renderLogin());
      break;
    case 1:
      app.appendChild(renderChapter(0, () => {
        state.step = 2;
        render();
      }));
      break;
    case 2:
      app.appendChild(renderChapter(1, () => {
        state.step = 3;
        render();
      }));
      break;
    case 3:
      app.appendChild(renderChapter(1, null));
      app.appendChild(renderArcadeOverlay());
      break;
    case 4:
      app.appendChild(renderChapter(2, () => {
        state.step = 5;
        render();
      }));
      break;
    case 5:
      app.appendChild(renderChapter(2, null));
      app.appendChild(renderHQOverlay());
      break;
    case 6:
      app.appendChild(renderChapter(3, () => {
        state.step = 0;
        render();
      }));
      break;
    default:
      app.appendChild(renderLogin());
  }
}

render();