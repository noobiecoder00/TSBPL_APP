import { useAppSelector } from "@/app/store/hooks";
import React from "react";
import { Dimensions, Image, Modal, StyleSheet, View } from "react-native";
import { ActivityIndicator } from "react-native-paper";

const Loader = () => {
  const loading = useAppSelector((x) => x.loading.loading);
  if (loading) {
    return (
      <View
        style={{
          zIndex: 999999999999,
          height: Dimensions.get("window").height,
          width: Dimensions.get("window").width,
          position: "absolute",
          left: 0,
          right: 0,
          bottom: 0,
        }}
      >
        <Modal animationType="fade" transparent={true} visible={loading}>
          <View className="flex-1 bg-black/50 justify-center items-center">
            <View
              style={{
                flex: 1,
                justifyContent: "center",
                alignItems: "center",
                height: 128,
              }}
              className=" bg-white"
            >
              <View>
                <Image
                  source={require("../assets/images/logo.png")}
                  style={{ width: 50, height: 50, position: "absolute" }}
                />
                <ActivityIndicator size={"large"} color={"#000000"} />
              </View>
            </View>
          </View>
        </Modal>
      </View>
    );
  } else {
    return <></>;
  }
};

export default Loader;

const styles = StyleSheet.create({});
