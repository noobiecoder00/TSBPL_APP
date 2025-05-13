import { COLORS, SIZES } from "@/constants/theme";
import { LinearGradient } from "expo-linear-gradient";
import React from "react";
import {
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

// Sample data array
const vendorData = Array(10).fill({
  dprNumber: "JMR -FAR/05-25/00001",
  dprDate: "Tools ",
  projectNo: "Wire Ropes",
  projectName: "31-05-2025",
  subProjectName: "11-05-2025",
  regStatus: "In Progress",
  status: "Inactive",
  pendingWith: "Construction Manager",
});

const customerBillingPending = () => {
  const renderItem = ({ item }: { item: (typeof vendorData)[0] }) => (
    <TouchableOpacity onPress={() => {}} activeOpacity={0.85}>
      <LinearGradient
        colors={["#f0f0f0", "#dcdcdc", "#c0c0c0"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.card}
      >
        <View style={styles.content}>
          <InfoRow label="JMR Number" value={item.dprNumber} />
          <InfoRow label="JMR Date" value={item.dprDate} />
          <InfoRow label="Project No" value={item.projectNo} />
          <InfoRow label="Project Name" value={item.projectName} />
          <InfoRow label="Sub Project Name" value={item.subProjectName} />
          <InfoRow
            label="Reg. Status"
            value={item.regStatus}
            valueStyle={
              item.regStatus === "In Progress"
                ? styles.statusInProgress
                : styles.statusInactive
            }
          />
          <InfoRow
            label="Status"
            value={item.status}
            valueStyle={
              item.status === "Pending"
                ? styles.statusInProgress
                : styles.statusInactive
            }
          />
          <InfoRow label="Pending With" value={item.pendingWith} />
        </View>
      </LinearGradient>
    </TouchableOpacity>
  );

  return (
    <FlatList
      data={vendorData}
      renderItem={renderItem}
      keyExtractor={(_, index) => index.toString()}
      contentContainerStyle={styles.container}
      showsVerticalScrollIndicator={false}
      ItemSeparatorComponent={() => <View style={styles.separator} />}
    />
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
    elevation: 6,
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
    color: "#FFC107",
  },
  statusInactive: {
    color: "#FF4444",
  },
  separator: {
    height: 16,
  },
});

export default customerBillingPending;
