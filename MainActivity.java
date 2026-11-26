
package com.aadhiai.kids;

import android.app.Activity;
import android.os.Bundle;
import android.util.Log;
import android.webkit.JavascriptInterface;
import android.webkit.WebChromeClient;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.webkit.WebViewClient;
import android.speech.tts.TextToSpeech;
import java.util.Locale;
import android.app.DownloadManager;
import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;
import android.content.IntentFilter;
import android.content.pm.PackageManager;
import android.net.Uri;
import android.os.Build;
import android.os.Environment;
import android.provider.Settings;
import androidx.core.content.FileProvider;
import java.io.File;

public class MainActivity extends Activity {

    private WebView webView;
    private TextToSpeech tts;
    private boolean ttsReady = false;
    private String pendingText = "";
    private String pendingLanguage = "en";
private long downloadId = -1;
private BroadcastReceiver downloadReceiver;

    @Override
    public void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);

        tts = new TextToSpeech(this, status -> {
            if (status == TextToSpeech.SUCCESS) {
                ttsReady = true;
                if (!pendingText.isEmpty()) {
                    speakText(pendingText, pendingLanguage);
                    pendingText = "";
                }
            }
        });

        webView = new WebView(this);

        WebSettings settings = webView.getSettings();
        settings.setJavaScriptEnabled(true);
        settings.setDomStorageEnabled(true);
        settings.setAllowFileAccess(true);
        settings.setMediaPlaybackRequiresUserGesture(false);

        webView.addJavascriptInterface(new VoiceBridge(), "AadhiVoice");

        webView.setWebViewClient(new WebViewClient());
        webView.setWebChromeClient(new WebChromeClient());

        setContentView(webView);
        webView.loadUrl("file:///android_asset/www/index.html");
    }

    private void speakText(String text, String language) {
        if (!ttsReady || text == null || text.trim().isEmpty()) {
            return;
        }

        Locale locale = language.toLowerCase().startsWith("ta")
                ? new Locale("ta", "IN")
                : Locale.US;

        int result = tts.setLanguage(locale);

        if (result == TextToSpeech.LANG_MISSING_DATA ||
            result == TextToSpeech.LANG_NOT_SUPPORTED) {
            tts.setLanguage(Locale.US);
        }

        tts.setSpeechRate(0.85f);
        tts.speak(text, TextToSpeech.QUEUE_FLUSH, null, "AadhiSpeech");
    }

    private class VoiceBridge {
        @JavascriptInterface
        public void speak(String text, String language) {
            runOnUiThread(() -> {
                if (!ttsReady) {
                    pendingText = text;
                    pendingLanguage = language;
                } else {
                    speakText(text, language);
                }
            });
        }

        @JavascriptInterface
        public void stop() {
            runOnUiThread(() -> {
                if (tts != null) {
                    tts.stop();
                }
        @JavascriptInterface
        public void downloadAndInstall(String apkUrl) {
            runOnUiThread(() -> {
                if (Build.VERSION.SDK_INT >= 26 &&
                    !getPackageManager().canRequestPackageInstalls()) {
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
            });
        }
    }
    private void startApkDownload(String apkUrl) {
        try {
            DownloadManager manager =
                (DownloadManager) getSystemService(DOWNLOAD_SERVICE);

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

            downloadId = manager.enqueue(request);

            downloadReceiver = new BroadcastReceiver() {
                @Override
                public void onReceive(Context context, Intent intent) {
                    long id = intent.getLongExtra(
                        DownloadManager.EXTRA_DOWNLOAD_ID, -1
                    );

                    if (id == downloadId) {
                        installDownloadedApk();
                        unregisterReceiver(this);
                        downloadReceiver = null;
                    }
                }
            };

            IntentFilter filter = new IntentFilter(
                DownloadManager.ACTION_DOWNLOAD_COMPLETE
            );

            if (Build.VERSION.SDK_INT >= 33) {
                registerReceiver(
                    downloadReceiver, filter, Context.RECEIVER_NOT_EXPORTED
                );
            } else {
                registerReceiver(downloadReceiver, filter);
            }

        } catch (Exception e) {
            Log.e("AadhiAI", "Download failed", e);
        }
    }

    private void installDownloadedApk() {
        try {
            File file = new File(
                getExternalFilesDir(Environment.DIRECTORY_DOWNLOADS),
                "AadhiAI-update.apk"
            );

            Uri uri = FileProvider.getUriForFile(
                this,
                getPackageName() + ".provider",
                file
            );

            Intent intent = new Intent(Intent.ACTION_VIEW);
            intent.setDataAndType(
                uri, "application/vnd.android.package-archive"
            );
            intent.addFlags(Intent.FLAG_GRANT_READ_URI_PERMISSION);
            intent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
            startActivity(intent);

        } catch (Exception e) {
            Log.e("AadhiAI", "Installation failed", e);
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
        if (tts != null) {
            tts.stop();
            tts.shutdown();
        }
        if (webView != null) {
            webView.destroy();
        }
        super.onDestroy();
    }
}