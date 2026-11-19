
package com.aadhiai.kids;

import android.app.Activity;
import android.os.Bundle;
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
import android.Manifest;
import android.media.MediaPlayer;
import android.content.res.AssetFileDescriptor;
import android.util.Log;

import org.json.JSONObject;

import java.util.Locale;
import java.util.ArrayList;
import java.io.IOException;

public class MainActivity extends Activity {

    private WebView webView;
    private TextToSpeech tts;
    private boolean ttsReady = false;
    private MediaPlayer player;

    private SpeechRecognizer speechRecognizer;
    private String pendingLanguage = "en-IN";

    private static final int MIC_PERMISSION = 101;

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
            public void onBeginningOfSpeech() {
            }

            @Override
            public void onRmsChanged(float rmsdB) {
            }

            @Override
            public void onBufferReceived(byte[] buffer) {
            }

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
            public void onPartialResults(Bundle partialResults) {
            }

            @Override
            public void onEvent(int eventType, Bundle params) {
            }
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
