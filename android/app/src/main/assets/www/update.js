
(function () {
  const CURRENT_VERSION = '1.0.0';

  const UPDATE_VERSION_URL =
    'https://raw.githubusercontent.com/vishnuprabhu683-droid/Aadhi-Buddy/main/android/app/src/main/assets/www/version.json';

  function isNewerVersion(latest, current) {
    const a = latest.split('.').map(Number);
    const b = current.split('.').map(Number);

    for (let i = 0; i < 3; i++) {
      if ((a[i] || 0) > (b[i] || 0)) return true;
      if ((a[i] || 0) < (b[i] || 0)) return false;
    }
    return false;
  }

  window.AadhiUpdater = {
    check: async function () {
      try {
        const response = await fetch(UPDATE_VERSION_URL, {
          cache: 'no-store'
        });

        if (!response.ok) return;

        const data = await response.json();

        if (isNewerVersion(data.version, CURRENT_VERSION)) {
          const updateNow = confirm(
            '✨ Aadhi AI Update Available!\n\n' +
            'Current version: ' + CURRENT_VERSION + '\n' +
            'Latest version: ' + data.version + '\n\n' +
            (data.message || 'A new update is ready.') +
            '\n\nWould you like to update now?'
          );

          if (updateNow) {
            if (window.AadhiVoice &&
                typeof window.AadhiVoice.downloadAndInstall === 'function') {
              window.AadhiVoice.downloadAndInstall(data.apkUrl);
            } else {
              alert('Update service is unavailable. Please restart Aadhi AI.');
            }
          }
        }
      } catch (error) {
        console.log('Update check skipped. Offline mode.');
      }
    }
  };

  window.addEventListener('load', function () {
    setTimeout(function () {
      window.AadhiUpdater.check();
    }, 2000);
  });
})();
