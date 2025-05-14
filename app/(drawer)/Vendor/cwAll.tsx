import { hideLoading, showLoading } from "@/app/store/loaderSlice";
import Loader from "@/components/Loader";
import { API_ENDPOINTS } from "@/constants/apiEndpoints";
import { COLORS, SIZES } from "@/constants/theme";
import httpClient from "@/utils/httpClient";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
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

  const PAGE_SIZE = 10;

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

  useEffect(() => {
    fetchData();
  }, []);

  const renderItem = ({ item }: { item: any }) => (
    <TouchableOpacity
      onPress={() => {
        router.push(`/Vendor/CWDetails?id=${item.id}`);
      }}
      activeOpacity={0.85}
    >
      <LinearGradient
        colors={["#f0f0f0", "#dcdcdc", "#c0c0c0"]}
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
});

export default cwAll;
