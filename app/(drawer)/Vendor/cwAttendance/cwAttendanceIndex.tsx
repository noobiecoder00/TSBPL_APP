import { hideLoading, showLoading } from "@/app/store/loaderSlice";
import { CustomAlert } from "@/components/CustomAlert";
import { API_ENDPOINTS } from "@/constants/apiEndpoints";
import { COLORS, SIZES } from "@/constants/theme";
import httpClient from "@/utils/httpClient";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  BarcodeScanningResult,
  CameraView,
  useCameraPermissions,
} from "expo-camera";
import * as Location from "expo-location";
import { useFocusEffect, useRouter } from "expo-router";
import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import {
  AutocompleteDropdown,
  AutocompleteDropdownContextProvider,
  IAutocompleteDropdownRef,
} from "react-native-autocomplete-dropdown";
import { useDispatch } from "react-redux";
interface ProjectNo {
  value: number;
  text: string;
}

interface SubProject {
  id: number;
  buildingName: string;
}
interface UserData {
  id: string;
}

const CWAttendance = () => {
  const router = useRouter();
  const dispatch = useDispatch();
  const [cameraPermission, requestPermission] = useCameraPermissions();
  const [locationPermission, setLocationPermission] =
    useState<Location.PermissionStatus | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const isPermissionGranted = Boolean(cameraPermission?.granted);
  const [projectNos, setProjectNos] = useState<ProjectNo[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedProjectNo, setSelectedProjectNo] = useState<number | null>(
    null
  );
  const [subProjects, setSubProjects] = useState<SubProject[]>([]);
  const [selectedSubProject, setSelectedSubProject] = useState<number | null>(
    null
  );
  const projectNoRef = useRef(null);
  const subProjectRef = useRef(null);
  const projectNoDropdownController = useRef<IAutocompleteDropdownRef>(null);
  const subProjectDropdownController = useRef<IAutocompleteDropdownRef>(null);
  const [error, setError] = useState<string | null>(null);
  const [userData, setUserData] = useState<UserData | null>(null);
  const [currentLocation, setCurrentLocation] = useState<{
    latitude: number;
    longitude: number;
  } | null>(null);

  const [alert, setAlert] = useState<{
    visible: boolean;
    message: string;
    type: "success" | "error" | "info";
    onClose?: () => void;
    redirect?: boolean;
    redirectPath?: string;
  }>({
    visible: false,
    message: "",
    type: "info",
  });

  useFocusEffect(
    useCallback(() => {
      resetStates();
      loadUserData();
      fetchProjectNos();
    }, [])
  );

  useEffect(() => {
    if (selectedProjectNo) {
      fetchSubProjects();
    }
  }, [selectedProjectNo]);

  useEffect(() => {
    checkLocationPermission();
  }, []);

  const loadUserData = async () => {
    try {
      const userDataString = await AsyncStorage.getItem("userData");
      if (userDataString) {
        setUserData(JSON.parse(userDataString));
      }
    } catch (error) {
      console.error("Error loading user data:", error);
    }
  };

  const RequiredLabel = ({ label }: { label: string }) => (
    <Text style={styles.label}>
      {label}
      <Text style={styles.required}> *</Text>
    </Text>
  );

  const fetchProjectNos = async () => {
    try {
      dispatch(showLoading());
      setError(null);
      const response = await httpClient.get(API_ENDPOINTS.PROJECT_NO.LIST);
      setProjectNos(response.data);
    } catch (error) {
      console.error("Error fetching project nos:", error);
      setError("Failed to load project nos. Please try again.");
    } finally {
      dispatch(hideLoading());
    }
  };

  const fetchSubProjects = async () => {
    try {
      dispatch(showLoading());
      setError(null);
      const response = await httpClient.get(
        `${API_ENDPOINTS.SUB_PROJECT_NO.LIST}?id=${selectedProjectNo}`
      );
      setSubProjects(response.data);
    } catch (error) {
      console.error("Error fetching sub projects:", error);
      setError("Failed to load sub projects. Please try again.");
    } finally {
      dispatch(hideLoading());
    }
  };

  const validateForm = () => {
    if (!selectedProjectNo) {
      Alert.alert("Please select a project number.");
      projectNoDropdownController.current?.toggle();
      return false;
    }
    if (!selectedSubProject) {
      Alert.alert("Please select a sub project.");
      subProjectDropdownController.current?.toggle();
      return false;
    }
    return true;
  };

  const checkLocationPermission = async () => {
    try {
      const { status } = await Location.getForegroundPermissionsAsync();
      setLocationPermission(status);
      if (status === "granted") {
        const location = await Location.getCurrentPositionAsync({});
        setCurrentLocation({
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
        });
      }
    } catch (error) {
      console.error("Error checking location permission:", error);
    }
  };

  const requestLocationPermission = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      setLocationPermission(status);
      if (status === "granted") {
        const location = await Location.getCurrentPositionAsync({});
        setCurrentLocation({
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
        });
      }
    } catch (error) {
      console.error("Error getting location permission:", error);
    }
  };

  const handleTakeAttendance = async () => {
    if (!validateForm()) {
      return;
    }

    if (!isPermissionGranted) {
      const permission = await requestPermission();
      if (!permission.granted) {
        return;
      }
    }

    if (!currentLocation) {
      if (locationPermission !== "granted") {
        await requestLocationPermission();
      } else {
        try {
          const location = await Location.getCurrentPositionAsync({});
          setCurrentLocation({
            latitude: location.coords.latitude,
            longitude: location.coords.longitude,
          });
        } catch (error) {
          console.error("Error getting current location:", error);
        }
      }
    }

    // if (!currentLocation) {
    //   Alert.alert(
    //     "Location Permission Required",
    //     "Please enable location services to take attendance."
    //   );
    //   return;
    // }

    setIsScanning(true);
  };

  const handleBarcodeScanned = async ({ data }: BarcodeScanningResult) => {
    console.log("Scanned QR Code Data:", data);
    setIsScanning(false);

    if (!currentLocation) {
      Alert.alert("Error", "Location not available. Please try again.");
      setIsScanning(true);
      return;
    }

    try {
      const parsedData = JSON.parse(data);
      dispatch(showLoading());

      const attendanceData = {
        vid: parsedData?.vendorId,
        CW_Id: parsedData.cwId,
        Attendance_Taker_IN_Id: userData?.id,
        In_Lat_Long: `${currentLocation.latitude},${currentLocation.longitude}`,
        ProjectId: selectedProjectNo,
        SubProjectId: selectedSubProject,
        Attendance_Taker_OUT_Id: userData?.id,
        Out_Lat_Long: `${currentLocation.latitude},${currentLocation.longitude}`,
      };

      console.log("Attendance Data:", attendanceData);
      const response = await httpClient.post(
        API_ENDPOINTS.VENDOR.TAKE_ATTENDANCE,
        attendanceData
      );

      console.log("Response:", response.data);
      if (response.data.success) {
        setAlert({
          visible: true,
          message: response.data.message,
          type: "success",
          onClose: () => {
            setAlert((prev) => ({ ...prev, visible: false }));
          },
        });
        setTimeout(() => {
          setIsScanning(true);
        }, 1500);
      } else {
        setAlert({
          visible: true,
          message: response.data.message || "Failed to submit attendance",
          type: "error",
          onClose: () => {
            setAlert((prev) => ({ ...prev, visible: false }));
          },
        });
        setTimeout(() => {
          setIsScanning(true);
        }, 1500);
      }
    } catch (error: any) {
      console.error("Error submitting attendance:", error);
      setAlert({
        visible: true,
        message: error.response?.data?.message || "Failed to submit attendance",
        type: "error",
        onClose: () => {
          setAlert((prev) => ({ ...prev, visible: false }));
        },
      });
      setTimeout(() => {
        setIsScanning(true);
      }, 1500);
    } finally {
      dispatch(hideLoading());
    }
  };

  const resetStates = () => {
    setProjectNos([]);
    setSelectedProjectNo(null);
    setSubProjects([]);
    setSelectedSubProject(null);
    setIsScanning(false);
    // Reset dropdown controllers
    projectNoDropdownController.current?.clear();
    subProjectDropdownController.current?.clear();
  };

  // Transform data for autocomplete dropdown
  const projectNoItems = projectNos.map((project) => ({
    id: project.value.toString(),
    title: project.text,
  }));

  const subProjectItems = subProjects.map((subProject) => ({
    id: subProject.id.toString(),
    title: subProject.buildingName,
  }));

  return (
    <AutocompleteDropdownContextProvider>
      {isScanning ? (
        <View style={StyleSheet.absoluteFill}>
          <CameraView
            style={StyleSheet.absoluteFill}
            facing="back"
            onBarcodeScanned={handleBarcodeScanned}
          />
        </View>
      ) : (
        <ScrollView
          keyboardShouldPersistTaps="handled"
          style={styles.container}
        >
          <View style={{ zIndex: 2 }}>
            <RequiredLabel label="Project Number" />
            <AutocompleteDropdown
              ref={projectNoRef}
              controller={(controller) => {
                projectNoDropdownController.current = controller;
              }}
              clearOnFocus={false}
              closeOnBlur={true}
              closeOnSubmit={false}
              initialValue={
                selectedProjectNo ? selectedProjectNo.toString() : undefined
              }
              onSelectItem={(item) => {
                if (item) {
                  setSelectedProjectNo(parseInt(item.id));
                } else {
                  setSelectedProjectNo(null);
                }
              }}
              dataSet={projectNoItems}
              containerStyle={styles.dropdownContainer}
              inputContainerStyle={styles.dropdownInputContainer}
              textInputProps={{
                placeholder: "-- Select Project --",
                style: styles.dropdownTextInput,
              }}
              suggestionsListContainerStyle={{
                backgroundColor: COLORS.background,
              }}
              suggestionsListTextStyle={{
                color: COLORS.text,
              }}
              EmptyResultComponent={
                <Text style={{ padding: 10, fontSize: SIZES.medium }}>
                  No projects found
                </Text>
              }
            />
          </View>

          <View style={{ zIndex: 1, marginTop: 20 }}>
            <RequiredLabel label="Sub Project" />
            <AutocompleteDropdown
              ref={subProjectRef}
              controller={(controller) => {
                subProjectDropdownController.current = controller;
              }}
              clearOnFocus={false}
              closeOnBlur={true}
              closeOnSubmit={false}
              initialValue={
                selectedSubProject ? selectedSubProject.toString() : undefined
              }
              onSelectItem={(item) => {
                if (item) {
                  setSelectedSubProject(parseInt(item.id));
                } else {
                  setSelectedSubProject(null);
                }
              }}
              dataSet={subProjectItems}
              containerStyle={styles.dropdownContainer}
              inputContainerStyle={styles.dropdownInputContainer}
              textInputProps={{
                placeholder: "-- Select Sub Project --",
                style: styles.dropdownTextInput,
              }}
              suggestionsListContainerStyle={{
                backgroundColor: COLORS.background,
              }}
              suggestionsListTextStyle={{
                color: COLORS.text,
              }}
              EmptyResultComponent={
                <Text style={{ padding: 10, fontSize: SIZES.medium }}>
                  No sub projects found
                </Text>
              }
            />
          </View>

          <TouchableOpacity
            style={styles.createButton}
            onPress={handleTakeAttendance}
          >
            <Text style={styles.createButtonText}>Take Attendance</Text>
          </TouchableOpacity>

          <CustomAlert
            visible={alert.visible}
            message={alert.message}
            type={alert.type}
            onClose={() => {
              setAlert((prev) => ({ ...prev, visible: false }));
            }}
            redirect={alert.redirect}
            redirectPath={alert.redirectPath}
          />
        </ScrollView>
      )}
    </AutocompleteDropdownContextProvider>
  );
};

export default CWAttendance;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    padding: 16,
  },
  createButton: {
    margin: 2,
    marginTop: 20,
    paddingVertical: 12,
    paddingHorizontal: 10,
    backgroundColor: COLORS.primary || "#4A90E2",
    borderRadius: 8,
    alignItems: "center",
  },
  createButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  label: {
    fontSize: SIZES.medium,
    fontWeight: "500",
    marginBottom: 8,
  },
  required: {
    color: "red",
  },
  formGroup: {
    marginBottom: 16,
  },
  dropdownContainer: {
    flex: 1,
    width: "100%",
    zIndex: 10,
  },
  dropdownInputContainer: {
    backgroundColor: COLORS.background,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.gray,
    paddingHorizontal: 10,
  },
  dropdownTextInput: {
    paddingVertical: 12,
    fontSize: 16,
    color: COLORS.text,
    width: "100%",
  },
});
