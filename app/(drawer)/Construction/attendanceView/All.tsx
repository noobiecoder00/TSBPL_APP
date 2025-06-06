import { hideLoading, showLoading } from "@/app/store/loaderSlice";
import Loader from "@/components/Loader";
import { API_ENDPOINTS } from "@/constants/apiEndpoints";
import { COLORS, SIZES } from "@/constants/theme";
import httpClient from "@/utils/httpClient";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Buffer } from "buffer";
import { LinearGradient } from "expo-linear-gradient";
import { useFocusEffect, useRouter } from "expo-router";
import React, { useCallback, useState } from "react";
import {
  ActivityIndicator,
  Dimensions,
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useDispatch } from "react-redux";

interface ListResponse {
  success: boolean;
  message: string;
  data?: any;
}

interface UserData {
  id: string;
}

const All = () => {
  const dispatch = useDispatch();
  const router = useRouter();
  const [userData, setUserData] = useState<UserData | null>(null);
  const [data, setData] = useState<any[]>([]);
  const [start, setStart] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [isLoading, setIsLoading] = useState(false);

  const PAGE_SIZE = 10;

  const resetState = () => {
    setData([]);
    setStart(0);
    setHasMore(true);
    setIsLoading(false);
  };

  const loadUserData = async () => {
    try {
      const userDataString = await AsyncStorage.getItem("userData");
      if (userDataString) {
        const parsedData = JSON.parse(userDataString);
        setUserData(parsedData);
        return parsedData;
      }
      return null;
    } catch (error) {
      console.error("Error loading user data:", error);
      return null;
    }
  };

  const fetchData = async () => {
    if (!hasMore || isLoading) {
      return;
    }

    setIsLoading(true);
    dispatch(showLoading());

    try {
      // Ensure we have user data
      let currentUserData = userData;
      if (!currentUserData?.id) {
        currentUserData = await loadUserData();
        if (!currentUserData?.id) {
          console.log("User data not available");
          return;
        }
      }
      console.log("payload", {
        start,
        length: PAGE_SIZE,
        search: "",
        meId: "0",
        AllId: Buffer.from(currentUserData.id.toString(), "utf-8").toString(
          "base64"
        ),
      });
      const response = await httpClient.post<ListResponse>(
        API_ENDPOINTS.ATTENDANCE.LIST,
        {
          start,
          length: PAGE_SIZE,
          search: "",
          meId: "0",
          AllId: Buffer.from(currentUserData.id.toString(), "utf-8").toString(
            "base64"
          ),
        },
        { timeout: 10000 }
      );

      const items = response.data?.data?.data ?? [];
      console.log("items", items);
      setData((prev) => [...prev, ...items]);
      setStart((prev) => prev + PAGE_SIZE);
      setHasMore(items.length === PAGE_SIZE);
    } catch (error) {
      console.error("Error fetching data:", error);
      return;
    } finally {
      setIsLoading(false);
      dispatch(hideLoading());
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
        router.replace(`/Construction/attendanceView/details?id=${item.id}`);
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
          <InfoRow label="Project No." value={item.projectNumber} />
          <InfoRow label="Project Name" value={item.project_Name} />
          <InfoRow label="Sub Project Name" value={item.subProjectName} />
          <InfoRow label="Vendor" value={item.vendorName} />
          <InfoRow label="Total In" value={item.totalIn} />
          <InfoRow label="Total Out" value={item.totalOut} />
          <InfoRow
            label="Status"
            value={item.status?.toUpperCase()}
            valueStyle={
              item.status?.toLowerCase() === "pending"
                ? styles.statusPending
                : item.status?.toLowerCase() === "completed"
                ? styles.statusCompleted
                : null
            }
          />
          <InfoRow
            label="Pending with"
            value={item.pendingWith
              ?.map((p: any) => `${p.name} (${p.roleName})`)
              .join(", ")}
          />
          <InfoRow label="Created Date Time" value={item.createdDateTime} />
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
  statusPending: {
    color: "#FFA500",
  },
  statusCompleted: {
    color: "#008000",
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

export default All;
