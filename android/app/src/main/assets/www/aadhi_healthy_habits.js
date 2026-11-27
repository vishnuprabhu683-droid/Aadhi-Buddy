
/* Aadhi AI - Healthy Habits & My Day
   Ages 2-8 | Tamil + English | Offline storage
*/
(function () {
  'use strict';

  if (window.__aadhiHealthyLoaded) return;
  window.__aadhiHealthyLoaded = true;

  const KEY = 'aadhi_healthy_v1';

  const defaults = {
    age: '3-5',
    language: 'en',
    wake: '06:30',
    bed: '20:00',
    screenLimit: 60,
    breakMinutes: 10,
    reminders: true,
    records: {}
  };

  function load() {
    try {
      return Object.assign({}, defaults,
        JSON.parse(localStorage.getItem(KEY) || '{}'));
    } catch (e) {
      return Object.assign({}, defaults);
    }
  }

  let settings = load();

  function save() {
    localStorage.setItem(KEY, JSON.stringify(settings));
  }

  function today() {
    const d = new Date();
    return d.getFullYear() + '-' +
      String(d.getMonth() + 1).padStart(2, '0') + '-' +
      String(d.getDate()).padStart(2, '0');
  }

  function record() {
    const day = today();
    if (!settings.records[day]) {
      settings.records[day] = {
        mood: '',
        tv: 0,
        mobile: 0,
        play: 0,
        water: false,
        fruit: false,
        teeth: false,
        hands: false,
        happy: '',
        stars: []
      };
    }
    return settings.records[day];
  }

  function speak(text) {
    if (window.AadhiVoice &&
        typeof window.AadhiVoice.speak === 'function') {
      window.AadhiVoice.speak(
        text, settings.language === 'ta' ? 'ta' : 'en'
      );
    }
  }

  const tamil = {
    title: 'என் நாள் - ஆதி AI',
    day: 'இன்று உன் நாள் எப்படி இருந்தது?',
    mood: 'இன்று உனக்கு எப்படி இருந்தது?',
    happy: 'இன்று உன்னை மகிழ்ச்சியாக்கியது எது?',
    tv: 'இன்று எவ்வளவு நேரம் TV பார்த்தாய்? (நிமிடங்கள்)',
    mobile: 'இன்று எவ்வளவு நேரம் மொபைல் பயன்படுத்தினாய்? (நிமிடங்கள்)',
    play: 'இன்று எவ்வளவு நேரம் விளையாடினாய்? (நிமிடங்கள்)',
    water: 'இன்று தண்ணீர் குடித்தாயா?',
    fruit: 'பழங்கள் அல்லது காய்கறிகள் சாப்பிட்டாயா?',
    teeth: 'பல் துலக்கினாயா?',
    hands: 'கைகளை கழுவினாயா?',
    save: 'இன்றைய பதிவை சேமி',
    stars: 'எனது நல்ல பழக்க நட்சத்திரங்கள்',
    parent: 'பெற்றோர் அமைப்புகள்',
    good: 'மிகவும் அருமை! இன்று நன்றாக முயற்சி செய்தாய்!',
    break: 'திரையிலிருந்து சிறிது ஓய்வு எடுத்து விளையாடலாமா?',
    waterMsg: 'கொஞ்சம் தண்ணீர் குடிக்கலாமா?'
  };

  const english = {
    title: 'My Day with Aadhi',
    day: 'How was your day today?',
    mood: 'How are you feeling today?',
    happy: 'What made you happy today?',
    tv: 'How many minutes did you watch TV today?',
    mobile: 'How many minutes did you use a mobile or tablet?',
    play: 'How many minutes did you play today?',
    water: 'Did you drink water today?',
    fruit: 'Did you eat fruits or vegetables?',
    teeth: 'Did you brush your teeth?',
    hands: 'Did you wash your hands?',
    save: 'Save today’s check-in',
    stars: 'My Good Habit Stars',
    parent: 'Parent Settings',
    good: 'Wonderful! You did your best today!',
    break: 'Let’s take a screen break and play!',
    waterMsg: 'Would you like some water?'
  };

  function words() {
    return settings.language === 'ta' ? tamil : english;
  }

  const style = document.createElement('style');
  style.textContent = `
    #ah-launch {
      position:fixed; right:14px; bottom:145px; z-index:99990;
      border:0; border-radius:30px; padding:13px 17px;
      background:#8054d9; color:white; font-weight:bold;
      box-shadow:0 3px 12px #0003;
    }
    #ah-overlay {
      display:none; position:fixed; inset:0; z-index:999999;
      background:#fff8ed; overflow:auto; padding:15px;
      box-sizing:border-box; color:#333;
      font-family:Arial,sans-serif;
    }
    #ah-overlay * { box-sizing:border-box; }
    #ah-overlay h2 { color:#7045bd; }
    #ah-overlay button, #ah-overlay select,
    #ah-overlay input, #ah-overlay textarea {
      font-size:16px; padding:10px; border-radius:12px;
      border:1px solid #ddd; max-width:100%;
    }
    #ah-overlay button {
      background:#8054d9; color:white; border:0;
      font-weight:bold; margin:4px 2px;
    }
    #ah-overlay .ah-card {
      background:white; border-radius:16px;
      padding:13px; margin:12px 0;
      box-shadow:0 2px 8px #0001;
    }
    #ah-overlay label { display:block; margin:9px 0; }
    #ah-overlay input[type=number],
    #ah-overlay input[type=time] { width:100%; }
    #ah-overlay textarea { width:100%; min-height:65px; }
    #ah-overlay .ah-close { float:right; background:#e65b35; }
    #ah-overlay .ah-small { font-size:13px; color:#666; }
  `;
  document.head.appendChild(style);

  const launch = document.createElement('button');
  launch.id = 'ah-launch';
  launch.textContent = '🌈 My Day';
  document.body.appendChild(launch);

  const overlay = document.createElement('div');
  overlay.id = 'ah-overlay';
  document.body.appendChild(overlay);

  function open() {
    render();
    overlay.style.display = 'block';
  }

  function close() {
    overlay.style.display = 'none';
  }

  launch.addEventListener('click', open);

  function question(id, label, value, type) {
    return `
      <label>${label}
        <input id="${id}" type="${type || 'text'}"
          value="${value || ''}" />
      </label>`;
  }

  function getDailySchedule() {
    const schedules = {
      '2-3': [
        ['6:30 AM', '🌞 Wake up and wash'],
        ['7:30 AM', '🥣 Healthy breakfast'],
        ['8:30 AM', '🧸 Free play and toys'],
        ['9:30 AM', '⚽ Outdoor active play'],
        ['10:30 AM', '🍎 Fruit snack and water'],
        ['11:00 AM', '🎨 Drawing, music and stories'],
        ['12:00 PM', '🍚 Lunch'],
        ['12:30 PM', '😴 Nap and quiet rest'],
        ['2:30 PM', '🥛 Wake up and snack'],
        ['3:30 PM', '🌳 Outdoor family play'],
        ['5:30 PM', '🧩 Calm indoor play'],
        ['6:30 PM', '🍲 Dinner'],
        ['7:00 PM', '🪥 Bath and brushing'],
        ['7:30 PM', '🌙 Bedtime routine']
      ],
      '4-5': [
        ['6:30 AM', '🌞 Wake up and get ready'],
        ['7:30 AM', '🥣 Breakfast'],
        ['8:30 AM', '📚 Preschool learning'],
        ['9:30 AM', '⚽ Outdoor active play'],
        ['10:30 AM', '🍎 Snack and water'],
        ['11:00 AM', '🎨 Art, music and creativity'],
        ['12:30 PM', '🍚 Lunch'],
        ['1:00 PM', '😴 Nap or quiet rest'],
        ['2:30 PM', '🧸 Free play'],
        ['4:00 PM', '🚴 Outdoor physical activity'],
        ['5:30 PM', '📖 Stories and family time'],
        ['6:30 PM', '🍲 Dinner'],
        ['7:00 PM', '🪥 Brush teeth and get ready'],
        ['8:00 PM', '🌙 Bedtime']
      ],
      '6-8': [
        ['6:30 AM', '🌞 Wake up and get ready'],
        ['7:00 AM', '🪥 Brush teeth and breakfast'],
        ['8:00 AM', '🎒 School or learning time'],
        ['10:30 AM', '🍎 Snack and water'],
        ['12:30 PM', '🍚 Lunch'],
        ['1:30 PM', '📚 School or reading'],
        ['3:30 PM', '🥛 Snack and relaxation'],
        ['4:00 PM', '⚽ Outdoor play and exercise'],
        ['5:30 PM', '✏️ Homework or creative activity'],
        ['6:30 PM', '🧸 Free play with family'],
        ['7:00 PM', '🍲 Dinner'],
        ['7:30 PM', '🪥 Brush teeth and bedtime routine'],
        ['8:30 PM', '🌙 Bedtime']
      ]
    };

    return schedules[settings.age] || schedules['4-5'];
  }

  function renderDailySchedule() {
    const schedule = getDailySchedule();

    return `
      <div class="ah-card">
        <h3>🕒 My Daily Routine</h3>
        <p>Follow your day with Aadhi!</p>
        ${schedule.map(item => `
          <div style="padding:10px;margin:6px 0;
            background:#f3efff;border-radius:12px;">
            <strong>${item[0]}</strong>
            <div>${item[1]}</div>
          </div>
        `).join('')}
        <p class="ah-small">
          Sample routine. Parents can adjust timings
          for school, family and individual needs.
        </p>
      </div>
    `;
  }


  function render() {
    const w = words();
    const r = record();

    overlay.innerHTML = `
      <button class="ah-close" id="ah-close">✕ Close</button>
      <h2>🌈 ${w.title}</h2>
      <p>${w.day}</p>
${renderDailySchedule()}

      <div class="ah-card">
        <h3>😊 ${w.mood}</h3>
        <select id="ah-mood">
          <option value="">Choose</option>
          <option value="Happy">😊 Happy</option>
          <option value="Okay">🙂 Okay</option>
          <option value="Sad">😢 Sad</option>
          <option value="Angry">😠 Angry</option>
          <option value="Excited">🤩 Excited</option>
        </select>
        <p>${w.happy}</p>
        <textarea id="ah-happy">${r.happy || ''}</textarea>
      </div>

      <div class="ah-card">
        <h3>📺 Screen Time</h3>
        ${question('ah-tv', w.tv, r.tv, 'number')}
        ${question('ah-mobile', w.mobile, r.mobile, 'number')}
        <p class="ah-small">
          Enter approximate minutes. Parents can help younger children.
        </p>
      </div>

      <div class="ah-card">
        <h3>⚽ Play Time</h3>
        ${question('ah-play', w.play, r.play, 'number')}
      </div>

      <div class="ah-card">
        <h3>⭐ ${w.stars}</h3>
        <label><input type="checkbox" id="ah-water"
          ${r.water ? 'checked' : ''}/> 💧 ${w.water}</label>
        <label><input type="checkbox" id="ah-fruit"
          ${r.fruit ? 'checked' : ''}/> 🍎 ${w.fruit}</label>
        <label><input type="checkbox" id="ah-teeth"
          ${r.teeth ? 'checked' : ''}/> 🪥 ${w.teeth}</label>
        <label><input type="checkbox" id="ah-hands"
          ${r.hands ? 'checked' : ''}/> 🧼 ${w.hands}</label>
        <p id="ah-stars">⭐ ${r.stars.length} stars today</p>
      </div>

      <button id="ah-save">${w.save}</button>
      <button id="ah-parent">⚙️ ${w.parent}</button>
      <p class="ah-small">
        This is a family check-in, not a medical assessment.
      </p>
    `;

    document.getElementById('ah-close').onclick = close;
    document.getElementById('ah-save').onclick = saveCheckin;
    document.getElementById('ah-parent').onclick = parentSettings;

    document.getElementById('ah-mood').value = r.mood;
  }

  function saveCheckin() {
    const r = record();
    const oldStars = r.stars.length;

    r.mood = document.getElementById('ah-mood').value;
    r.happy = document.getElementById('ah-happy').value;
    r.tv = Math.max(0, Number(document.getElementById('ah-tv').value) || 0);
    r.mobile = Math.max(0, Number(document.getElementById('ah-mobile').value) || 0);
    r.play = Math.max(0, Number(document.getElementById('ah-play').value) || 0);
    r.water = document.getElementById('ah-water').checked;
    r.fruit = document.getElementById('ah-fruit').checked;
    r.teeth = document.getElementById('ah-teeth').checked;
    r.hands = document.getElementById('ah-hands').checked;

    r.stars = [
      r.water, r.fruit, r.teeth, r.hands
    ].filter(Boolean);

    save();
    render();

    const message = words().good;
    speak(message);
    alert(message);
  }

  function parentSettings() {
    overlay.innerHTML = `
      <button class="ah-close" id="ah-back">← Back</button>
      <h2>⚙️ Parent Settings</h2>

      <div class="ah-card">
        <h3>Child's age group</h3>
        <select id="ah-age">
          <option value="2-3">2–3 years</option>
          <option value="4-5">4–5 years</option>
          <option value="6-8">6–8 years</option>
        </select>

        <h3>Language</h3>
        <select id="ah-language">
          <option value="en">English</option>
          <option value="ta">தமிழ்</option>
        </select>

        <h3>Daily routine</h3>
        ${question('ah-wake','Wake-up time',settings.wake,'time')}
        ${question('ah-bed','Bedtime',settings.bed,'time')}

        <h3>Screen settings</h3>
        ${question('ah-limit','Daily screen budget (minutes)',settings.screenLimit,'number')}
        ${question('ah-break','Screen break reminder (minutes)',settings.breakMinutes,'number')}

        <label>
          <input type="checkbox" id="ah-reminders"
            ${settings.reminders ? 'checked' : ''}/>
          Enable reminders while Aadhi is open
        </label>

        <button id="ah-settings-save">Save Parent Settings</button>
      </div>

      <div class="ah-card">
        <h3>Age-based guidance</h3>
        <p>2 years: 11–14 hours sleep, including naps.</p>
        <p>3–5 years: 10–13 hours sleep, including naps.</p>
        <p>6–8 years: 9–12 hours sleep.</p>
        <p>Screen guidance and activity goals should be adjusted for age.</p>
      </div>
    `;

    document.getElementById('ah-age').value = settings.age;
    document.getElementById('ah-language').value = settings.language;

    document.getElementById('ah-back').onclick = render;

    document.getElementById('ah-settings-save').onclick = function () {
      settings.age = document.getElementById('ah-age').value;
      settings.language = document.getElementById('ah-language').value;
      settings.wake = document.getElementById('ah-wake').value;
      settings.bed = document.getElementById('ah-bed').value;
      settings.screenLimit = Math.max(1,
        Number(document.getElementById('ah-limit').value) || 60);
      settings.breakMinutes = Math.max(1,
        Number(document.getElementById('ah-break').value) || 10);
      settings.reminders = document.getElementById('ah-reminders').checked;
      save();
      alert('Parent settings saved!');
      render();
    };
  }

  let lastReminder = 0;

  setInterval(function () {
    if (!settings.reminders || document.hidden) return;
    if (overlay.style.display === 'block') return;

    const now = Date.now();
    const interval = settings.breakMinutes * 60 * 1000;

    if (!lastReminder) {
      lastReminder = now;
      return;
    }

    if (now - lastReminder >= interval) {
      lastReminder = now;
      speak(words().break);
    }
  }, 30000);

  window.AadhiHealthyHabits = {
    open: open,
    close: close,
    getToday: function () {
      return JSON.parse(JSON.stringify(record()));
    },
    getSettings: function () {
      return Object.assign({}, settings);
    }
  };

  save();
})();
