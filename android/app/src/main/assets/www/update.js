(function () {
  const CURRENT_VERSION = '1.0.0';

  const UPDATE_VERSION_URL =
    'https://raw.githubusercontent.com/vishnuprabhu683-droid/Aadhi-Buddy/main/android/app/src/main/assets/www/version.json';

  window.AadhiUpdater = {
    check: async function () {
      try {
        const response = await fetch(UPDATE_VERSION_URL, {
          cache: 'no-store'
        });

        if (!response.ok) return;

        const data = await response.json();

        if (data.version !== CURRENT_VERSION) {
          alert(
            '✨ Aadhi AI update available!\n\n' +
            'Current version: ' + CURRENT_VERSION + '\n' +
            'Latest version: ' + data.version + '\n\n' +
            (data.message || 'A new update is available.')
          );
        } else {
          console.log('Aadhi AI is up to date.');
        }
      } catch (error) {
        console.log('Update check skipped. Offline mode.');
      }
    }
  };

  window.addEventListener('load', function () {
    window.AadhiUpdater.check();
  });
})();