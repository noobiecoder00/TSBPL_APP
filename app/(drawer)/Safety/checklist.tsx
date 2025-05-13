import { COLORS, SIZES } from "@/constants/theme";
import React from "react";
import { FlatList, StyleSheet, Text, View } from "react-native";

// Sample data array
const vendorData = Array(10).fill({
  cwName: "EQP-FAR/05-25/00001",
  contact: "Tools ",
  gender: "Wire Ropes",
  bloodGroup: "31-05-2025",
  vendorDetails: "11-05-2025",
  department: "Pending",
});

const checklist = () => {
  const renderItem = ({ item }: { item: (typeof vendorData)[0] }) => (
    <View style={styles.card}>
      <View style={styles.content}>
        <InfoRow label="Reference No" value={item.cwName} />
        <InfoRow label="Equipment Category" value={item.contact} />
        <InfoRow label="Equipment Name" value={item.gender} />
        <InfoRow label="TPI Expiry Date" value={item.bloodGroup} />
        <InfoRow label="Last Checked On" value={item.vendorDetails} />
        <InfoRow label="Actions" value={item.department} />
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

export default checklist;
