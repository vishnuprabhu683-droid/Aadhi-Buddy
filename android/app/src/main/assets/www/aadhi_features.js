
/* Aadhi AI - 10 Feature Add-on */
(function () {
  'use strict';

  if (window.__aadhi10Loaded) return;
  window.__aadhi10Loaded = true;

  const KEY = 'aadhi10_progress_v2';
  let progress = {};
  try {
    progress = JSON.parse(localStorage.getItem(KEY) || '{}');
  } catch (e) {
    progress = {};
  }

  progress.stars = progress.stars || 0;
  progress.games = progress.games || 0;
  progress.routine = progress.routine || {};
  progress.badges = progress.badges || [];

  function save() {
    try {
      localStorage.setItem(KEY, JSON.stringify(progress));
    } catch (e) {}
  }

  function speak(message, lang) {
    try {
      if (window.AadhiVoice &&
          typeof window.AadhiVoice.speak === 'function') {
        window.AadhiVoice.speak(message, lang || 'en');
        return;
      }
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
        const speech = new SpeechSynthesisUtterance(message);
        speech.lang = lang === 'ta' ? 'ta-IN' : 'en-IN';
        window.speechSynthesis.speak(speech);
      }
    } catch (e) {}
  }

  const style = document.createElement('style');
  style.textContent = `
    #aadhi10-launch {
      position:fixed; right:14px; bottom:18px; z-index:99998;
      border:0; border-radius:30px; padding:13px 18px;
      background:#7139bd; color:white; font-size:16px;
      font-weight:bold; box-shadow:0 4px 14px #0004;
    }
    #aadhi10-overlay {
      display:none; position:fixed; inset:0; z-index:99999;
      background:#fff8e9; color:#302746; overflow:auto;
      font-family:Arial,sans-serif;
    }
    #aadhi10-overlay * {box-sizing:border-box}
    #aadhi10-header {
      position:sticky; top:0; z-index:2; background:#7139bd;
      color:white; padding:14px; display:flex;
      justify-content:space-between; align-items:center;
    }
    #aadhi10-header button {
      border:0; border-radius:10px; padding:8px 13px;
      background:white; color:#7139bd; font-weight:bold;
    }
    #aadhi10-content {padding:14px; max-width:650px; margin:auto}
    .a10-grid {
      display:grid; grid-template-columns:repeat(2,minmax(0,1fr));
      gap:10px;
    }
    .a10-card {
      border:0; border-radius:16px; padding:17px 8px;
      min-height:100px; background:white; color:#302746;
      box-shadow:0 2px 8px #0001; font-size:16px;
    }
    .a10-card span {display:block;font-size:28px;margin-bottom:7px}
    .a10-panel {
      background:white; padding:16px; border-radius:16px;
      box-shadow:0 2px 8px #0001;
    }
    .a10-btn {
      border:0; border-radius:12px; padding:11px 15px;
      margin:5px 3px; background:#7139bd; color:white;
      font-size:15px;
    }
    .a10-option {
      display:block; width:100%; margin:9px 0; padding:13px;
      border:2px solid #e5dafa; border-radius:12px;
      background:#fff; color:#302746; font-size:17px;
    }
    .a10-big {font-size:25px; font-weight:bold; margin:12px 0}
    .a10-muted {color:#756b82;font-size:14px}
    #a10-canvas {
      width:100%; height:260px; border:2px dashed #b9a4d8;
      border-radius:12px; background:white; touch-action:none;
    }
    .a10-check {display:block;padding:10px;background:#fff8e9;
      margin:8px 0;border-radius:10px}
    @media(max-width:360px) {
      .a10-grid {gap:7px}
      .a10-card {font-size:14px;padding:12px 5px}
    }
  `;
  document.head.appendChild(style);

  const launch = document.createElement('button');
  launch.id = 'aadhi10-launch';
  launch.textContent = '✨ Aadhi AI';
  document.body.appendChild(launch);

  const overlay = document.createElement('div');
  overlay.id = 'aadhi10-overlay';
  overlay.innerHTML = `
    <div id="aadhi10-header">
      <strong>✨ Aadhi AI - Learn & Play</strong>
      <button id="a10-close">✕ Close</button>
    </div>
    <main id="aadhi10-content"></main>
  `;
  document.body.appendChild(overlay);

  const content = overlay.querySelector('#aadhi10-content');

  const features = [
    ['💬','Talk to Aadhi'],
    ['🗣️','Voice Practice'],
    ['🧩','Puzzle Games'],
    ['🎨','Drawing & Colouring'],
    ['👨‍👩‍👧','Parent Dashboard'],
    ['🔬','Little Scientist'],
    ['📅','Daily Routine'],
    ['🛡️','Safety School'],
    ['🏅','Reward Badges'],
    ['📖','Stories & Rhymes']
  ];

  function home() {
    content.innerHTML = `
      <h2>Welcome, Little Star! 🌟</h2>
      <p>Learn something new and have fun every day.</p>
      <div class="a10-grid">
        ${features.map((f, i) =>
          `<button class="a10-card" data-feature="${i}">
            <span>${f[0]}</span>${f[1]}
          </button>`
        ).join('')}
      </div>
      <p class="a10-muted" style="text-align:center;margin-top:18px">
        ⭐ Your stars: ${progress.stars}
      </p>
    `;
  }

  function panel(title, html) {
    content.innerHTML = `
      <button class="a10-btn" id="a10-back">← Home</button>
      <h2>${title}</h2>
      <section class="a10-panel">${html}</section>
    `;
  }

  function earnStar() {
    progress.stars++;
    if (progress.stars >= 5 && !progress.badges.includes('Star Collector')) {
      progress.badges.push('Star Collector');
    }
    save();
  }

  function openFeature(index) {
    switch (index) {
      case 0:
        panel('💬 Talk to Aadhi', `
          <p>Hello, my little friend! What would you like to talk about?</p>
          <button class="a10-btn" data-say="Hello! I am happy to learn with you." data-lang="en">English greeting 🔊</button>
          <button class="a10-btn" data-say="வணக்கம்! உன்னுடன் கற்க எனக்கு மகிழ்ச்சி." data-lang="ta">தமிழ் வணக்கம் 🔊</button>
          <p>Choose a feeling:</p>
          <button class="a10-btn" data-say="I am happy today!" data-lang="en">😊 Happy</button>
          <button class="a10-btn" data-say="It is okay to feel sad. Talk to someone you trust." data-lang="en">😢 Sad</button>
          <button class="a10-btn" data-say="Take a slow breath. You can calm down." data-lang="en">😠 Angry</button>
        `);
        break;

      case 1:
        panel('🗣️ Voice Practice', `
          <p>Practise saying these words aloud.</p>
          <button class="a10-option" data-say="Apple" data-lang="en">🍎 Apple 🔊</button>
          <button class="a10-option" data-say="Ball" data-lang="en">⚽ Ball 🔊</button>
          <button class="a10-option" data-say="Cat" data-lang="en">🐱 Cat 🔊</button>
          <button class="a10-option" data-say="அம்மா" data-lang="ta">அம்மா 🔊</button>
          <button class="a10-option" data-say="அப்பா" data-lang="ta">அப்பா 🔊</button>
          <p class="a10-muted">Listen and repeat with a grown-up.</p>
        `);
        break;

      case 2:
        puzzle();
        break;

      case 3:
        panel('🎨 Drawing & Colouring', `
          <p>Draw anything you like!</p>
          <input type="color" id="a10-color" value="#e53935"
            aria-label="Choose drawing colour">
          <button class="a10-btn" id="a10-clear">Clear drawing</button>
          <canvas id="a10-canvas" width="600" height="360"></canvas>
          <p class="a10-muted">Use your finger to draw.</p>
        `);
        drawing();
        break;

      case 4:
        panel('👨‍👩‍👧 Parent Dashboard', `
          <h3>Learning progress</h3>
          <p>⭐ Stars earned: <strong>${progress.stars}</strong></p>
          <p>🎮 Games played: <strong>${progress.games}</strong></p>
          <p>🏅 Badges earned: <strong>${progress.badges.length}</strong></p>
          <p class="a10-muted">This dashboard shows progress saved on this device.</p>
          <button class="a10-btn" id="a10-parent-speak">Read progress aloud</button>
        `);
        break;

      case 5:
        panel('🔬 Little Scientist', `
          <h3>Why does ice melt?</h3>
          <p>Ice melts when it gets warm. It changes from solid ice into liquid water.</p>
          <button class="a10-btn" data-say="Ice melts when it gets warm and becomes water." data-lang="en">Listen 🔊</button>
          <hr>
          <h3>Day and Night</h3>
          <p>The Earth spins. The side facing the Sun has daytime. The other side has night.</p>
          <button class="a10-btn" data-say="The Earth spins. We have day when our side faces the Sun." data-lang="en">Listen 🔊</button>
          <p class="a10-muted">Try these activities with a grown-up.</p>
        `);
        break;

      case 6:
        routine();
        break;

      case 7:
        panel('🛡️ Safety School', `
          <h3>Remember these safety rules</h3>
          <p>🧑‍🤝‍🧑 Stay near a trusted grown-up.</p>
          <p>🚦 Cross roads with an adult.</p>
          <p>🔥 Never touch matches or hot objects.</p>
          <p>🔒 Never share your address, password or phone number online.</p>
          <p>🆘 If you feel unsafe, tell a trusted grown-up immediately.</p>
          <button class="a10-btn" data-say="If you feel unsafe, tell a trusted grown-up immediately." data-lang="en">Listen 🔊</button>
        `);
        break;

      case 8:
        panel('🏅 Reward Badges', `
          <p>Keep learning to earn stars and badges!</p>
          <p>⭐ Total stars: ${progress.stars}</p>
          <h3>Your badges</h3>
          ${progress.badges.length
            ? progress.badges.map(b => `<p>🏅 ${b}</p>`).join('')
            : '<p>No badges yet. Play a game to get started!</p>'}
        `);
        break;

      case 9:
        panel('📖 Stories & Rhymes', `
          <h3>🐢 The Kind Little Turtle</h3>
          <p>One sunny day, a little turtle saw a thirsty bird. The turtle showed the bird a small pond. The bird drank water and smiled. They became good friends.</p>
          <button class="a10-btn" data-say="One sunny day, a little turtle saw a thirsty bird. The turtle showed the bird a small pond. The bird drank water and smiled. They became good friends." data-lang="en">Read story aloud 🔊</button>
          <hr>
          <h3>🌟 Twinkle, Twinkle</h3>
          <p>Twinkle, twinkle, little star. How I wonder what you are!</p>
          <button class="a10-btn" data-say="Twinkle, twinkle, little star. How I wonder what you are!" data-lang="en">Say rhyme aloud 🔊</button>
        `);
        break;
    }
  }

  function puzzle() {
    const questions = [
      {q:'Which one is an animal?', a:['🪑 Chair','🐘 Elephant','✏️ Pencil'], correct:1},
      {q:'How many sides does a triangle have?', a:['2','3','4'], correct:1},
      {q:'Which colour is the Sun usually shown as?', a:['Yellow','Blue','Green'], correct:0},
      {q:'What comes after 4?', a:['3','5','7'], correct:1}
    ];
    const q = questions[Math.floor(Math.random() * questions.length)];
    panel('🧩 Puzzle Game', `
      <h3>${q.q}</h3>
      ${q.a.map((a,i) =>
        `<button class="a10-option" data-answer="${i}" data-correct="${q.correct}">${a}</button>`
      ).join('')}
      <p id="a10-game-result" aria-live="polite"></p>
    `);
  }

  function routine() {
    const tasks = [
      'Wake up and brush my teeth',
      'Eat a healthy breakfast',
      'Learn something new',
      'Play and exercise',
      'Read a story',
      'Go to bed on time'
    ];
    panel('📅 Daily Routine', `
      <p>Tick the activities you have completed today.</p>
      ${tasks.map((t,i) => `
        <label class="a10-check">
          <input type="checkbox" data-routine="${i}"
            ${progress.routine[i] ? 'checked' : ''}> ${t}
        </label>
      `).join('')}
      <p id="a10-routine-result"></p>
    `);
  }

  function drawing() {
    const canvas = content.querySelector('#a10-canvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let drawingNow = false;

    function position(e) {
      const r = canvas.getBoundingClientRect();
      return {
        x: (e.clientX - r.left) * canvas.width / r.width,
        y: (e.clientY - r.top) * canvas.height / r.height
      };
    }

    canvas.addEventListener('pointerdown', e => {
      drawingNow = true;
      const p = position(e);
      ctx.beginPath();
      ctx.moveTo(p.x, p.y);
      canvas.setPointerCapture(e.pointerId);
    });

    canvas.addEventListener('pointermove', e => {
      if (!drawingNow) return;
      const p = position(e);
      ctx.strokeStyle = content.querySelector('#a10-color').value;
      ctx.lineWidth = 8;
      ctx.lineCap = 'round';
      ctx.lineTo(p.x, p.y);
      ctx.stroke();
    });

    canvas.addEventListener('pointerup', () => drawingNow = false);
    canvas.addEventListener('pointercancel', () => drawingNow = false);

    content.querySelector('#a10-clear').addEventListener('click', () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    });
  }

  launch.addEventListener('click', () => {
    overlay.style.display = 'block';
    home();
  });

  overlay.addEventListener('click', e => {
    const target = e.target;

    if (target.id === 'a10-close') {
      overlay.style.display = 'none';
      return;
    }

    if (target.id === 'a10-back') {
      home();
      return;
    }

    const card = target.closest('[data-feature]');
    if (card) {
      openFeature(Number(card.dataset.feature));
      return;
    }

    const sayButton = target.closest('[data-say]');
    if (sayButton) {
      speak(sayButton.dataset.say, sayButton.dataset.lang);
      return;
    }

    const answer = target.closest('[data-answer]');
    if (answer) {
      const result = content.querySelector('#a10-game-result');
      if (Number(answer.dataset.answer) === Number(answer.dataset.correct)) {
        result.textContent = 'Correct! Wonderful work! ⭐';
        earnStar();
      } else {
        result.textContent = 'Try again! You can do it! 😊';
      }
      progress.games++;
      save();
      return;
    }

    if (target.id === 'a10-parent-speak') {
      speak(
        'You have earned ' + progress.stars +
        ' stars and played ' + progress.games + ' games.',
        'en'
      );
    }
  });

  overlay.addEventListener('change', e => {
    if (e.target.matches('[data-routine]')) {
      const id = e.target.dataset.routine;
      progress.routine[id] = e.target.checked;
      save();
      const result = content.querySelector('#a10-routine-result');
      const completed = Object.values(progress.routine).filter(Boolean).length;
      result.textContent = completed + ' activities completed. Great job!';
    }
  });

  home();
})();

/* Aadhi AI - Voice Conversation */

(function () {
  if (window.__aadhiVoiceChatAdded) return;
  window.__aadhiVoiceChatAdded = true;

  function addVoiceChat() {
    if (document.getElementById("aadhiVoiceChat")) return;

    const panel = document.createElement("div");
    panel.id = "aadhiVoiceChat";

    panel.style.cssText = `
      position:fixed;
      bottom:85px;
      right:15px;
      z-index:99999;
      background:#fff;
      padding:14px;
      border-radius:18px;
      box-shadow:0 3px 15px #0003;
      width:260px;
      font-family:Arial,sans-serif;
      display:none;
      color:#342f48;
    `;

    panel.innerHTML = `
      <b style="font-size:17px;">🎤 Talk to Aadhi</b>

      <p style="font-size:13px;">
        Choose a language and tap the microphone.
      </p>

      <select id="aadhiVoiceLanguage"
        style="width:100%;padding:9px;border-radius:9px;">
        <option value="en-IN">English</option>
        <option value="ta-IN">தமிழ்</option>
      </select>

      <button id="aadhiMicButton"
        style="width:100%;padding:12px;margin-top:10px;
        border:0;border-radius:12px;background:#7c4dff;
        color:white;font-size:16px;">
        🎤 Speak
      </button>

      <p id="aadhiVoiceStatus"
        style="font-size:13px;margin-top:10px;">
        Ready to listen!
      </p>

      <p id="aadhiVoiceHeard"
        style="font-size:14px;word-wrap:break-word;"></p>

      <button id="aadhiVoiceClose"
        style="padding:8px 14px;border:0;border-radius:8px;">
        Close
      </button>
    `;

    document.body.appendChild(panel);

    const openButton = document.createElement("button");
    openButton.id = "aadhiVoiceOpen";
    openButton.innerHTML = "🎤 Talk to Aadhi";
    openButton.style.cssText = `
      position:fixed;
      bottom:20px;
      right:15px;
      z-index:99998;
      border:0;
      border-radius:25px;
      padding:13px 18px;
      background:#7c4dff;
      color:white;
      font-weight:bold;
      box-shadow:0 3px 12px #0003;
    `;

    document.body.appendChild(openButton);

    openButton.onclick = () => {
      panel.style.display = "block";
    };

    document.getElementById("aadhiVoiceClose").onclick = () => {
      panel.style.display = "none";
      if (window.AadhiVoice) {
        AadhiVoice.cancelListen();
      }
    };

    document.getElementById("aadhiMicButton").onclick = () => {
      const language =
        document.getElementById("aadhiVoiceLanguage").value;

      document.getElementById("aadhiVoiceStatus").textContent =
        "Listening...";

      document.getElementById("aadhiVoiceHeard").textContent = "";

      if (window.AadhiVoice) {
        AadhiVoice.listen(language);
      } else {
        document.getElementById("aadhiVoiceStatus").textContent =
          "Voice service unavailable.";
      }
    };
  }

  window.onAadhiSpeechStatus = function (message) {
    const status = document.getElementById("aadhiVoiceStatus");
    if (status) status.textContent = message;
  };

  window.onAadhiSpeechError = function (message) {
    const status = document.getElementById("aadhiVoiceStatus");
    if (status) status.textContent = message;
  };

  window.onAadhiSpeechResult = function (message) {
    const language =
      document.getElementById("aadhiVoiceLanguage").value;

    const heard = document.getElementById("aadhiVoiceHeard");
    const status = document.getElementById("aadhiVoiceStatus");

    if (heard) heard.textContent = "You said: " + message;

    if (status) status.textContent = "Aadhi heard you!";

    if (window.AadhiVoice) {
      const reply = language === "ta-IN"
        ? "நீங்கள் சொன்னது எனக்குப் புரிந்தது. அருமை!"
        : "I heard you! Well done. What would you like to learn today?";

      AadhiVoice.speak(reply, language);
    }
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", addVoiceChat);
  } else {
    addVoiceChat();
  }
})();
