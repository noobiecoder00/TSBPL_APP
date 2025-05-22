import { COLORS } from "@/constants/theme"; // Adjust path as needed
import { BarCodeScanner } from "expo-barcode-scanner";
import * as Linking from "expo-linking";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  useWindowDimensions,
} from "react-native";

const routes = [
  { key: "first", title: "All" },
  { key: "second", title: "Pending With Me" },
];

const CWAttendance = () => {
  const router = useRouter();
  const layout = useWindowDimensions();
  const [index, setIndex] = React.useState(0);
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [scanned, setScanned] = useState(false);
  const [showScanner, setShowScanner] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const getBarCodeScannerPermissions = async () => {
      try {
        const { status } = await BarCodeScanner.requestPermissionsAsync();
        setHasPermission(status === "granted");
      } catch (error) {
        console.error("Error requesting camera permission:", error);
        Alert.alert(
          "Error",
          "Failed to request camera permission. Please try again."
        );
      } finally {
        setIsLoading(false);
      }
    };

    getBarCodeScannerPermissions();
  }, []);

  const handleBarCodeScanned = ({
    type,
    data,
  }: {
    type: string;
    data: string;
  }) => {
    setScanned(true);
    setShowScanner(false);
    Alert.alert("QR Code Scanned", `Data: ${data}`, [
      {
        text: "Scan Again",
        onPress: () => {
          setScanned(false);
          setShowScanner(true);
        },
      },
      {
        text: "Close",
        onPress: () => setShowScanner(false),
        style: "cancel",
      },
    ]);
  };

  const scanQrCode = async () => {
    if (isLoading) return;

    const { status } = await BarCodeScanner.getPermissionsAsync();

    if (status !== "granted") {
      const { status: newStatus } =
        await BarCodeScanner.requestPermissionsAsync();

      if (newStatus === "granted") {
        setHasPermission(true);
        setScanned(false);
        setShowScanner(true);
      } else {
        Alert.alert(
          "Permission Denied",
          "Camera permission is required to scan QR codes. Please enable it in your device settings.",
          [
            {
              text: "Open Settings",
              onPress: () => {
                Linking.openSettings(); // Opens settings on both iOS and Android
              },
            },
            {
              text: "Cancel",
              style: "cancel",
            },
          ]
        );
      }
    } else {
      setHasPermission(true);
      setScanned(false);
      setShowScanner(true);
    }
  };

  if (isLoading) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={styles.loadingText}>Checking camera permission...</Text>
      </View>
    );
  }

  if (showScanner) {
    return (
      <View style={styles.container}>
        <BarCodeScanner
          onBarCodeScanned={scanned ? undefined : handleBarCodeScanned}
          style={StyleSheet.absoluteFillObject}
        />
        <View style={styles.scannerOverlay}>
          <View style={styles.scannerFrame} />
          <Text style={styles.scannerText}>Position QR code within frame</Text>
        </View>
        <TouchableOpacity
          style={styles.closeButton}
          onPress={() => setShowScanner(false)}
        >
          <Text style={styles.closeButtonText}>Close Scanner</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={scanQrCode} style={styles.createButton}>
        <Text style={styles.createButtonText}>Take Attendance</Text>
      </TouchableOpacity>
    </View>
  );
};

export default CWAttendance;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  centerContent: {
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: COLORS.text || "#333",
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    color: COLORS.text || "#333",
    marginBottom: 10,
  },
  createButton: {
    margin: 16,
    paddingVertical: 12,
    paddingHorizontal: 20,
    backgroundColor: COLORS.primary || "#4A90E2",
    borderRadius: 8,
    alignItems: "center",
  },
  createButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  closeButton: {
    position: "absolute",
    bottom: 40,
    alignSelf: "center",
    backgroundColor: "rgba(0,0,0,0.7)",
    padding: 15,
    borderRadius: 8,
  },
  closeButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  scannerOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: "center",
    alignItems: "center",
  },
  scannerFrame: {
    width: 250,
    height: 250,
    borderWidth: 2,
    borderColor: COLORS.primary || "#4A90E2",
    backgroundColor: "transparent",
  },
  scannerText: {
    color: "#fff",
    fontSize: 16,
    marginTop: 20,
    textAlign: "center",
    backgroundColor: "rgba(0,0,0,0.7)",
    padding: 10,
    borderRadius: 8,
  },
});
