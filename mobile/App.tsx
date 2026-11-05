import React, { Component, ErrorInfo, ReactNode, useState } from "react";
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Platform } from "react-native";
import { StatusBar } from "expo-status-bar";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { enableScreens } from "react-native-screens";
import { Globe } from "lucide-react-native";
import { AuthProvider } from "./src/contexts/AuthContext";
import { LanguageProvider } from "./src/contexts/LanguageContext";
import { RootNavigator } from "./src/navigation/RootNavigator";
import { WebUnifiedView } from "./src/screens/WebUnifiedView";
import { Colors, Radius, Spacing, Typography } from "./src/theme";

// Initialize optimized native screens
enableScreens(true);

interface ErrorBoundaryProps {
  children: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("ErrorBoundary caught an error:", error, errorInfo);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      return (
        <View style={errorStyles.container}>
          <Text style={errorStyles.title}>App Notice</Text>
          <ScrollView style={errorStyles.scroll} contentContainerStyle={errorStyles.scrollContent}>
            <Text style={errorStyles.message}>
              {this.state.error?.message || "An unexpected issue occurred."}
            </Text>
            {this.state.error?.stack ? (
              <Text style={errorStyles.stackText}>{this.state.error.stack}</Text>
            ) : null}
          </ScrollView>
          <TouchableOpacity style={errorStyles.button} onPress={this.handleReset} activeOpacity={0.8}>
            <Text style={errorStyles.buttonText}>Reload Screen</Text>
          </TouchableOpacity>
        </View>
      );
    }
    return this.props.children;
  }
}

const errorStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
    justifyContent: "center",
    alignItems: "center",
    padding: Spacing.lg,
    paddingTop: Spacing.xxl,
  },
  scroll: {
    maxHeight: 300,
    width: "100%",
    backgroundColor: Colors.card,
    borderRadius: Radius.md,
    padding: Spacing.md,
    marginBottom: Spacing.lg,
  },
  scrollContent: {
    alignItems: "flex-start",
  },
  title: {
    ...Typography.title1,
    color: Colors.danger,
    marginBottom: Spacing.md,
  },
  message: {
    ...Typography.bodyBold,
    color: Colors.textPrimary,
    textAlign: "left",
    marginBottom: Spacing.sm,
  },
  stackText: {
    fontSize: 11,
    fontFamily: Platform.OS === "ios" ? "Courier" : "monospace",
    color: Colors.textMuted,
  },
  button: {
    backgroundColor: Colors.primary,
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.md,
    borderRadius: Radius.md,
  },
  buttonText: {
    ...Typography.bodyBold,
    color: Colors.textInverse,
  },
});

const navStyles = StyleSheet.create({
  backToWebPill: {
    position: "absolute",
    top: Platform.OS === "ios" ? 50 : 20,
    right: 16,
    zIndex: 9999,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "#7c3aed",
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 6,
  },
  backToWebText: {
    color: "#ffffff",
    fontSize: 12,
    fontWeight: "700",
  },
});

export default function App() {
  const [viewMode, setViewMode] = useState<"web" | "native">("web");

  return (
    <SafeAreaProvider>
      <ErrorBoundary>
        <StatusBar style="light" />
        {viewMode === "web" ? (
          <WebUnifiedView onSwitchToNative={() => setViewMode("native")} />
        ) : (
          <LanguageProvider>
            <AuthProvider>
              <RootNavigator />
              <TouchableOpacity
                style={navStyles.backToWebPill}
                onPress={() => setViewMode("web")}
                activeOpacity={0.85}
              >
                <Globe size={13} color="#ffffff" />
                <Text style={navStyles.backToWebText}>Live Web App</Text>
              </TouchableOpacity>
            </AuthProvider>
          </LanguageProvider>
        )}
      </ErrorBoundary>
    </SafeAreaProvider>
  );
}
