import { COLORS, FONTS, SIZES } from "@/constants/theme";
import { MaterialIcons } from "@expo/vector-icons";
import React from "react";
import {
  Alert,
  Image,
  Linking,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

interface FileData {
  uri: string;
  name: string;
  type: string;
}

interface FilePreviewProps {
  file: FileData;
}

const getFileIcon = (fileType: string) => {
  if (fileType.startsWith("image/")) {
    return "image";
  }

  const extension = fileType.split("/").pop()?.toLowerCase();
  switch (extension) {
    case "pdf":
      return "picture-as-pdf";
    case "doc":
    case "docx":
      return "description";
    case "xls":
    case "xlsx":
      return "table-chart";
    case "ppt":
    case "pptx":
      return "slideshow";
    case "txt":
      return "text-fields";
    default:
      return "insert-drive-file";
  }
};

const truncateFileName = (fileName: string, maxLength: number = 20) => {
  if (fileName.length <= maxLength) return fileName;
  const extension = fileName.split(".").pop();
  const nameWithoutExtension = fileName.slice(0, fileName.lastIndexOf("."));
  const truncatedName = nameWithoutExtension.slice(0, maxLength - 3) + "...";
  return `${truncatedName}.${extension}`;
};

export default function FilePreview({ file }: FilePreviewProps) {
  if (!file || !file.uri) {
    return (
      <View style={styles.filePreview}>
        <Text style={styles.noFileText}>No Documents Uploaded</Text>
      </View>
    );
  }

  const handleViewDocument = async () => {
    try {
      const supported = await Linking.canOpenURL(file.uri);
      if (supported) {
        await Linking.openURL(file.uri);
      } else {
        Alert.alert("Error", "Cannot open this file type");
      }
    } catch (error) {
      console.error("Error opening document:", error);
      Alert.alert("Error", "Failed to open document");
    }
  };

  if (file.type.startsWith("image/")) {
    return (
      <TouchableOpacity onPress={handleViewDocument}>
        <Image
          source={{ uri: file.uri }}
          style={styles.previewImage}
          resizeMode="cover"
        />
      </TouchableOpacity>
    );
  }

  return (
    <TouchableOpacity style={styles.filePreview} onPress={handleViewDocument}>
      <View style={styles.fileContent}>
        <MaterialIcons
          name={getFileIcon(file.type)}
          size={40}
          color={COLORS.primary}
        />
        <Text style={styles.fileName} numberOfLines={1}>
          {truncateFileName(file.name)}
        </Text>
        <Text style={styles.fileType}>
          {file.type.split("/").pop()?.toUpperCase()}
        </Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  previewImage: {
    width: 100,
    height: 100,
    marginVertical: 10,
    borderRadius: 8,
  },
  filePreview: {
    width: 120,
    height: 120,
    marginVertical: 10,
    padding: 10,
    backgroundColor: COLORS.veryLightGray,
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
  },
  fileContent: {
    alignItems: "center",
    justifyContent: "center",
  },
  fileName: {
    ...FONTS.medium,
    fontSize: SIZES.small,
    color: COLORS.text,
    marginTop: 8,
    textAlign: "center",
  },
  fileType: {
    ...FONTS.regular,
    fontSize: SIZES.small - 2,
    color: COLORS.gray,
    marginTop: 4,
  },
  noFileText: {
    ...FONTS.regular,
    fontSize: SIZES.small,
    color: COLORS.gray,
    fontStyle: "italic",
    textAlign: "center",
  },
});
