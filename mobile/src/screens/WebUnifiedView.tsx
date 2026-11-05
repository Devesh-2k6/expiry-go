import React, { useState, useRef, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  BackHandler,
  Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { WebView } from "react-native-webview";
import { ScanLine, RefreshCw } from "lucide-react-native";
import { UniversalScannerModal, type ScannedBarcodeResult } from "../components/UniversalScannerModal";

const AnyWebView = WebView as any;
const WEB_URL = "https://expirygo.vercel.app?app=true";

interface WebUnifiedViewProps {
  onSwitchToNative?: () => void;
}

export const WebUnifiedView: React.FC<WebUnifiedViewProps> = ({ onSwitchToNative }) => {
  const webViewRef = useRef<any>(null);
  const [canGoBack, setCanGoBack] = useState(false);
  const [canGoForward, setCanGoForward] = useState(false);
  const [loading, setLoading] = useState(true);
  const [scannerVisible, setScannerVisible] = useState(false);
  const [currentUrl, setCurrentUrl] = useState(WEB_URL);

  // Handle hardware Android back button
  useEffect(() => {
    if (Platform.OS === "android") {
      const onBackPress = () => {
        if (canGoBack && webViewRef.current) {
          webViewRef.current.goBack();
          return true;
        }
        return false;
      };
      const sub = BackHandler.addEventListener("hardwareBackPress", onBackPress);
      return () => sub.remove();
    }
  }, [canGoBack]);

  const handleBarcodeScanned = (res: ScannedBarcodeResult) => {
    setScannerVisible(false);
    const code = res.barcode || res.name || "";
    if (code && webViewRef.current) {
      // Direct navigation inside the web app
      const target = `${WEB_URL}/deals?q=${encodeURIComponent(code)}`;
      webViewRef.current.injectJavaScript(`window.location.href = "${target}"; true;`);
    }
  };

  const reloadWeb = () => {
    if (webViewRef.current) {
      webViewRef.current.reload();
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={["top", "bottom"]}>
      <StatusBar style="dark"  />

      {/* Main Full-Screen Web App */}
      <View style={styles.webWrap}>
        <AnyWebView
          ref={webViewRef}
          source={{ uri: WEB_URL }}
          style={styles.webview}
          onNavigationStateChange={(nav: any) => {
            setCanGoBack(Boolean(nav?.canGoBack));
            setCanGoForward(Boolean(nav?.canGoForward));
            if (nav?.url) setCurrentUrl(nav.url);
          }}
          onLoadStart={() => setLoading(true)}
          onLoadEnd={() => setLoading(false)}
          javaScriptEnabled={true}
          domStorageEnabled={true}
          startInLoadingState={true}
          scalesPageToFit={true}
          allowsBackForwardNavigationGestures={true}
          pullToRefreshEnabled={true}
          sharedCookiesEnabled={true}
          cacheEnabled={true}
          geolocationEnabled={true}
          allowsInlineMediaPlayback={true}
          mediaPlaybackRequiresUserAction={false}
          renderLoading={() => (
            <View style={styles.loadingOverlay}>
              <ActivityIndicator size="large" color="#7c3aed" />
              <Text style={styles.loadingText}>Opening ExpiryGo...</Text>
            </View>
          )}
        />
      </View>

      {/* Floating Bottom Native Barcode Scanner Button */}
      <TouchableOpacity
        style={styles.floatingScanner}
        activeOpacity={0.88}
        onPress={() => setScannerVisible(true)}
        accessibilityLabel="Scan Product Barcode"
      >
        <ScanLine size={19} color="#ffffff" strokeWidth={2.4} />
        <Text style={styles.scannerBtnText}>Scan Product</Text>
      </TouchableOpacity>

      {/* Hardware Camera / Barcode Modal */}
      <UniversalScannerModal
        visible={scannerVisible}
        onClose={() => setScannerVisible(false)}
        initialMode="barcode"
        onBarcodeDetected={handleBarcodeScanned}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FAFAFE",
  },
  webWrap: {
    flex: 1,
    backgroundColor: "#FAFAFE",
  },
  webview: {
    flex: 1,
    backgroundColor: "#FAFAFE",
  },
  loadingOverlay: {
    position: "absolute",
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    backgroundColor: "#FAFAFE",
    justifyContent: "center",
    alignItems: "center",
    gap: 12,
  },
  loadingText: {
    color: "#6D28D9",
    fontSize: 14,
    fontWeight: "700",
  },
  floatingScanner: {
    position: "absolute",
    bottom: Platform.OS === "ios" ? 30 : 22,
    right: 18,
    flexDirection: "row",
    alignItems: "center",
    gap: 7,
    backgroundColor: "#7c3aed",
    paddingVertical: 12,
    paddingHorizontal: 18,
    borderRadius: 30,
    shadowColor: "#7c3aed",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.45,
    shadowRadius: 10,
    elevation: 8,
    borderWidth: 1.5,
    borderColor: "rgba(255, 255, 255, 0.35)",
    zIndex: 9999,
  },
  scannerBtnText: {
    color: "#ffffff",
    fontSize: 13,
    fontWeight: "800",
    letterSpacing: 0.3,
  },
});
