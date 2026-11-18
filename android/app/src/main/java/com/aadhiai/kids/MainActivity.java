
package com.aadhiai.kids;

import android.app.Activity;
import android.os.Bundle;
import android.webkit.WebChromeClient;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.webkit.WebViewClient;
import android.webkit.JavascriptInterface;
import android.speech.tts.TextToSpeech;
import android.media.MediaPlayer;
import android.content.res.AssetFileDescriptor;
import android.util.Log;

import java.util.Locale;
import java.io.IOException;

public class MainActivity extends Activity {

    private WebView webView;
    private TextToSpeech tts;
    private boolean ttsReady = false;
    private MediaPlayer player;

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
    }

    public class AadhiVoice {

        @JavascriptInterface
        public void speak(String text, String language) {
            runOnUiThread(() -> {
                if (!ttsReady || tts == null || text == null) {
                    Log.e("AadhiAI", "Text to speech is not ready");
                    return;
                }

                Locale locale;

                if (language != null && language.toLowerCase().startsWith("ta")) {
                    locale = new Locale("ta", "IN");
                } else {
                    locale = new Locale("en", "IN");
                }

                int result = tts.setLanguage(locale);

                if (result == TextToSpeech.LANG_MISSING_DATA ||
                    result == TextToSpeech.LANG_NOT_SUPPORTED) {
                    Log.e("AadhiAI", "Voice language unavailable: " + language);
                    return;
                }

                tts.speak(text, TextToSpeech.QUEUE_FLUSH, null, "aadhi_voice");
            });
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
    }

    private void playAssetSound(String filename) {
        if (player != null) {
            player.release();
            player = null;
        }

        try {
            AssetFileDescriptor afd = getAssets().openFd("www/sounds/" + filename);

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
        if (tts != null) {
            tts.stop();
            tts.shutdown();
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