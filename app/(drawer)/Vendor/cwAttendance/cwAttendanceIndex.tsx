import { COLORS } from "@/constants/theme"; // Adjust path as needed
import { BarCodeScanner } from "expo-barcode-scanner";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
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

  useEffect(() => {
    const getBarCodeScannerPermissions = async () => {
      const { status } = await BarCodeScanner.requestPermissionsAsync();
      setHasPermission(status === "granted");
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
    Alert.alert("QR Code Scanned", `Data: ${data}`);
  };

  const scanQrCode = () => {
    if (hasPermission === null) {
      Alert.alert(
        "Permission Required",
        "Camera permission is required to scan QR codes."
      );
      return;
    }
    if (hasPermission === false) {
      Alert.alert(
        "Permission Denied",
        "Camera permission is required to scan QR codes."
      );
      return;
    }
    setScanned(false);
    setShowScanner(true);
  };

  if (showScanner) {
    return (
      <View style={styles.container}>
        <BarCodeScanner
          onBarCodeScanned={scanned ? undefined : handleBarCodeScanned}
          style={StyleSheet.absoluteFillObject}
        />
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
});
