import { COLORS, SIZES } from "@/constants/theme";
import React from "react";
import { FlatList, StyleSheet, Text, View } from "react-native";

// Sample data array
const vendorData = Array(10).fill({
  cwName: "Sumit Kumar",
  contact: "1234567890",
  gender: "M",
  bloodGroup: "A+",
  vendorDetails: "V000123 (Test)",
  department: "IT Department",
  regStatus: "In Progress",
  status: "Inactive",
  logs: "-",
  pendingWith: "Amit (Admin)",
});

const cwAll = () => {
  const renderItem = ({ item }: { item: (typeof vendorData)[0] }) => (
    <View style={styles.card}>
      <View style={styles.content}>
        <InfoRow label="CW Name" value={item.cwName} />
        <InfoRow label="Contact" value={item.contact} />
        <InfoRow label="Gender" value={item.gender} />
        <InfoRow label="Blood Group" value={item.bloodGroup} />
        <InfoRow label="Vendor Details" value={item.vendorDetails} />
        <InfoRow label="Department" value={item.department} />
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
        <InfoRow label="Logs" value={item.logs} />
        <InfoRow label="Pending with" value={item.pendingWith} />
      </View>
    </View>
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
    textAlign: "right",
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
