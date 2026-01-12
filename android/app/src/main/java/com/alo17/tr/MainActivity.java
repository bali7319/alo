package com.alo17.tr;

import android.webkit.WebView;
import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {
    @Override
    public void onBackPressed() {
        WebView webView = getBridge().getWebView();
        
        // WebView'da geri gidecek sayfa varsa geri git
        if (webView != null && webView.canGoBack()) {
            webView.goBack();
        } else {
            // Geri gidecek sayfa yoksa anasayfaya yönlendir
            webView.loadUrl("https://alo17.tr/");
        }
    }
}
