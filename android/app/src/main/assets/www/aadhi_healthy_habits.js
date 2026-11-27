
/* Aadhi AI - Healthy Habits & My Day
   Ages 2-8 | Tamil + English | Offline storage
*/
(function () {
  'use strict';

  if (window.__aadhiHealthyLoaded) return;
  window.__aadhiHealthyLoaded = true;

  const KEY = 'aadhi_healthy_v1';

  const defaults = {
    age: '4-5',
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
sad: '',
helped: '',
outdoor: '',
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

  
  function renderWeeklyReport() {
    const days = [];

    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);

      const key = [
        date.getFullYear(),
        String(date.getMonth() + 1).padStart(2, '0'),
        String(date.getDate()).padStart(2, '0')
      ].join('-');

      const r = settings.records[key];

      if (r) days.push(r);
    }

    const total = days.length;

    if (!total) {
      return `
        <div class="ah-card">
          <h3>📊 My Weekly Report</h3>
          <p>Start saving daily check-ins to see your weekly report!</p>
        </div>
      `;
    }
    const helpedDays = days.filter(r => r.helped === 'Yes').length;
    const outdoorDays = days.filter(r => r.outdoor === 'Yes').length;
    const sadCheckins = days.filter(r => r.sad && r.sad.trim()).length;
    const moodCounts = {};

    days.forEach(r => {
      if (r.mood) {
        moodCounts[r.mood] = (moodCounts[r.mood] || 0) + 1;
      }
    });

    const moodSummary = Object.entries(moodCounts)
      .map(([mood, count]) => `${mood}: ${count} day(s)`)
      .join(' • ') || 'No mood check-ins yet';

    const averageTV = Math.round(
      days.reduce((sum, r) => sum + (Number(r.tv) || 0), 0) / total
    );

    const averageMobile = Math.round(
      days.reduce((sum, r) => sum + (Number(r.mobile) || 0), 0) / total
    );

    const averagePlay = Math.round(
      days.reduce((sum, r) => sum + (Number(r.play) || 0), 0) / total
    );

    const count = field =>
      days.filter(r => r[field]).length;
    const habitTotal = total * 4;
    const completedHabits =
      count('water') +
      count('fruit') +
      count('teeth') +
      count('hands');

    const progressPercent = Math.round(
      (completedHabits / habitTotal) * 100
    );

    return `
      <div class="ah-card">
        <h3>📊 My Weekly Report</h3>
        <p>Based on ${total} saved day(s) in the last 7 days.</p>
        <p>😊 Weekly mood summary: ${moodSummary}</p>
        <p>🤝 Days helped someone: ${helpedDays}</p>
        <p>🌳 Days played outdoors: ${outdoorDays}</p>
        <p>💬 Days with a sad reflection: ${sadCheckins}</p>
        <p>📺 Average TV time: ${averageTV} minutes/day</p>
        <p>📱 Average mobile time: ${averageMobile} minutes/day</p>
        <p>⚽ Average playtime: ${averagePlay} minutes/day</p>

        <p>💧 Water check-ins: ${count('water')} days</p>
        <p>🍎 Fruit check-ins: ${count('fruit')} days</p>
        <p>🪥 Teeth brushing: ${count('teeth')} days</p>
        <p>🧼 Hand washing: ${count('hands')} days</p>
        <p>🌟 Healthy-habit check-in progress: ${progressPercent}%</p>

        <p>⭐ Total healthy habit stars:
          ${days.reduce((sum, r) => sum + (r.stars || []).length, 0)}
        </p>

        <p class="ah-small">
          This report uses saved check-ins only. Missing days are not counted.
        </p>
      </div>
    `;
  }

  function renderDailySchedule() {
    const schedule = getDailySchedule().map(item => [...item]);

    function formatTime(value) {
      const parts = String(value || '').split(':').map(Number);
      const hours = parts[0];
      const minutes = parts[1];

      if (!Number.isFinite(hours) || !Number.isFinite(minutes)) {
        return value;
      }

      const period = hours >= 12 ? 'PM' : 'AM';
      const hour = hours % 12 || 12;

      return `${hour}:${String(minutes).padStart(2, '0')} ${period}`;
    }

    // Use the parent's selected wake-up and bedtime.
    schedule[0][0] = formatTime(settings.wake);
    schedule[schedule.length - 1][0] = formatTime(settings.bed);

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
        <h3>💭 Let's Talk About Your Day</h3>

        <p>😢 Did anything make you sad today?</p>
        <textarea id="ah-sad">${r.sad || ''}</textarea>

        <p>🤝 Did you help someone today?</p>
        <select id="ah-helped">
          <option value="">Choose</option>
          <option value="Yes">Yes 😊</option>
          <option value="A little">A little 🙂</option>
          <option value="Not today">Not today</option>
        </select>

        <p>🌳 Did you play outside today?</p>
        <select id="ah-outdoor">
          <option value="">Choose</option>
          <option value="Yes">Yes ⚽</option>
          <option value="A little">A little 🌼</option>
          <option value="No">Not today</option>
        </select>
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
    document.getElementById('ah-helped').value = r.helped || '';
    document.getElementById('ah-outdoor').value = r.outdoor || '';
  }

  function saveCheckin() {
    const r = record();
    const oldStars = r.stars.length;

    r.mood = document.getElementById('ah-mood').value;
    r.happy = document.getElementById('ah-happy').value;
    r.sad = document.getElementById('ah-sad').value;
    r.helped = document.getElementById('ah-helped').value;
    r.outdoor = document.getElementById('ah-outdoor').value;
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
        <h3>🌱 Healthy Growth Guide</h3>

        <h4>👶 Ages 2–3</h4>
        <p>😴 Sleep: 11–14 hours, including naps, for ages 2; 10–13 hours for ages 3–5.</p>
        <p>📱 Screen time: Keep to about 1 hour or less daily, with quality content and parent support.</p>
        <p>⚽ Activity: Plenty of active play throughout the day.</p>

        <h4>🧒 Ages 4–5</h4>
        <p>😴 Sleep: 10–13 hours, including naps if needed.</p>
        <p>📱 Screen time: About 1 hour or less daily.</p>
        <p>⚽ Activity: Aim for plenty of movement and outdoor play every day.</p>

        <h4>🎒 Ages 6–8</h4>
        <p>😴 Sleep: 9–12 hours every night.</p>
        <p>📱 Screen time: Set consistent family limits.</p>
        <p>⚽ Activity: Aim for at least 60 minutes of physical activity daily.</p>

        <p>❤️ Every child is different. Parents should adjust routines to the child's needs.</p>
      </div>
      ${renderWeeklyReport()}
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
