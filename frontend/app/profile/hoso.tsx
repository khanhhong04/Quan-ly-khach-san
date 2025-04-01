import React, { useState, useEffect } from "react";
import {View,Text,StyleSheet,TouchableOpacity,Image,Modal,ScrollView,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context"; // Sửa import
import Icon from "react-native-vector-icons/Ionicons";
import AsyncStorage from "@react-native-async-storage/async-storage"; // Import đúng
import { useRouter } from "expo-router";

export default function HoSo() {
  const router = useRouter();
  const [isTermsModalVisible, setIsTermsModalVisible] = useState(false);
  const [isDeleteModalVisible, setIsDeleteModalVisible] = useState(false);
  
  // Khai báo userInfo ngay trong HoSo
  const [userInfo, setUserInfo] = useState({
    name: "",
    email: "",
    phone: "",
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

  // Khai báo handleDeleteAccount trong HoSo
  const handleDeleteAccount = () => {
    console.log("Xóa tài khoản được thực hiện");
    setIsDeleteModalVisible(false);
  };

  
  return (
    <SafeAreaView style={styles.safeArea}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Icon name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Hồ Sơ</Text>
      </View>

      {/* Avatar */}
      <View style={styles.avatarContainer}>
        <Image
          source={{ uri: "https://via.placeholder.com/100" }}
          style={styles.avatar}
        />
      </View>

      {/* Thông tin cá nhân */}
      <View style={styles.infoContainer}>
        <Text style={styles.sectionTitle}>THÔNG TIN CÁ NHÂN</Text>
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

      {/* Nút Điều khoản sử dụng */}
      <View style={styles.actionsContainer}>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => setIsTermsModalVisible(true)}
        >
          <Icon name="document-text-outline" size={20} color="#666" />
          <Text style={styles.actionText}>Điều khoản sử dụng</Text>
        </TouchableOpacity>
      </View>

      {/* Nút Xóa tài khoản */}
      <TouchableOpacity
        style={styles.deleteButton}
        onPress={() => setIsDeleteModalVisible(true)}
      >
        <Text style={styles.deleteButtonText}>Xóa tài khoản</Text>
      </TouchableOpacity>

      {/* Nút Đăng xuất */}
      <TouchableOpacity style={styles.logoutButton} onPress={() => router.push('/')}>
        <Text style={styles.logoutButtonText} >Đăng xuất</Text>
      </TouchableOpacity>

      {/* Modal Điều khoản sử dụng */}
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
            <ScrollView style={styles.modalContent}>
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
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Modal Xác nhận Xóa tài khoản */}
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
  header: {
    flexDirection: "row",
    alignItems: "center",
    padding: 20,
    paddingTop: 40,
    backgroundColor: "#00C4B4",
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#fff",
    marginLeft: 10,
  },
  avatarContainer: {
    alignItems: "center",
    marginVertical: 20,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: "#e0e0e0",
  },
  infoContainer: {
    backgroundColor: "#fff",
    marginHorizontal: 10,
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
    borderColor: "#FF0000",
    alignItems: "center",
  },
  deleteButtonText: {
    fontSize: 16,
    color: "#FF0000",
  },
  logoutButton: {
    marginHorizontal: 10,
    marginVertical: 10,
    padding: 15,
    borderRadius: 10,
    backgroundColor: "#FF0000",
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
    width: "80%",
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 20,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#000",
  },
  modalContent: {
    marginTop: 10,
  },
  modalSectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginTop: 10,
  },
  modalText: {
    fontSize: 14,
    color: "#333",
    marginVertical: 5,
  },
  closeButton: {
    marginTop: 20,
    padding: 10,
    backgroundColor: "#ddd",
    borderRadius: 5,
    alignItems: "center",
  },
  closeButtonText: {
    fontSize: 16,
    color: "#000",
  },
  deleteModalContainer: {
    width: "80%",
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 20,
    alignItems: "center",
  },
  deleteModalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#000",
    marginBottom: 20,
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
    backgroundColor: "#ccc",
  },
  deleteModalButtonText: {
    fontSize: 16,
    color: "#fff",
  },
});
