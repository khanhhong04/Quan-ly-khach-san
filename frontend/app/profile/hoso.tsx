import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  Modal,
  Animated,
  ScrollView,
} from "react-native";
import Icon from "react-native-vector-icons/Ionicons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";

export default function HoSo() {
  const router = useRouter();
  const [isDeleteModalVisible, setIsDeleteModalVisible] = useState(false);
  const [isTermsModalVisible, setIsTermsModalVisible] = useState(false);
  const [isHelpModalVisible, setIsHelpModalVisible] = useState(false);

  const [userInfo, setUserInfo] = useState({
    name: "",
    email: "",
    phone: "",
  });

  const waveAnimation = new Animated.Value(0);

  useEffect(() => {
    const wave = () => {
      Animated.loop(
        Animated.sequence([
          Animated.timing(waveAnimation, {
            toValue: 1,
            duration: 300,
            useNativeDriver: true,
          }),
          Animated.timing(waveAnimation, {
            toValue: 0,
            duration: 300,
            useNativeDriver: true,
          }),
        ])
      ).start();
    };
    wave();
  }, [waveAnimation]);

  const waveRotate = waveAnimation.interpolate({
    inputRange: [0, 1],
    outputRange: ["15deg", "45deg"],
  });

  useEffect(() => {
    const fetchUserInfo = async () => {
      try {
        const userInfoString = await AsyncStorage.getItem("userInfo");
        if (userInfoString) {
          const user = JSON.parse(userInfoString);
          setUserInfo({
            name: user.HoTen || "",
            email: user.Email || "",
            phone: user.SoDienThoai || "",
          });
        }
      } catch (error) {
        console.error("Lỗi khi lấy thông tin người dùng", error);
      }
    };
    fetchUserInfo();
  }, []);

  const handleDeleteAccount = () => {
    console.log("Xóa tài khoản được thực hiện");
    setIsDeleteModalVisible(false);
  };

  const handleLogout = () => {
    console.log("Đăng xuất được thực hiện");
    router.push("/");
  };

  // Hàm điều hướng đến các trang khác với expo-router
  const navigateTo = (path) => {
    try {
      // Đảm bảo path không rỗng và là chuỗi hợp lệ
      if (!path || typeof path !== "string") {
        console.error("Đường dẫn không hợp lệ:", path);
        return;
      }

      // Điều hướng với expo-router
      router.push(path);
    } catch (error) {
      console.error("Lỗi khi điều hướng:", error);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.scrollViewContent}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()}>
            <Icon name="arrow-back" size={24} color="#fff" />
          </TouchableOpacity>
          <View style={styles.headerTitleContainer}>
            <Text style={styles.headerTitle}>Chào Mừng Bạn</Text>
            <Animated.View
              style={[styles.wavingIcon, { transform: [{ rotate: waveRotate }] }]}
            >
              <Icon name="hand-right-outline" size={24} color="#fff" />
            </Animated.View>
          </View>
          <View style={styles.emptySpace} />
        </View>

        <View style={styles.infoContainer}>
          <Text style={styles.sectionTitle}>THÔNG TIN TÀI KHOẢN</Text>
          <View style={styles.infoRow}>
            <Icon name="person-outline" size={20} color="#666" />
            <Text style={styles.infoLabel}>Tên đầy đủ:</Text>
            <Text style={styles.infoValue}>{userInfo.name}</Text>
          </View>
          <View style={styles.infoRow}>
            <Icon name="mail-outline" size={20} color="#666" />
            <Text style={styles.infoLabel}>Email:</Text>
            <Text style={styles.infoValue}>{userInfo.email}</Text>
          </View>
          <View style={styles.infoRow}>
            <Icon name="call-outline" size={20} color="#666" />
            <Text style={styles.infoLabel}>Số điện thoại:</Text>
            <Text style={styles.infoValue}>{userInfo.phone}</Text>
          </View>
        </View>

        <View style={styles.actionsContainer}>
          <Text style={styles.sectionTitle}>CHUYẾN ĐI</Text>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => navigateTo("/(tabs)/favorites")}
          >
            <Icon name="heart-outline" size={20} color="#666" />
            <Text style={styles.actionText}>Căn hộ yêu thích</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => navigateTo("/(tabs)/index")}
          >
            <Icon name="list-outline" size={20} color="#666" />
            <Text style={styles.actionText}>Danh sách chuyến đi</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.actionsContainer}>
          <Text style={styles.sectionTitle}>HỖ TRỢ</Text>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => setIsHelpModalVisible(true)}
          >
            <Icon name="help-circle-outline" size={20} color="#666" />
            <Text style={styles.actionText}>Trung tâm trợ giúp</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => setIsTermsModalVisible(true)}
          >
            <Icon name="document-text-outline" size={20} color="#666" />
            <Text style={styles.actionText}>Điều khoản sử dụng</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionButton} onPress={() => {}}>
            <Icon name="notifications-outline" size={20} color="#666" />
            <Text style={styles.actionText}>Thông báo</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          style={styles.deleteButton}
          onPress={() => setIsDeleteModalVisible(true)}
        >
          <Icon name="person-outline" size={20} color="#000" />
          <Text style={styles.deleteButtonText}>Xóa tài khoản của tôi</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Text style={styles.logoutButtonText}>Đăng xuất</Text>
        </TouchableOpacity>
      </ScrollView>

      <Modal
        visible={isTermsModalVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setIsTermsModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Điều khoản sử dụng</Text>
            </View>
            <View style={styles.modalContent}>
              <Text style={styles.modalSectionTitle}>
                1. Chấm dứt tài khoản
              </Text>
              <Text style={styles.modalText}>
                Chúng tôi có quyền khóa hoặc xóa tài khoản nếu phát hiện khách
                hàng vi phạm điều khoản sử dụng.
              </Text>
              <Text style={styles.modalText}>
                Khách hàng có thể yêu cầu chấm dứt tài khoản bằng cách liên hệ
                với bộ phận hỗ trợ.
              </Text>
              <Text style={styles.modalSectionTitle}>
                2. Thay đổi điều khoản
              </Text>
              <Text style={styles.modalText}>
                Chúng tôi có quyền thay đổi điều khoản sử dụng và sẽ thông báo
                đến khách hàng.
              </Text>
              <Text style={styles.modalText}>
                Việc tiếp tục sử dụng hệ thống sau khi thay đổi điều khoản đồng
                nghĩa với việc khách hàng đồng ý với các thay đổi đó.
              </Text>
              <TouchableOpacity
                style={styles.closeButton}
                onPress={() => setIsTermsModalVisible(false)}
              >
                <Text style={styles.closeButtonText}>Đóng</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      <Modal
        visible={isHelpModalVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setIsHelpModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Trung tâm trợ giúp</Text>
            </View>
            <View style={styles.modalContent}>
              <Text style={styles.modalText}>Liên hệ tới Sdt: 098 xxx xxx</Text>
              <Text style={[styles.modalText, styles.modalTextTight]}>
                Email: email@gmail.com
              </Text>
              <TouchableOpacity
                style={styles.closeButton}
                onPress={() => setIsHelpModalVisible(false)}
              >
                <Text style={styles.closeButtonText}>Đóng</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      <Modal
        visible={isDeleteModalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setIsDeleteModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.deleteModalContainer}>
            <Text style={styles.deleteModalTitle}>
              Bạn muốn xóa tài khoản không?
            </Text>
            <View style={styles.deleteModalButtons}>
              <TouchableOpacity
                style={[styles.deleteModalButton, styles.deleteModalButtonYes]}
                onPress={handleDeleteAccount}
              >
                <Text style={styles.deleteModalButtonText}>Có</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.deleteModalButton, styles.deleteModalButtonNo]}
                onPress={() => setIsDeleteModalVisible(false)}
              >
                <Text style={styles.deleteModalButtonText}>Không</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#f4f4f4",
  },
  scrollViewContent: {
    paddingBottom: 20,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 20,
    paddingTop: 40,
    backgroundColor: "#2C3E50",
  },
  headerTitleContainer: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    justifyContent: "center",
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#fff",
    textAlign: "center",
  },
  wavingIcon: {
    marginLeft: 8,
  },
  emptySpace: {
    width: 24,
  },
  infoContainer: {
    backgroundColor: "#fff",
    marginHorizontal: 10,
    marginVertical: 5,
    borderRadius: 10,
    padding: 15,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 10,
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 5,
  },
  infoLabel: {
    fontSize: 14,
    color: "#666",
    marginLeft: 10,
    flex: 1,
  },
  infoValue: {
    fontSize: 14,
    color: "#333",
    flex: 1,
  },
  actionsContainer: {
    backgroundColor: "#fff",
    marginHorizontal: 10,
    marginVertical: 10,
    borderRadius: 10,
    padding: 15,
  },
  actionButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
  },
  actionText: {
    fontSize: 14,
    color: "#333",
    marginLeft: 10,
    flex: 1,
  },
  deleteButton: {
    marginHorizontal: 10,
    marginVertical: 10,
    padding: 15,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#000",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  deleteButtonText: {
    fontSize: 16,
    color: "#000",
    marginLeft: 10,
  },
  logoutButton: {
    marginHorizontal: 10,
    marginVertical: 10,
    padding: 15,
    borderRadius: 10,
    backgroundColor: "#000",
    alignItems: "center",
  },
  logoutButtonText: {
    fontSize: 16,
    color: "#fff",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContainer: {
    backgroundColor: "#fff",
    width: "90%",
    maxHeight: "80%",
    borderRadius: 10,
    padding: 20,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
    textAlign: "center",
  },
  modalContent: {
    minHeight: 200,
  },
  modalSectionTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
    marginTop: 10,
    marginBottom: 5,
  },
  modalText: {
    fontSize: 14,
    color: "#333",
    marginBottom: 10,
    textAlign: "left",
  },
  modalTextCentered: {
    textAlign: "center",
  },
  modalTextTight: {
    marginBottom: 5,
  },
  closeButton: {
    marginTop: 20,
    padding: 10,
    backgroundColor: "#00C4B4",
    borderRadius: 5,
    alignItems: "center",
  },
  closeButtonText: {
    fontSize: 16,
    color: "#fff",
    fontWeight: "bold",
  },
  deleteModalContainer: {
    backgroundColor: "#fff",
    width: "80%",
    borderRadius: 10,
    padding: 20,
    alignItems: "center",
  },
  deleteModalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 20,
    textAlign: "center",
  },
  deleteModalButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
  },
  deleteModalButton: {
    flex: 1,
    padding: 10,
    borderRadius: 5,
    alignItems: "center",
    marginHorizontal: 5,
  },
  deleteModalButtonYes: {
    backgroundColor: "#FF0000",
  },
  deleteModalButtonNo: {
    backgroundColor: "#00C4B4",
  },
  deleteModalButtonText: {
    fontSize: 16,
    color: "#fff",
    fontWeight: "bold",
  },
});