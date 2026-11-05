import React, { useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { Bell, Store, ShoppingBag, Globe, ScanLine, Leaf } from "lucide-react-native";
import { Colors, Radius, Shadows, Spacing, Typography } from "../theme";
import { useAuth } from "../contexts/AuthContext";
import { useLanguage } from "../contexts/LanguageContext";
import { LanguageSelectorModal } from "./LanguageSelectorModal";
import { UniversalScannerModal } from "./UniversalScannerModal";

interface CustomHeaderProps {
  title?: string;
  subtitle?: string;
  onPressNotifications?: () => void;
  onPressScanner?: () => void;
  showRoleToggle?: boolean;
}

export const CustomHeader: React.FC<CustomHeaderProps> = ({
  title = "ExpiryGo",
  subtitle = "Surplus Rescue Engine",
  onPressNotifications,
  onPressScanner,
  showRoleToggle = true,
}) => {
  const { user, roleIntent, setRoleIntent } = useAuth();
  const { currentLanguageMeta, t } = useLanguage();
  const [langModalVisible, setLangModalVisible] = useState(false);
  const [scannerVisible, setScannerVisible] = useState(false);

  const handleToggleRole = () => {
    const nextRole = roleIntent === "customer" ? "shop" : "customer";
    setRoleIntent(nextRole);
  };

  const handleOpenScanner = () => {
    if (onPressScanner) {
      onPressScanner();
    } else {
      setScannerVisible(true);
    }
  };

  const isDefaultBrand = !title || title === "ExpiryGo";

  return (
    <View style={styles.container}>
      {/* Left Menu / ExpiryGo Leaf Brand Icon */}
      <View style={styles.leftSection}>
        <View style={styles.logoBadge}>
          <Leaf size={18} color="#ffffff" />
        </View>
        <View style={styles.titleColumn}>
          {isDefaultBrand ? (
            <Text style={styles.brandTitle}>
              Expiry<Text style={styles.brandAccent}>Go</Text>
            </Text>
          ) : (
            <Text style={styles.brandTitle}>{title}</Text>
          )}
          <Text style={styles.subtitle} numberOfLines={1}>
            {subtitle || "Surplus Rescue Engine"}
          </Text>
        </View>
      </View>

      {/* Right Action Icons */}
      <View style={styles.rightActions}>
        {/* Quick Scanner Button */}
        <TouchableOpacity
          style={styles.scanBtn}
          onPress={handleOpenScanner}
          activeOpacity={0.8}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <ScanLine size={16} color={Colors.primary} />
        </TouchableOpacity>

        {/* Language Picker Button */}
        <TouchableOpacity
          style={styles.langBtn}
          onPress={() => setLangModalVisible(true)}
          activeOpacity={0.8}
        >
          <Globe size={13} color={Colors.primary} />
          <Text style={styles.langFlag}>{currentLanguageMeta.flag}</Text>
        </TouchableOpacity>

        {showRoleToggle && user?.is_shop_owner && (
          <TouchableOpacity
            style={[
              styles.roleToggle,
              roleIntent === "shop" ? styles.roleToggleShop : styles.roleToggleCustomer,
            ]}
            onPress={handleToggleRole}
            activeOpacity={0.8}
          >
            {roleIntent === "shop" ? (
              <>
                <Store size={12} color={Colors.primary} />
                <Text style={styles.roleTextShop}>{t("role.store_mode")}</Text>
              </>
            ) : (
              <>
                <ShoppingBag size={12} color={Colors.primary} />
                <Text style={styles.roleTextCustomer}>{t("role.shopper")}</Text>
              </>
            )}
          </TouchableOpacity>
        )}

        {onPressNotifications && (
          <TouchableOpacity
            style={styles.circleBtn}
            onPress={onPressNotifications}
            activeOpacity={0.8}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Bell size={18} color={Colors.textPrimary} />
            <View style={styles.notifDot} />
          </TouchableOpacity>
        )}
      </View>

      {/* Universal Scanner Modal */}
      <UniversalScannerModal
        visible={scannerVisible}
        onClose={() => setScannerVisible(false)}
        initialMode="barcode"
      />

      {/* Language Selector Modal */}
      <LanguageSelectorModal
        visible={langModalVisible}
        onClose={() => setLangModalVisible(false)}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: Spacing.md,
    paddingTop: 10,
    paddingBottom: Spacing.sm,
    backgroundColor: Colors.background,
  },
  leftSection: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    flex: 1,
  },
  logoBadge: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: "#7c3aed",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#7c3aed",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.35,
    shadowRadius: 6,
    elevation: 4,
  },
  titleColumn: {
    justifyContent: "center",
  },
  brandTitle: {
    fontSize: 20,
    fontWeight: "900",
    color: Colors.textPrimary,
    letterSpacing: -0.5,
  },
  brandAccent: {
    color: "#7c3aed",
    fontWeight: "900",
  },
  subtitle: {
    fontSize: 10,
    fontWeight: "700",
    color: "#7c3aed",
    textTransform: "uppercase",
    letterSpacing: 0.6,
    marginTop: 1,
  },
  rightActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  circleBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.card,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
    ...Shadows.soft,
  },
  notifDot: {
    position: "absolute",
    top: 9,
    right: 10,
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: Colors.primary,
  },
  roleToggle: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    paddingHorizontal: 11,
    paddingVertical: 7,
    borderRadius: Radius.full,
    borderWidth: 1,
    backgroundColor: Colors.card,
    borderColor: Colors.cardBorder,
    ...Shadows.soft,
  },
  roleToggleCustomer: {
    borderColor: Colors.cardBorder,
  },
  roleToggleShop: {
    borderColor: Colors.primary,
    backgroundColor: Colors.primaryLight,
  },
  roleTextCustomer: {
    fontSize: 11,
    fontWeight: "700",
    color: Colors.textPrimary,
  },
  roleTextShop: {
    fontSize: 11,
    fontWeight: "800",
    color: Colors.primary,
  },
  langBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 9,
    paddingVertical: 7,
    borderRadius: Radius.full,
    borderWidth: 1,
    backgroundColor: Colors.card,
    borderColor: Colors.cardBorder,
    ...Shadows.soft,
  },
  langFlag: {
    fontSize: 12,
  },
  scanBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: Colors.primaryLight,
    borderWidth: 1,
    borderColor: Colors.cardBorderHighlight,
    alignItems: "center",
    justifyContent: "center",
    ...Shadows.soft,
  },
});
