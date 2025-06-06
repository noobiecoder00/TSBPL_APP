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
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useDispatch } from "react-redux";

interface CustomerBillingItem {
  serialNo: number;
  jmR_Number: string;
  jmR_Date: string;
  projectNo: string;
  projectName: string;
  subProject: string;
  regStatus: string;
  status: string;
  pendingWith: Array<{
    name: string;
    roleName: string;
  }>;
  createdDateTime: string;
  id: string;
}

interface CustomerBillingListResponse {
  success: boolean;
  message: string;
  data?: {
    draw: number;
    recordsTotal: number;
    recordsFiltered: number;
    data: CustomerBillingItem[];
  };
}

interface UserData {
  id: string;
}

const customerBillingPending = () => {
  const dispatch = useDispatch();
  const router = useRouter();
  const [data, setData] = useState<CustomerBillingItem[]>([]);
  const [start, setStart] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [userData, setUserData] = useState<UserData | null>(null);
  const [error, setError] = useState<string | null>(null);

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
    if (!hasMore || isLoading) return;

    setIsLoading(true);
    dispatch(showLoading());
    setError(null);

    try {
      // Ensure we have user data
      let currentUserData = userData;
      if (!currentUserData?.id) {
        currentUserData = await loadUserData();
        if (!currentUserData?.id) {
          setError("User data not available");
          return;
        }
      }

      const response = await httpClient.post<CustomerBillingListResponse>(
        API_ENDPOINTS.CUSTOMER_BILLING.LIST,
        {
          start,
          length: PAGE_SIZE,
          search: "",
          meId: Buffer.from(currentUserData.id.toString(), "utf-8").toString(
            "base64"
          ),
          AllId: Buffer.from(currentUserData.id.toString(), "utf-8").toString(
            "base64"
          ),
        }
      );

      const items = response.data?.data?.data ?? [];
      setData((prev) => [...prev, ...items]);
      setStart((prev) => prev + PAGE_SIZE);
      setHasMore(items.length === PAGE_SIZE);
    } catch (error) {
      console.error("Error fetching DPR data:", error);
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

  const renderItem = ({ item }: { item: CustomerBillingItem }) => (
    <TouchableOpacity
      onPress={() => {
        router.replace(
          `/(drawer)/Construction/CustomerBilling/customerBillingDetails?id=${item.id}`
        );
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
          <InfoRow label="JMR Number" value={item.jmR_Number} />
          <InfoRow label="JMR Date" value={item.jmR_Date} />
          <InfoRow label="Project No" value={item.projectNo} />
          <InfoRow label="Project Name" value={item.projectName} />
          <InfoRow label="Sub Project Name" value={item.subProject} />
          <InfoRow
            label="Reg. Status"
            value={item.regStatus}
            valueStyle={
              item.regStatus === "IN PROGRESS"
                ? styles.statusInProgress
                : styles.statusCompleted
            }
          />
          <InfoRow
            label="Status"
            value={item.status}
            valueStyle={
              item.status === "ACTIVE"
                ? styles.statusActive
                : item.status === "INACTIVE"
                ? styles.statusInactive
                : styles.statusCompleted
            }
          />
          <InfoRow
            label="Pending with"
            value={item.pendingWith
              ?.map(
                (p: { name: string; roleName: string }) =>
                  `${p.name} (${p.roleName})`
              )
              .join(", ")}
          />
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
  statusInactive: {
    color: "#FF4444",
  },
  separator: {
    height: 16,
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  errorText: {
    color: "#FF4444",
    fontSize: SIZES.medium,
    textAlign: "center",
    marginBottom: 16,
  },
  retryButton: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  retryButtonText: {
    color: "#fff",
    fontSize: SIZES.medium,
    fontWeight: "600",
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  emptyText: {
    color: "#666",
    fontSize: SIZES.medium,
    textAlign: "center",
  },
  statusActive: {
    color: "#008000",
  },
  statusCompleted: {
    color: "#008000",
  },
});

export default customerBillingPending;
