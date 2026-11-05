import React, { useState, useRef, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  BackHandler,
  Platform,
  SafeAreaView,
} from "react-native";
import { StatusBar } from "expo-status-bar";
import { WebView } from "react-native-webview";
import { ScanLine, RefreshCw, Smartphone } from "lucide-react-native";
import { UniversalScannerModal, type ScannedBarcodeResult } from "../components/UniversalScannerModal";

const AnyWebView = WebView as any;
const WEB_URL = "https://expirygo.vercel.app";

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
    <SafeAreaView style={styles.container}>
      <StatusBar style="light" />

      {/* Top Header Pill Bar */}
      <View style={styles.topBar}>
        <View style={styles.leftInfo}>
          <View style={styles.liveDot} />
          <Text style={styles.liveText}>expirygo.vercel.app</Text>
        </View>

        <View style={styles.rightActions}>
          <TouchableOpacity
            style={styles.actionBtn}
            onPress={reloadWeb}
            accessibilityLabel="Refresh"
          >
            <RefreshCw size={15} color="#94a3b8" />
          </TouchableOpacity>

          {onSwitchToNative && (
            <TouchableOpacity
              style={styles.switchPill}
              onPress={onSwitchToNative}
              accessibilityLabel="Switch to Native UI"
            >
              <Smartphone size={13} color="#a855f7" />
              <Text style={styles.switchPillText}>Native UI</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

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
          renderLoading={() => (
            <View style={styles.loadingOverlay}>
              <ActivityIndicator size="large" color="#7c3aed" />
              <Text style={styles.loadingText}>Loading ExpiryGo Cloud...</Text>
            </View>
          )}
        />
      </View>

      {/* Floating Bottom Native Barcode Scanner Button */}
      <TouchableOpacity
        style={styles.floatingScanner}
        activeOpacity={0.85}
        onPress={() => setScannerVisible(true)}
      >
        <ScanLine size={20} color="#ffffff" />
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
    backgroundColor: "#090d16",
  },
  topBar: {
    height: 40,
    backgroundColor: "#0d1322",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#1e293b",
  },
  leftInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  liveDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: "#10b981",
  },
  liveText: {
    color: "#cbd5e1",
    fontSize: 12,
    fontFamily: Platform.OS === "ios" ? "System" : "sans-serif-medium",
    fontWeight: "700",
  },
  rightActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  actionBtn: {
    padding: 6,
    borderRadius: 8,
    backgroundColor: "#1e293b",
  },
  switchPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "rgba(168, 85, 247, 0.15)",
    borderWidth: 1,
    borderColor: "rgba(168, 85, 247, 0.3)",
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 12,
  },
  switchPillText: {
    color: "#c084fc",
    fontSize: 11,
    fontWeight: "700",
  },
  webWrap: {
    flex: 1,
    backgroundColor: "#0B0F19",
  },
  webview: {
    flex: 1,
    backgroundColor: "#0B0F19",
  },
  loadingOverlay: {
    position: "absolute",
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    backgroundColor: "#0B0F19",
    justifyContent: "center",
    alignItems: "center",
    gap: 12,
  },
  loadingText: {
    color: "#94a3b8",
    fontSize: 13,
    fontWeight: "600",
  },
  floatingScanner: {
    position: "absolute",
    bottom: 24,
    right: 20,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "#7c3aed",
    paddingVertical: 12,
    paddingHorizontal: 18,
    borderRadius: 28,
    shadowColor: "#7c3aed",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 10,
    elevation: 8,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.2)",
  },
  scannerBtnText: {
    color: "#ffffff",
    fontSize: 13,
    fontWeight: "800",
    letterSpacing: 0.3,
  },
});
