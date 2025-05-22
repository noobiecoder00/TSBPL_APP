import { hideLoading, showLoading } from "@/app/store/loaderSlice";
import Loader from "@/components/Loader";
import { API_ENDPOINTS } from "@/constants/apiEndpoints";
import { COLORS, SIZES } from "@/constants/theme";
import httpClient from "@/utils/httpClient";
import { MaterialIcons } from "@expo/vector-icons";
import { Buffer } from "buffer";
import { LinearGradient } from "expo-linear-gradient";
import { useFocusEffect, useRouter } from "expo-router";
import React, { useCallback, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Dimensions,
  FlatList,
  Image,
  Linking,
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useDispatch } from "react-redux";

interface CWListResponse {
  success: boolean;
  message: string;
  data?: any;
}

const cwAll = () => {
  const dispatch = useDispatch();
  const router = useRouter();
  const [data, setData] = useState<any[]>([]);
  const [start, setStart] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [gatepassImage, setGatepassImage] = useState<string | null>(null);
  const [isModalVisible, setIsModalVisible] = useState(false);

  const PAGE_SIZE = 10;

  const resetState = () => {
    setData([]);
    setStart(0);
    setHasMore(true);
    setIsLoading(false);
  };

  const fetchData = async () => {
    if (!hasMore || isLoading) return;

    setIsLoading(true);
    dispatch(showLoading());

    try {
      const response = await httpClient.post<CWListResponse>(
        API_ENDPOINTS.CW.LIST,
        {
          start,
          length: PAGE_SIZE,
          search: "",
          meId: "0",
        }
      );

      const items = response.data?.data?.data ?? [];
      setData((prev) => [...prev, ...items]);
      setStart((prev) => prev + PAGE_SIZE);
      setHasMore(items.length === PAGE_SIZE);
    } catch (error) {
      console.error("Error fetching CW data:", error);
    } finally {
      setIsLoading(false);
      dispatch(hideLoading());
    }
  };

  const generateGatepass = async (id: string) => {
    dispatch(showLoading());
    try {
      const response = await httpClient.get(
        `${API_ENDPOINTS.CW.GENERATE_GATEPASS}?CwId=${id}`
      );

      const gatepassTemplate = response.data?.data.gatepassTemplate;
      // decode the base64 image
      const decodedTemplate = Buffer.from(gatepassTemplate, "base64").toString(
        "utf-8"
      );
      setGatepassImage(`data:image/png;base64,${gatepassTemplate}`);
      setIsModalVisible(true);
    } catch (error) {
      console.error("Error fetching CW data:", error);
    } finally {
      dispatch(hideLoading());
    }
  };

  const handleDownload = async () => {
    if (!gatepassImage) return;

    try {
      const supported = await Linking.canOpenURL(gatepassImage);
      if (supported) {
        await Linking.openURL(gatepassImage);
      } else {
        Alert.alert("Error", "Cannot download this file");
      }
    } catch (error) {
      console.error("Error downloading gatepass:", error);
      Alert.alert("Error", "Failed to download gatepass");
    }
  };

  useFocusEffect(
    useCallback(() => {
      resetState();
      fetchData();
    }, [])
  );

  const renderItem = ({ item }: { item: any }) => (
    <TouchableOpacity
      onPress={() => {
        router.replace(`/Vendor/CWDetails?id=${item.id}`);
      }}
      activeOpacity={0.85}
    >
      <LinearGradient
        colors={["#f0f0f0", "#f0f0f0", "#f0f0f0"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.card}
      >
        <View style={styles.content}>
          <InfoRow label="CW Name" value={item.cwName} />
          <InfoRow label="Contact" value={item.mobileNumber} />
          <InfoRow label="Gender" value={item.gender} />
          <InfoRow label="Blood Group" value={item.bloodGroup} />
          <InfoRow
            label="Vendor Details"
            value={`${item.vendorDetails?.vendorCode} (${item.vendorDetails?.vendorName})`}
          />
          <InfoRow
            label="Gatepass"
            value={item.gatepass === "NO" ? "❌" : "✅"}
          />
          <InfoRow
            label="Reg. Status"
            value={item.regStatus}
            valueStyle={styles.statusInProgress}
          />
          <InfoRow
            label="Status"
            value={item.status}
            valueStyle={styles.statusInactive}
          />
          <InfoRow
            label="Pending with"
            value={item.pendingWith
              ?.map((p: any) => `${p.name} (${p.roleName})`)
              .join(", ")}
          />
          <TouchableOpacity
            style={styles.button}
            onPress={() => {
              // Open a modal to generate gatepass
              generateGatepass(item.id);
            }}
          >
            <Text style={styles.buttonText}>Generate Gatepass</Text>
          </TouchableOpacity>
        </View>
      </LinearGradient>
    </TouchableOpacity>
  );

  return (
    <View style={{ flex: 1 }}>
      <Loader />
      <FlatList
        data={data}
        renderItem={renderItem}
        keyExtractor={(_, index) => index.toString()}
        contentContainerStyle={styles.container}
        showsVerticalScrollIndicator={false}
        onEndReached={fetchData}
        onEndReachedThreshold={0.5}
        ListFooterComponent={
          isLoading ? <ActivityIndicator size="small" color="#000" /> : null
        }
        ItemSeparatorComponent={() => <View style={styles.separator} />}
      />

      <Modal
        visible={isModalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setIsModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setIsModalVisible(false)}
            >
              <MaterialIcons name="close" size={24} color="#000" />
            </TouchableOpacity>

            {gatepassImage && (
              <Image
                source={{ uri: gatepassImage }}
                style={styles.gatepassImage}
                resizeMode="contain"
              />
            )}

            <TouchableOpacity
              style={styles.downloadButton}
              onPress={handleDownload}
            >
              <Text style={styles.downloadButtonText}>Download</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const InfoRow = ({
  label,
  value,
  valueStyle = {},
}: {
  label: string;
  value: string;
  valueStyle?: any;
}) => {
  return (
    <View style={styles.row}>
      <Text style={styles.label}>{label}</Text>
      <Text style={styles.colon}>:</Text>
      <Text style={[styles.value, valueStyle]}>{value}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
    backgroundColor: COLORS.background,
  },
  card: {
    borderRadius: 15,
    padding: 16,
    backgroundColor: "#fff",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 3.84,
    elevation: 4,
  },
  content: {
    gap: 6,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 4,
  },
  label: {
    flex: 3,
    fontSize: SIZES.medium,
    color: "#000",
    fontWeight: "500",
    textAlign: "left",
  },
  colon: {
    flex: 0.3,
    fontSize: SIZES.medium,
    color: "#000",
    textAlign: "center",
  },
  value: {
    flex: 3,
    fontSize: SIZES.medium,
    color: "#000",
    fontWeight: "600",
    textAlign: "center",
  },
  statusInProgress: {
    color: "#FFA500",
  },
  statusInactive: {
    color: "#FF4444",
  },
  separator: {
    height: 16,
  },
  button: {
    backgroundColor: COLORS.success,
    padding: 10,
    borderRadius: 5,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 10,
  },
  buttonText: {
    color: "#fff",
    fontSize: SIZES.medium,
    fontWeight: "600",
  },
  modalContainer: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    backgroundColor: "#fff",
    borderRadius: 15,
    padding: 20,
    width: Dimensions.get("window").width * 0.9,
    maxHeight: Dimensions.get("window").height * 0.8,
    alignItems: "center",
  },
  closeButton: {
    position: "absolute",
    right: 10,
    top: 10,
    zIndex: 1,
  },
  gatepassImage: {
    borderWidth: 1,
    borderColor: "red",
    width: "100%",
    height: Dimensions.get("window").height * 0.6,
    marginVertical: 20,
  },
  downloadButton: {
    backgroundColor: COLORS.success,
    padding: 12,
    borderRadius: 8,
    width: "100%",
    alignItems: "center",
  },
  downloadButtonText: {
    color: "#fff",
    fontSize: SIZES.medium,
    fontWeight: "600",
  },
});

export default cwAll;
