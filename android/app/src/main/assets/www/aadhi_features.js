
/* Aadhi AI - Complete 10 Feature Add-on + Voice Conversation
   Uses the existing Android AadhiVoice bridge.
*/
(function () {
  'use strict';

  if (window.__aadhiCompleteLoaded) return;
  window.__aadhiCompleteLoaded = true;

  const STORAGE_KEY = 'aadhi_complete_progress_v1';
  const progress = loadProgress();

  function loadProgress() {
    try {
      const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
      return {
        stars: Number(saved.stars) || 0,
        games: Number(saved.games) || 0,
        routine: saved.routine && typeof saved.routine === 'object' ? saved.routine : {},
        badges: Array.isArray(saved.badges) ? saved.badges : []
      };
    } catch (_) {
      return { stars: 0, games: 0, routine: {}, badges: [] };
    }
  }

  function saveProgress() {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(progress)); } catch (_) {}
  }

  function speak(message, language) {
    try {
      if (window.AadhiVoice && typeof window.AadhiVoice.speak === 'function') {
        window.AadhiVoice.speak(String(message), language || 'en');
        return;
      }
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(String(message));
        utterance.lang = language === 'ta' ? 'ta-IN' : 'en-IN';
        window.speechSynthesis.speak(utterance);
      }
    } catch (error) {
      console.log('Aadhi speech unavailable:', error);
    }
  }

  function escapeHTML(value) {
    return String(value).replace(/[&<>"']/g, ch => ({
      '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
    }[ch]));
  }

  const style = document.createElement('style');
  style.textContent = `
    #aadhi10-launch {
      position:fixed; right:14px; bottom:82px; z-index:99990;
      border:0; border-radius:28px; padding:13px 18px;
      background:#6c4bd8; color:#fff; font-size:15px; font-weight:700;
      box-shadow:0 4px 14px #0003;
    }
    #aadhi10-overlay {
      display:none; position:fixed; inset:0; z-index:99991;
      background:#fff8e9; color:#302b43; overflow:auto;
      font-family:Arial,sans-serif;
    }
    #aadhi10-header {
      position:sticky; top:0; z-index:2; display:flex;
      align-items:center; justify-content:space-between; gap:8px;
      padding:14px; background:#6c4bd8; color:white;
    }
    #aadhi10-header strong { font-size:17px; }
    #aadhi10-header button, .a10-back {
      border:0; border-radius:9px; padding:9px 12px;
      background:#fff; color:#40326f; font-weight:700;
    }
    #aadhi10-content { padding:16px; max-width:760px; margin:auto; }
    .a10-welcome { text-align:center; padding:12px 4px 18px; }
    .a10-welcome h2 { margin:5px 0; color:#5538b5; }
    .a10-grid { display:grid; grid-template-columns:repeat(2,minmax(0,1fr)); gap:12px; }
    .a10-tile {
      min-height:104px; border:2px solid #eee4ff; border-radius:17px;
      background:white; padding:13px 8px; font-size:15px;
      font-weight:700; color:#352d50; box-shadow:0 2px 7px #0000000c;
    }
    .a10-tile span { display:block; font-size:30px; margin-bottom:7px; }
    .a10-panel {
      background:white; border-radius:17px; padding:16px;
      box-shadow:0 2px 10px #00000012;
    }
    .a10-panel h2 { color:#5538b5; margin-top:0; }
    .a10-panel button, .a10-action {
      border:0; border-radius:11px; padding:11px 14px; margin:5px 4px 5px 0;
      background:#eee8ff; color:#3d2c78; font-weight:700; font-size:15px;
    }
    .a10-choice { display:inline-block; min-width:54px; margin:6px; padding:14px;
      border:2px solid #ddd; border-radius:12px; background:#fff; font-size:23px; }
    .a10-good { background:#dff6df!important; border-color:#43a047!important; }
    .a10-muted { color:#625d70; line-height:1.5; }
    .a10-row { display:flex; flex-wrap:wrap; gap:8px; align-items:center; }
    .a10-routine label { display:block; padding:10px; margin:7px 0;
      background:#f7f3ff; border-radius:10px; }
    #aadhiVoiceOpen {
      position:fixed; right:14px; bottom:18px; z-index:99992;
      border:0; border-radius:28px; padding:13px 17px;
      background:#e65b35; color:white; font-size:15px; font-weight:700;
      box-shadow:0 4px 14px #0003;
    }
    #aadhiVoiceChat {
      display:none; position:fixed; z-index:99999; left:12px; right:12px;
      bottom:76px; max-width:520px; margin:auto; padding:16px;
      border-radius:18px; background:#fff; color:#302b43;
      box-shadow:0 5px 25px #0005; font-family:Arial,sans-serif;
    }
    #aadhiVoiceChat h3 { margin:0 0 10px; color:#5538b5; }
    #aadhiVoiceChat select, #aadhiVoiceChat button {
      padding:10px; border-radius:9px; border:1px solid #ddd; margin:4px;
    }
    #aadhiMicButton { background:#e65b35; color:white; border:0!important; font-weight:bold; }
    #aadhiVoiceStatus { color:#625d70; font-size:13px; }
    #aadhiVoiceHeard { min-height:24px; overflow-wrap:anywhere; }
    @media(max-width:360px) {
      .a10-grid { gap:8px; }
      .a10-tile { font-size:13px; }
    }
  `;
  document.head.appendChild(style);

  const launch = document.createElement('button');
  launch.id = 'aadhi10-launch';
  launch.type = 'button';
  launch.textContent = '✨ Aadhi AI';
  document.body.appendChild(launch);

  const overlay = document.createElement('div');
  overlay.id = 'aadhi10-overlay';
  overlay.innerHTML = `
    <div id="aadhi10-header">
      <strong>✨ Aadhi AI - Learn & Play</strong>
      <button id="a10-close" type="button">✕ Close</button>
    </div>
    <main id="aadhi10-content"></main>
  `;
  document.body.appendChild(overlay);

  const content = overlay.querySelector('#aadhi10-content');
const close = overlay.querySelector('#a10-close');
  const featureNames = [
    ['💬', 'Talk to Aadhi'],
    ['🎤', 'Voice Practice'],
    ['🧩', 'Puzzle Games'],
    ['🎨', 'Drawing & Colouring'],
    ['👨‍👩‍👧', 'Parent Dashboard'],
    ['🔬', 'Little Scientist'],
    ['📅', 'Daily Routine'],
    ['🛡️', 'Safety School'],
    ['🏆', 'Reward Badges'],
    ['📖', 'Stories & Rhymes'],
    ['📅', 'Calendar']
];

  function home() {
    content.innerHTML = `
      <section class="a10-welcome">
        <h2>Hello, little learner! 🌈</h2>
        <p>Learn, play, speak and grow with Aadhi.</p>
        <p>⭐ ${progress.stars} stars &nbsp; 🎮 ${progress.games} games played</p>
      </section>
      <div class="a10-grid">
        ${featureNames.map((item, i) => `
          <button class="a10-tile" type="button" data-feature="${i}">
            <span>${item[0]}</span>${item[1]}
          </button>`).join('')}
      </div>
    `;
    content.querySelectorAll('[data-feature]').forEach(button => {
      button.addEventListener('click', () => openFeature(Number(button.dataset.feature)));
    });
  }

  function panel(title, html) {
    content.innerHTML = `
      <section class="a10-panel">
        <button class="a10-back" id="a10-back" type="button">← Back</button>
        <h2>${title}</h2>
        ${html}
      </section>`;
    content.querySelector('#a10-back').addEventListener('click', home);
  }

  function earnStar() {
    progress.stars += 1;
    if (progress.stars >= 5 && !progress.badges.includes('Super Star')) {
      progress.badges.push('Super Star');
    }
    saveProgress();
  }

  function openFeature(index) {
    switch (index) {
      case 0:
        panel('💬 Talk to Aadhi', `
          <p>Choose a question and talk with Aadhi!</p>
          <button data-talk="What is your name?">What is your name?</button>
          <button data-talk="Tell me a fun fact.">Tell me a fun fact.</button>
          <button data-talk="Teach me a new word.">Teach me a new word.</button>
          <button data-talk="வணக்கம்! எப்படி இருக்கிறாய்?">வணக்கம்!</button>
          <p id="a10-talk-reply" class="a10-muted">I am ready to learn with you!</p>
        `);
        content.querySelectorAll('[data-talk]').forEach(button => {
          button.addEventListener('click', () => {
            const q = button.dataset.talk;
            const reply = q.includes('வணக்கம்') ? 'வணக்கம்! நான் நன்றாக இருக்கிறேன். நீ எப்படி இருக்கிறாய்?' :
              q.includes('name') ? 'I am Aadhi, your learning friend!' :
              q.includes('fact') ? 'A butterfly tastes with its feet!' :
              'Today’s word is curious. Curious means wanting to learn!';
            content.querySelector('#a10-talk-reply').textContent = reply;
            speak(reply, q.includes('வணக்கம்') ? 'ta' : 'en');
          });
        });
        break;

      case 1:
        panel('🎤 Voice Practice', `
          <p>Practise saying these words aloud.</p>
          <div class="a10-row">
            ${['Apple 🍎', 'Ball ⚽', 'Cat 🐱', 'நிலா 🌙', 'அம்மா ❤️'].map(word =>
              `<button data-word="${escapeHTML(word)}">${escapeHTML(word)}</button>`).join('')}
          </div>
          <p class="a10-muted">Tap a word to hear Aadhi say it.</p>
        `);
        content.querySelectorAll('[data-word]').forEach(button => {
          button.addEventListener('click', () => {
            const word = button.dataset.word;
            speak(word, /[அ-ஹ]/.test(word) ? 'ta' : 'en');
          });
        });
        break;

      case 2:
        puzzle();
        break;

      case 3:
        drawing();
        break;

      case 4:
        panel('👨‍👩‍👧 Parent Dashboard', `
          <p>Learning progress at a glance.</p>
          <h3>⭐ Stars earned: ${progress.stars}</h3>
          <h3>🎮 Games played: ${progress.games}</h3>
          <h3>🏅 Badges: ${progress.badges.length ? progress.badges.map(escapeHTML).join(', ') : 'Keep learning to earn badges!'}</h3>
          <p class="a10-muted">Progress is saved on this device.</p>
        `);
        break;

      case 5:
        panel('🔬 Little Scientist', `
          <p><b>Did you know?</b></p>
          <p id="a10-science-fact">Plants need sunlight, water and air to grow. 🌱</p>
          <button id="a10-next-fact">Another fun fact</button>
        `);
        {
          const facts = [
            'The Earth moves around the Sun. 🌍',
            'A rainbow has many beautiful colours. 🌈',
            'The Moon reflects light from the Sun. 🌙',
            'Some butterflies taste with their feet. 🦋',
            'Water can be liquid, ice or vapour. 💧'
          ];
          let factIndex = 0;
          content.querySelector('#a10-next-fact').addEventListener('click', () => {
            content.querySelector('#a10-science-fact').textContent = facts[factIndex++ % facts.length];
          });
        }
        break;

      case 6:
        routine();
        break;

      case 7:
        panel('🛡️ Safety School', `
          <p><b>Remember these safety rules:</b></p>
          <ul>
            <li>Stay close to a trusted grown-up outside.</li>
            <li>Never share your name, address or phone number with strangers online.</li>
            <li>Do not touch fire, medicines or sharp objects.</li>
            <li>If you feel unsafe, tell a trusted grown-up.</li>
            <li>Never go anywhere with someone without your grown-up’s permission.</li>
          </ul>
          <p class="a10-muted">You can always ask a trusted grown-up for help.</p>
        `);
        break;

      case 8:
        panel('🏆 Reward Badges', `
          <h3>⭐ Stars: ${progress.stars}</h3>
          <p>${progress.stars >= 1 ? '🌟 First Star earned!' : 'Earn your first star by playing a game.'}</p>
          <p>${progress.stars >= 5 ? '🏅 Super Star badge earned!' : 'Earn 5 stars to unlock Super Star.'}</p>
          <p><b>Your badges:</b> ${progress.badges.length ? progress.badges.map(escapeHTML).join(', ') : 'No badges yet'}</p>
        `);
        break;

            case 9:
        stories();
        break;

      case 10:
        calendar();
        break;
    }
  }

    function calendar() {
    const today = new Date();
    let shownMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    let selectedDate = new Date(today.getFullYear(), today.getMonth(), today.getDate());

    const specialDays = {
      '01-01': "🎉 New Year's Day",
      '01-14': '🌾 Pongal celebrations',
      '01-15': '🐄 Mattu Pongal',
      '01-16': '👨‍👩‍👧 Kaanum Pongal',
      '01-26': '🇮🇳 Republic Day',
      '02-14': '❤️ Valentine’s Day',
      '03-08': '👩 International Women’s Day',
      '04-14': '🌸 Tamil New Year',
      '04-22': '🌍 Earth Day',
      '05-01': '👷 Labour Day',
      '06-05': '🌱 World Environment Day',
      '06-21': '🧘 International Yoga Day',
      '07-11': '👨‍👩‍👧 World Population Day',
      '08-15': '🇮🇳 Independence Day',
      '09-05': '👩‍🏫 Teachers’ Day (India)',
      '09-16': '🌿 World Ozone Day',
      '10-02': '🕊️ Gandhi Jayanti',
      '10-16': '🍎 World Food Day',
      '11-14': '👶 Children’s Day (India)',
      '12-25': '🎄 Christmas Day'
    };

    function dateKey(date) {
      return String(date.getMonth() + 1).padStart(2, '0') + '-' +
        String(date.getDate()).padStart(2, '0');
    }

    function renderCalendar() {
      const year = shownMonth.getFullYear();
      const month = shownMonth.getMonth();
      const firstDay = new Date(year, month, 1).getDay();
      const daysInMonth = new Date(year, month + 1, 0).getDate();
      const monthName = shownMonth.toLocaleString('en-IN', {
        month: 'long',
        year: 'numeric'
      });

      let cells = '';
      for (let i = 0; i < firstDay; i++) {
        cells += '<div></div>';
      }

      for (let day = 1; day <= daysInMonth; day++) {
        const date = new Date(year, month, day);
        const key = dateKey(date);
        const isToday = date.toDateString() === today.toDateString();
        const isSelected = date.toDateString() === selectedDate.toDateString();
        const hasEvent = !!specialDays[key];

        cells += `
          <button type="button" data-cal-day="${day}"
            style="padding:9px 2px;border-radius:10px;border:2px solid ${isSelected ? '#6c4bd8' : 'transparent'};
            background:${isToday ? '#6c4bd8' : '#fff'};
            color:${isToday ? '#fff' : '#302b43'};
            font-weight:${isToday || hasEvent ? 'bold' : 'normal'};
            min-height:40px;position:relative;">
            ${day}${hasEvent ? '<span style="color:#e65b35">•</span>' : ''}
          </button>`;
      }

      const selectedKey = dateKey(selectedDate);
      const selectedEvent = specialDays[selectedKey] || '🌈 No special event listed. Make today wonderful!';

      content.innerHTML = `
        <section class="a10-panel">
          <button class="a10-back" id="a10-back" type="button">← Back</button>
          <h2>📅 My Calendar</h2>
          <p style="text-align:center;font-size:18px;font-weight:bold;">
            Today: ${today.toLocaleDateString('en-IN', {
              day: 'numeric', month: 'long', year: 'numeric'
            })}
          </p>
          <div class="a10-row" style="justify-content:space-between">
            <button id="cal-prev" type="button">◀</button>
            <strong>${monthName}</strong>
            <button id="cal-next" type="button">▶</button>
          </div>
          <div style="display:grid;grid-template-columns:repeat(7,1fr);text-align:center;gap:3px;margin-top:12px;">
            ${['Sun','Mon','Tue','Wed','Thu','Fri','Sat'].map(d =>
              `<strong style="font-size:12px;padding:5px 0">${d}</strong>`).join('')}
            ${cells}
          </div>
          <div style="background:#f7f3ff;border-radius:12px;padding:12px;margin-top:14px;">
            <h3>📌 ${selectedDate.toLocaleDateString('en-IN', {
              day:'numeric', month:'long', year:'numeric'
            })}</h3>
            <p>${selectedEvent}</p>
          </div>
          <h3>🌟 Important Days</h3>
          <div class="a10-muted">
            ${Object.entries(specialDays)
              .filter(([key]) => {
                const [m, d] = key.split('-').map(Number);
                return new Date(year, m - 1, d) >= new Date(year, month, 1) &&
                       new Date(year, m - 1, d) <= new Date(year, month + 1, 0);
              })
              .map(([key, event]) => {
                const [m, d] = key.split('-').map(Number);
                return `<p>📅 ${d}/${m} — ${event}</p>`;
              }).join('') || '<p>No listed special days this month.</p>'}
          </div>
          <p style="font-size:12px;color:#777">🟣 Today &nbsp; 🟠 Special day</p>
        </section>`;

      content.querySelector('#a10-back').addEventListener('click', home);
      content.querySelector('#cal-prev').addEventListener('click', () => {
        shownMonth = new Date(year, month - 1, 1);
        renderCalendar();
      });
      content.querySelector('#cal-next').addEventListener('click', () => {
        shownMonth = new Date(year, month + 1, 1);
        renderCalendar();
      });
      content.querySelectorAll('[data-cal-day]').forEach(button => {
        button.addEventListener('click', () => {
          selectedDate = new Date(year, month, Number(button.dataset.calDay));
          renderCalendar();
        });
      });
    }

    renderCalendar();
  }
function puzzle() {
    const questions = [
      { q: 'Which one is a fruit?', choices: ['🍎 Apple', '🚗 Car', '⚽ Ball'], answer: 0 },
      { q: 'Which animal says meow?', choices: ['🐶 Dog', '🐱 Cat', '🐮 Cow'], answer: 1 },
      { q: 'How many stars are here? ⭐ ⭐ ⭐', choices: ['2', '3', '4'], answer: 1 },
      { q: 'Which is a colour?', choices: ['🔵 Blue', '🍞 Bread', '🐟 Fish'], answer: 0 }
    ];
    let current = 0;
    function render() {
      const item = questions[current];
      panel('🧩 Puzzle Games', `
        <p>Question ${current + 1} of ${questions.length}</p>
        <h3>${item.q}</h3>
        <div>${item.choices.map((choice, i) =>
          `<button class="a10-choice" data-answer="${i}">${choice}</button>`).join('')}</div>
        <p id="a10-puzzle-result" aria-live="polite"></p>
      `);
      content.querySelectorAll('[data-answer]').forEach(button => {
        button.addEventListener('click', () => {
          const result = content.querySelector('#a10-puzzle-result');
          if (Number(button.dataset.answer) === item.answer) {
            result.textContent = 'Correct! Well done! ⭐';
            button.classList.add('a10-good');
            earnStar();
            progress.games += 1;
            saveProgress();
            content.querySelectorAll('[data-answer]').forEach(b => b.disabled = true);
            const next = document.createElement('button');
            next.textContent = current === questions.length - 1 ? 'Finish' : 'Next question';
            next.addEventListener('click', () => {
              if (current < questions.length - 1) { current++; render(); }
              else {
                panel('🎉 Great work!', `<p>You finished the puzzle! ⭐</p><button id="a10-again">Play again</button>`);
                content.querySelector('#a10-again').addEventListener('click', () => { current = 0; render(); });
              }
            });
            content.querySelector('.a10-panel').appendChild(next);
            speak('Correct! Well done!', 'en');
          } else {
            result.textContent = 'Try again! You can do it!';
            speak('Try again. You can do it!', 'en');
          }
        });
      });
    }
    render();
  }

  function drawing() {
    panel('🎨 Drawing & Colouring', `
      <p>Choose a colour and draw with your finger.</p>
      <div class="a10-row">
        ${['#e53935','#ff9800','#fdd835','#43a047','#1e88e5','#8e24aa','#222222','#ffffff'].map(col =>
          `<button type="button" data-colour="${col}" aria-label="Choose ${col}" style="width:36px;height:36px;padding:0;background:${col};border:2px solid #aaa"></button>`).join('')}
      </div>
      <canvas id="a10-canvas" width="700" height="360" style="width:100%;height:260px;border:2px solid #ddd;border-radius:10px;touch-action:none;background:white"></canvas>
      <p><button id="a10-clear">Clear drawing</button></p>
    `);
    const canvas = content.querySelector('#a10-canvas');
    const ctx = canvas.getContext('2d');
    let colour = '#e53935';
    let drawingNow = false;
    let last = null;
    function point(event) {
      const rect = canvas.getBoundingClientRect();
      return {
        x: (event.clientX - rect.left) * canvas.width / rect.width,
        y: (event.clientY - rect.top) * canvas.height / rect.height
      };
    }
    canvas.addEventListener('pointerdown', event => {
      drawingNow = true;
      last = point(event);
      canvas.setPointerCapture(event.pointerId);
    });
    canvas.addEventListener('pointermove', event => {
      if (!drawingNow) return;
      const p = point(event);
      ctx.strokeStyle = colour;
      ctx.lineWidth = 8;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(last.x, last.y);
      ctx.lineTo(p.x, p.y);
      ctx.stroke();
      last = p;
    });
    ['pointerup','pointercancel','lostpointercapture'].forEach(name =>
      canvas.addEventListener(name, () => { drawingNow = false; last = null; }));
    content.querySelectorAll('[data-colour]').forEach(button =>
      button.addEventListener('click', () => { colour = button.dataset.colour; }));
    content.querySelector('#a10-clear').addEventListener('click', () =>
      ctx.clearRect(0, 0, canvas.width, canvas.height));
  }

    function routine() {
    const tasks = [
      ['wake', 'Wake up and smile ☀️'],
      ['brush', 'Brush my teeth 🪥'],
      ['breakfast', 'Eat breakfast 🍎'],
      ['learn', 'Learn something new 📚'],
      ['play', 'Play and exercise ⚽'],
      ['sleep', 'Get ready for bed 🌙']
    ];

    // Automatically get today's date from the device
    const today = new Date();
    const todayText = today.toLocaleDateString('en-IN', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });

    panel('📅 Daily Routine', `
      <p style="text-align:center;font-weight:bold;color:#5538b5;font-size:17px;">
        📆 ${todayText}
      </p>
      <p>Tick each activity when you finish it.</p>
      <div class="a10-routine">
        ${tasks.map(([id, label]) =>
          `<label><input type="checkbox" data-routine="${id}" ${progress.routine[id] ? 'checked' : ''}> ${label}</label>`).join('')}
      </div>
      <p id="a10-routine-result">${tasks.filter(([id]) => progress.routine[id]).length} activities completed. Great job!</p>
    `);

    content.querySelectorAll('[data-routine]').forEach(box => {
      box.addEventListener('change', () => {
        progress.routine[box.dataset.routine] = box.checked;
        saveProgress();

        const done = tasks.filter(([id]) => progress.routine[id]).length;
        content.querySelector('#a10-routine-result').textContent =
          done + ' of ' + tasks.length + ' activities completed. Great job!';

        if (done === tasks.length) {
          earnStar();
          content.querySelector('#a10-routine-result').textContent += ' ⭐ You earned a star!';
        }
      });
    });
  }

  function stories() {
    const items = [
      {
        title: 'The Kind Little Rabbit 🐰',
        text: 'A little rabbit saw a thirsty bird. The rabbit found a small cup of water and shared it. The bird was happy. The rabbit learned that kindness makes everyone smile.'
      },
      {
        title: 'The Bright Sun ☀️',
        text: 'The Sun rose in the morning and warmed the garden. The flowers opened their petals. The bees began to buzz. It was a beautiful new day.'
      },
      {
        title: 'குட்டி யானை 🐘',
        text: 'ஒரு குட்டி யானை காட்டில் வாழ்ந்து வந்தது. அது தன் நண்பர்களுக்கு உதவி செய்தது. எல்லோரும் மகிழ்ச்சியாக இருந்தார்கள். உதவி செய்வது நல்ல பழக்கம்.'
      }
    ];
    let index = 0;
    function render() {
      const story = items[index];
      panel('📖 Stories & Rhymes', `
        <h3>${story.title}</h3>
        <p style="line-height:1.8">${story.text}</p>
        <button id="a10-read-story">🔊 Read aloud</button>
        <button id="a10-next-story">Next story</button>
      `);
      content.querySelector('#a10-read-story').addEventListener('click', () =>
        speak(story.text, /[அ-ஹ]/.test(story.text) ? 'ta' : 'en'));
      content.querySelector('#a10-next-story').addEventListener('click', () => {
        index = (index + 1) % items.length;
        render();
      });
    }
    render();
  }

  launch.addEventListener('click', () => {
    overlay.style.display = 'flex';
    home();
  });

  close.addEventListener('click', () => {
    overlay.style.display = 'none';
  });

  overlay.addEventListener('click', event => {
    if (event.target === overlay) overlay.style.display = 'none';
  });

  // Separate Talk to Aadhi voice button
  const voiceButton = document.createElement('button');
  voiceButton.id = 'aadhiVoiceOpen';
  voiceButton.textContent = '🎤 Talk to Aadhi';
  voiceButton.style.cssText =
    'position:fixed;bottom:18px;left:14px;z-index:99998;padding:12px 16px;border:0;border-radius:25px;background:#e53935;color:white;font-weight:bold;box-shadow:0 3px 12px #0003;';
  document.body.appendChild(voiceButton);

  const voicePanel = document.createElement('div');
  voicePanel.id = 'aadhiVoiceChat';
  voicePanel.style.cssText =
    'display:none;position:fixed;z-index:99999;left:12px;right:12px;bottom:75px;max-width:440px;margin:auto;background:#fff;border:2px solid #e53935;border-radius:18px;padding:16px;box-shadow:0 5px 25px #0004;color:#333;max-height:70vh;overflow:auto;';
  voicePanel.innerHTML = `
    <h3 style="margin-top:0">🎤 Talk to Aadhi</h3>
    <p>Choose your language and tap Listen.</p>
    <div style="display:flex;gap:8px;flex-wrap:wrap">
      <button id="aadhiVoiceEnglish">English</button>
      <button id="aadhiVoiceTamil">தமிழ்</button>
    </div>
    <p id="aadhiVoiceStatus">Ready to listen!</p>
    <p id="aadhiVoiceHeard" style="word-wrap:break-word"></p>
    <button id="aadhiVoiceListen">🎙️ Listen</button>
    <button id="aadhiVoiceStop">Stop</button>
    <button id="aadhiVoiceClose">Close</button>
  `;
  document.body.appendChild(voicePanel);

  let voiceLanguage = 'en-IN';

  voiceButton.addEventListener('click', () => {
    voicePanel.style.display = 'block';
  });

  voicePanel.querySelector('#aadhiVoiceClose').addEventListener('click', () => {
    if (window.AadhiVoice && window.AadhiVoice.cancelListen) {
      window.AadhiVoice.cancelListen();
    }
    voicePanel.style.display = 'none';
  });

  voicePanel.querySelector('#aadhiVoiceEnglish').addEventListener('click', () => {
    voiceLanguage = 'en-IN';
    voicePanel.querySelector('#aadhiVoiceStatus').textContent = 'English selected. Tap Listen!';
  });

  voicePanel.querySelector('#aadhiVoiceTamil').addEventListener('click', () => {
    voiceLanguage = 'ta-IN';
    voicePanel.querySelector('#aadhiVoiceStatus').textContent = 'தமிழ் தேர்வு செய்யப்பட்டது. Listen அழுத்தவும்!';
  });

  voicePanel.querySelector('#aadhiVoiceListen').addEventListener('click', () => {
    if (window.AadhiVoice && window.AadhiVoice.listen) {
      voicePanel.querySelector('#aadhiVoiceStatus').textContent = 'Listening... பேசுங்கள்!';
      window.AadhiVoice.listen(voiceLanguage);
    } else {
      voicePanel.querySelector('#aadhiVoiceStatus').textContent =
        'Voice service is unavailable. Please check the app.';
    }
  });

  voicePanel.querySelector('#aadhiVoiceStop').addEventListener('click', () => {
    if (window.AadhiVoice && window.AadhiVoice.cancelListen) {
      window.AadhiVoice.cancelListen();
    }
    voicePanel.querySelector('#aadhiVoiceStatus').textContent = 'Stopped.';
  });

  window.onAadhiSpeechStatus = function(status) {
    const el = document.getElementById('aadhiVoiceStatus');
    if (el) el.textContent = status;
  };

  window.onAadhiSpeechError = function(error) {
    const el = document.getElementById('aadhiVoiceStatus');
    if (el) el.textContent = 'Voice error: ' + error;
  };

  window.onAadhiSpeechResult = function(text) {
    const heard = document.getElementById('aadhiVoiceHeard');
    const status = document.getElementById('aadhiVoiceStatus');
    if (heard) heard.textContent = 'You said: ' + text;
    if (status) {
      const tamil = /[அ-ஹ]/.test(text);
      let reply = tamil
        ? 'வணக்கம்! நன்றாக பேசினீர்கள்! மீண்டும் பேசலாமா?'
        : 'Hello! Well done! I am happy to talk with you!';
      status.textContent = reply;
      speak(reply, tamil ? 'ta' : 'en');
    }
  };

})();
