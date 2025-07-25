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

interface TpiExpiryResponse {
  success: boolean;
  message: string;
  data?: any;
  equipmentCategoryChecklists?: any[];
}

interface UserData {
  id: string;
}

const equipmentVendor = () => {
  const dispatch = useDispatch();
  const router = useRouter();
  const [data, setData] = useState<any[]>([]);
  const [start, setStart] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [userData, setUserData] = useState<UserData | null>(null);

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
    console.log("fetchData called");

    if (!hasMore) {
      console.log("No more data to load (hasMore is false)");
      return;
    }

    if (isLoading) {
      console.log("Currently loading, skipping fetch");
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
      const response = await httpClient.post<TpiExpiryResponse>(
        API_ENDPOINTS.SAFETY.TPI_EXPIRY,
        {
          AllId: Buffer.from(currentUserData.id.toString(), "utf-8").toString(
            "base64"
          ),
        }
      );

      const items = response.data?.data ?? [];
      console.log("Items received:", items.length);
      console.table(items);

      setData(items);
      setHasMore(false); // Since we're getting all data at once
    } catch (error) {
      console.error("Error fetching TPI expiry data:", error);
      if (error instanceof Error) {
        console.error("Error message:", error.message);
      }
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
        router.replace(`/Safety/tpiDetails?id=${item.equipmentId}`);
      }}
      activeOpacity={0.85}
    >
      <LinearGradient
        colors={["#fff9cc", "#fff2a8", "#ffec80"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.card}
      >
        <View style={styles.content}>
          <InfoRow label="Reference No" value={item.referenceNO} />
          <InfoRow label="Equipment Category" value={item.eqpCategory} />
          <InfoRow label="Equipment Name" value={item.equipmentName} />
          <InfoRow label="TPI Expiry Date" value={item.tpI_ExpirationDate} />
          <InfoRow label="Last Checked On" value={item.lastCheckedOn} />
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
        keyExtractor={(item) => item.equipmentId}
        contentContainerStyle={styles.container}
        showsVerticalScrollIndicator={false}
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
  warningText: {
    color: "#FF4444",
    fontSize: SIZES.medium,
    fontWeight: "600",
    textAlign: "center",
    marginTop: 8,
  },
});

export default equipmentVendor;
