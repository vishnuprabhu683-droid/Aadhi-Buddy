
package com.aadhiai.kids;

import android.app.Activity;
import android.app.DownloadManager;
import android.os.Bundle;
import android.os.Build;
import android.os.Environment;
import android.webkit.WebChromeClient;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.webkit.WebViewClient;
import android.webkit.JavascriptInterface;
import android.speech.tts.TextToSpeech;
import android.speech.SpeechRecognizer;
import android.speech.RecognizerIntent;
import android.speech.RecognitionListener;
import android.content.Intent;
import android.content.pm.PackageManager;
import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.IntentFilter;
import android.Manifest;
import android.media.MediaPlayer;
import android.content.res.AssetFileDescriptor;
import android.net.Uri;
import android.provider.Settings;
import android.database.Cursor;
import android.util.Log;

import androidx.core.content.FileProvider;

import org.json.JSONObject;

import java.util.Locale;
import java.util.ArrayList;
import java.io.IOException;
import java.io.File;

public class MainActivity extends Activity {

    private WebView webView;
    private TextToSpeech tts;
    private boolean ttsReady = false;
    private MediaPlayer player;

    private SpeechRecognizer speechRecognizer;
    private String pendingLanguage = "en-IN";

    private static final int MIC_PERMISSION = 101;
private static final int NOTIFICATION_PERMISSION = 102;

    private String pendingApkUrl = null;
    private long downloadId = -1;
    private BroadcastReceiver downloadReceiver;

    @Override
    public void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);

        webView = new WebView(this);

        WebSettings settings = webView.getSettings();
        settings.setJavaScriptEnabled(true);
        settings.setDomStorageEnabled(true);
        settings.setAllowFileAccess(true);
        settings.setMediaPlaybackRequiresUserGesture(false);

        webView.addJavascriptInterface(new AadhiVoice(), "AadhiVoice");

        webView.setWebViewClient(new WebViewClient());
        webView.setWebChromeClient(new WebChromeClient());

        setContentView(webView);

        tts = new TextToSpeech(this, status -> {
            ttsReady = status == TextToSpeech.SUCCESS;
            if (ttsReady) {
                tts.setSpeechRate(0.85f);
            }
        });

        webView.loadUrl("file:///android_asset/www/index.html");
if (Build.VERSION.SDK_INT >= 33 &&
    checkSelfPermission(Manifest.permission.POST_NOTIFICATIONS)
        != PackageManager.PERMISSION_GRANTED) {

    requestPermissions(
        new String[]{Manifest.permission.POST_NOTIFICATIONS},
        NOTIFICATION_PERMISSION
    );
}
    }

    public class AadhiVoice {

        @JavascriptInterface
        public void speak(String text, String language) {
            runOnUiThread(() -> {
                if (!ttsReady || tts == null || text == null) {
                    return;
                }

                Locale locale;

                if (language != null &&
                    language.toLowerCase().startsWith("ta")) {
                    locale = new Locale("ta", "IN");
                } else {
                    locale = new Locale("en", "IN");
                }

                int result = tts.setLanguage(locale);

                if (result == TextToSpeech.LANG_MISSING_DATA ||
                    result == TextToSpeech.LANG_NOT_SUPPORTED) {
                    Log.e("AadhiAI", "Voice language unavailable");
                    return;
                }

                tts.speak(text, TextToSpeech.QUEUE_FLUSH, null, "aadhi_voice");
            
            });
        }

        @JavascriptInterface
        public void scheduleReminder(int minutes) {
            if (minutes < 15) {
                minutes = 15;
            }

            androidx.work.Data reminderData =
                new androidx.work.Data.Builder()
                    .putString("title", "Aadhi AI Healthy Reminder")
                    .putString("message", "Time to drink some water and take a healthy break! 💧")
                    .build();

            androidx.work.PeriodicWorkRequest reminder =
                new androidx.work.PeriodicWorkRequest.Builder(
                    HealthyReminderWorker.class,
                    minutes,
                    java.util.concurrent.TimeUnit.MINUTES
                )
                .setInputData(reminderData)
                .build();

            androidx.work.WorkManager
                .getInstance(MainActivity.this)
                .enqueueUniquePeriodicWork(
                    "aadhi_healthy_reminder",
                    androidx.work.ExistingPeriodicWorkPolicy.UPDATE,
                    reminder
                );
        }

                @JavascriptInterface
        public void cancelReminder() {
            androidx.work.WorkManager
                .getInstance(MainActivity.this)
                .cancelUniqueWork("aadhi_healthy_reminder");
        }

        @JavascriptInterface
        public void stop() {
            runOnUiThread(() -> {
                if (tts != null) {
                    tts.stop();
                }
            });
        }

        @JavascriptInterface
        public boolean isReady() {
            return ttsReady;
        }

        @JavascriptInterface
        public void playSound(String filename) {
            runOnUiThread(() -> playAssetSound(filename));
        }

        @JavascriptInterface
        public void listen(String language) {
            runOnUiThread(() -> {
                pendingLanguage =
                    (language != null && language.toLowerCase().startsWith("ta"))
                    ? "ta-IN" : "en-IN";

                if (checkSelfPermission(Manifest.permission.RECORD_AUDIO)
                    != PackageManager.PERMISSION_GRANTED) {

                    requestPermissions(
                        new String[]{Manifest.permission.RECORD_AUDIO},
                        MIC_PERMISSION
                    );
                    return;
                }

                startListening();
            });
        }

        @JavascriptInterface
        public void cancelListen() {
            runOnUiThread(() -> {
                if (speechRecognizer != null) {
                    speechRecognizer.cancel();
                }
            });
        }

        @JavascriptInterface
        public void downloadAndInstall(String apkUrl) {
            runOnUiThread(() -> {
                if (apkUrl == null || !apkUrl.startsWith("https://")) {
                    Log.e("AadhiAI", "Invalid APK URL");
                    return;
                }

                if (Build.VERSION.SDK_INT >= 26 &&
                    !getPackageManager().canRequestPackageInstalls()) {

                    pendingApkUrl = apkUrl;

                    Intent intent = new Intent(
                        Settings.ACTION_MANAGE_UNKNOWN_APP_SOURCES,
                        Uri.parse("package:" + getPackageName())
                    );

                    startActivity(intent);
                    return;
                }

                startApkDownload(apkUrl);
            });
        }
    }

    @Override
    protected void onResume() {
        super.onResume();

        if (pendingApkUrl != null &&
            (Build.VERSION.SDK_INT < 26 ||
             getPackageManager().canRequestPackageInstalls())) {

            String url = pendingApkUrl;
            pendingApkUrl = null;
            startApkDownload(url);
        }
    }

    private void startApkDownload(String apkUrl) {
        try {
            DownloadManager manager =
                (DownloadManager) getSystemService(DOWNLOAD_SERVICE);

            if (manager == null) {
                Log.e("AadhiAI", "Download service unavailable");
                return;
            }

            DownloadManager.Request request =
                new DownloadManager.Request(Uri.parse(apkUrl));

            request.setTitle("Aadhi AI Update");
            request.setDescription("Downloading the latest version...");
            request.setNotificationVisibility(
                DownloadManager.Request.VISIBILITY_VISIBLE_NOTIFY_COMPLETED
            );

            request.setDestinationInExternalFilesDir(
                this,
                Environment.DIRECTORY_DOWNLOADS,
                "AadhiAI-update.apk"
            );

            if (downloadReceiver != null) {
                try {
                    unregisterReceiver(downloadReceiver);
                } catch (Exception ignored) {
                }
                downloadReceiver = null;
            }

            downloadReceiver = new BroadcastReceiver() {
                @Override
                public void onReceive(Context context, Intent intent) {
                    long id = intent.getLongExtra(
                        DownloadManager.EXTRA_DOWNLOAD_ID, -1
                    );

                    if (id == downloadId) {
                        checkDownloadResult(manager);
                    }
                }
            };

            IntentFilter filter = new IntentFilter(
                DownloadManager.ACTION_DOWNLOAD_COMPLETE
            );

            if (Build.VERSION.SDK_INT >= 33) {
                registerReceiver(
                    downloadReceiver,
                    filter,
                    Context.RECEIVER_NOT_EXPORTED
                );
            } else {
                registerReceiver(downloadReceiver, filter);
            }

            downloadId = manager.enqueue(request);

        } catch (Exception e) {
            Log.e("AadhiAI", "Download failed", e);
        }
    }

    private void checkDownloadResult(DownloadManager manager) {
        DownloadManager.Query query =
            new DownloadManager.Query().setFilterById(downloadId);

        try (Cursor cursor = manager.query(query)) {
            if (cursor != null && cursor.moveToFirst()) {
                int status = cursor.getInt(
                    cursor.getColumnIndexOrThrow(
                        DownloadManager.COLUMN_STATUS
                    )
                );

                if (status == DownloadManager.STATUS_SUCCESSFUL) {
                    installDownloadedApk();
                } else {
                    Log.e("AadhiAI", "APK download was not successful");
                }
            }
        } catch (Exception e) {
            Log.e("AadhiAI", "Download status check failed", e);
        } finally {
            if (downloadReceiver != null) {
                try {
                    unregisterReceiver(downloadReceiver);
                } catch (Exception ignored) {
                }
                downloadReceiver = null;
            }
        }
    }

    private void installDownloadedApk() {
        try {
            File file = new File(
                getExternalFilesDir(Environment.DIRECTORY_DOWNLOADS),
                "AadhiAI-update.apk"
            );

            if (!file.exists() || file.length() == 0) {
                Log.e("AadhiAI", "Downloaded APK not found");
                return;
            }

            Uri uri = FileProvider.getUriForFile(
                this,
                getPackageName() + ".provider",
                file
            );

            Intent intent = new Intent(Intent.ACTION_VIEW);
            intent.setDataAndType(
                uri,
                "application/vnd.android.package-archive"
            );
            intent.addFlags(Intent.FLAG_GRANT_READ_URI_PERMISSION);
            intent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);

            startActivity(intent);

        } catch (Exception e) {
            Log.e("AadhiAI", "Installation failed", e);
        }
    }

    private void startListening() {

        if (!SpeechRecognizer.isRecognitionAvailable(this)) {
            sendSpeechCallback(
                "onAadhiSpeechError",
                "Speech recognition is unavailable on this device."
            );
            return;
        }

        if (speechRecognizer != null) {
            speechRecognizer.destroy();
        }

        speechRecognizer = SpeechRecognizer.createSpeechRecognizer(this);

        speechRecognizer.setRecognitionListener(new RecognitionListener() {

            @Override
            public void onReadyForSpeech(Bundle params) {
                sendSpeechCallback("onAadhiSpeechStatus", "Listening...");
            }

            @Override
            public void onBeginningOfSpeech() {}

            @Override
            public void onRmsChanged(float rmsdB) {}

            @Override
            public void onBufferReceived(byte[] buffer) {}

            @Override
            public void onEndOfSpeech() {
                sendSpeechCallback("onAadhiSpeechStatus", "Processing...");
            }

            @Override
            public void onError(int error) {
                sendSpeechCallback(
                    "onAadhiSpeechError",
                    "I couldn't hear that. Please try again."
                );
            }

            @Override
            public void onResults(Bundle results) {
                ArrayList<String> matches =
                    results.getStringArrayList(
                        SpeechRecognizer.RESULTS_RECOGNITION
                    );

                if (matches != null && !matches.isEmpty()) {
                    sendSpeechCallback(
                        "onAadhiSpeechResult",
                        matches.get(0)
                    );
                } else {
                    sendSpeechCallback(
                        "onAadhiSpeechError",
                        "Please try speaking again."
                    );
                }
            }

            @Override
            public void onPartialResults(Bundle partialResults) {}

            @Override
            public void onEvent(int eventType, Bundle params) {}
        });

        Intent intent = new Intent(RecognizerIntent.ACTION_RECOGNIZE_SPEECH);
        intent.putExtra(
            RecognizerIntent.EXTRA_LANGUAGE_MODEL,
            RecognizerIntent.LANGUAGE_MODEL_FREE_FORM
        );
        intent.putExtra(RecognizerIntent.EXTRA_LANGUAGE, pendingLanguage);
        intent.putExtra(RecognizerIntent.EXTRA_MAX_RESULTS, 1);
        intent.putExtra(RecognizerIntent.EXTRA_PARTIAL_RESULTS, false);

        speechRecognizer.startListening(intent);
    }

    private void sendSpeechCallback(String function, String message) {
        runOnUiThread(() -> {
            if (webView != null) {
                String safeMessage = JSONObject.quote(message);
                String javascript =
                    "if(window." + function + "){" +
                    "window." + function + "(" + safeMessage + ");}";

                webView.evaluateJavascript(javascript, null);
            }
        });
    }

    @Override
    public void onRequestPermissionsResult(
        int requestCode,
        String[] permissions,
        int[] grantResults
    ) {
        super.onRequestPermissionsResult(
            requestCode, permissions, grantResults
        );

        if (requestCode == MIC_PERMISSION) {
            if (grantResults.length > 0 &&
                grantResults[0] == PackageManager.PERMISSION_GRANTED) {
                startListening();
            } else {
                sendSpeechCallback(
                    "onAadhiSpeechError",
                    "Microphone permission is needed to talk to Aadhi."
                );
            }
        }
    }

    private void playAssetSound(String filename) {
        if (player != null) {
            player.release();
            player = null;
        }

        try {
            AssetFileDescriptor afd =
                getAssets().openFd("www/sounds/" + filename);

            player = new MediaPlayer();
            player.setDataSource(
                afd.getFileDescriptor(),
                afd.getStartOffset(),
                afd.getLength()
            );
            afd.close();

            player.setOnCompletionListener(mp -> {
                mp.release();
                if (player == mp) player = null;
            });

            player.prepare();
            player.start();

        } catch (IOException e) {
            Log.e("AadhiAI", "Sound file error", e);
        }
    }

    @Override
    public void onBackPressed() {
        if (webView != null && webView.canGoBack()) {
            webView.goBack();
        } else {
            super.onBackPressed();
        }
    }

    @Override
    protected void onDestroy() {
        if (downloadReceiver != null) {
            try {
                unregisterReceiver(downloadReceiver);
            } catch (Exception ignored) {
            }
            downloadReceiver = null;
        }

        if (tts != null) {
            tts.stop();
            tts.shutdown();
        }

        if (speechRecognizer != null) {
            speechRecognizer.destroy();
            speechRecognizer = null;
        }

        if (player != null) {
            player.release();
            player = null;
        }

        if (webView != null) {
            webView.destroy();
        }

        super.onDestroy();
    }
}
