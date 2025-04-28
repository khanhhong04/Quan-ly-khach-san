import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  TextInput,
} from "react-native";
import Icon from "react-native-vector-icons/Ionicons";
import { useRouter } from "expo-router";

export default function BoLoc() {
  const router = useRouter();

  // Trạng thái cho các mục trong bộ lọc
  const [filters, setFilters] = useState({
    tv: false,
    balcony: false,
    airConditioner: false,
    fridge: false,
    washingMachine: false,
    bedCount: "", // Số giường
    singleRoom: false, // Phòng Đơn
    doubleRoom: false, // Phòng Đôi
    familyRoom: false, // Phòng Gia Đình
    momoPayment: false, // Thanh toán Momo
    bankCardPayment: false, // Thanh toán Thẻ Ngân Hàng
    directPayment: false, // Trả Trực Tiếp
  });

  // Hàm xử lý thay đổi checkbox
  const toggleFilter = (key: keyof typeof filters) => {
    setFilters((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  // Hàm xử lý thay đổi số giường
  const handleBedCountChange = (text: string) => {
    // Chỉ cho phép nhập số
    const numericValue = text.replace(/[^0-9]/g, "");
    setFilters((prev) => ({
      ...prev,
      bedCount: numericValue,
    }));
  };

  // Hàm áp dụng bộ lọc
  const applyFilters = () => {
    console.log("Bộ lọc đã chọn:", filters);
    router.back();
  };

  // Custom Checkbox Component
  const CustomCheckbox = ({
    value,
    onValueChange,
  }: {
    value: boolean;
    onValueChange: () => void;
  }) => {
    return (
      <TouchableOpacity onPress={onValueChange} style={styles.customCheckbox}>
        <Icon
          name={value ? "checkbox-outline" : "square-outline"}
          size={24}
          color={value ? "#1E90FF" : "#666"}
        />
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Icon name="arrow-back" size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Chọn Lọc</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView style={styles.container}>
        {/* Số giường */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>SỐ GIƯỜNG</Text>
          <View style={styles.filterItem}>
            <Text style={styles.filterText}>Số giường:</Text>
            <TextInput
              style={styles.bedInput}
              value={filters.bedCount}
              onChangeText={handleBedCountChange}
              keyboardType="numeric"
              placeholder="Nhập số giường"
              placeholderTextColor="#999"
            />
          </View>
        </View>

        {/* Loại phòng */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>LOẠI PHÒNG</Text>
          <View style={styles.filterItem}>
            <CustomCheckbox
              value={filters.singleRoom}
              onValueChange={() => toggleFilter("singleRoom")}
            />
            <Text style={styles.filterText}>Phòng Đơn</Text>
          </View>
          <View style={styles.filterItem}>
            <CustomCheckbox
              value={filters.doubleRoom}
              onValueChange={() => toggleFilter("doubleRoom")}
            />
            <Text style={styles.filterText}>Phòng Đôi</Text>
          </View>
          <View style={styles.filterItem}>
            <CustomCheckbox
              value={filters.familyRoom}
              onValueChange={() => toggleFilter("familyRoom")}
            />
            <Text style={styles.filterText}>Phòng Gia Đình</Text>
          </View>
        </View>

        {/* Tiện nghi trong phòng */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>TIỆN NGHI TRONG PHÒNG</Text>
          <View style={styles.filterItem}>
            <CustomCheckbox
              value={filters.tv}
              onValueChange={() => toggleFilter("tv")}
            />
            <Text style={styles.filterText}>TV</Text>
          </View>
          <View style={styles.filterItem}>
            <CustomCheckbox
              value={filters.balcony}
              onValueChange={() => toggleFilter("balcony")}
            />
            <Text style={styles.filterText}>Ban công/sân hiên</Text>
          </View>
          <View style={styles.filterItem}>
            <CustomCheckbox
              value={filters.airConditioner}
              onValueChange={() => toggleFilter("airConditioner")}
            />
            <Text style={styles.filterText}>Điều hòa</Text>
          </View>
          <View style={styles.filterItem}>
            <CustomCheckbox
              value={filters.fridge}
              onValueChange={() => toggleFilter("fridge")}
            />
            <Text style={styles.filterText}>Tủ lạnh</Text>
          </View>
          <View style={styles.filterItem}>
            <CustomCheckbox
              value={filters.washingMachine}
              onValueChange={() => toggleFilter("washingMachine")}
            />
            <Text style={styles.filterText}>Máy giặt</Text>
          </View>
        </View>

        {/* Lựa chọn thanh toán */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>LỰA CHỌN THANH TOÁN</Text>
          <View style={styles.filterItem}>
            <CustomCheckbox
              value={filters.momoPayment}
              onValueChange={() => toggleFilter("momoPayment")}
            />
            <Text style={styles.filterText}>Momo</Text>
          </View>
          <View style={styles.filterItem}>
            <CustomCheckbox
              value={filters.bankCardPayment}
              onValueChange={() => toggleFilter("bankCardPayment")}
            />
            <Text style={styles.filterText}>Thẻ Ngân Hàng</Text>
          </View>
          <View style={styles.filterItem}>
            <CustomCheckbox
              value={filters.directPayment}
              onValueChange={() => toggleFilter("directPayment")}
            />
            <Text style={styles.filterText}>Trả Trực Tiếp</Text>
          </View>
        </View>
      </ScrollView>

      {/* Nút Áp dụng - Cố định ở dưới cùng */}
      <View style={styles.footer}>
        <TouchableOpacity style={styles.applyButton} onPress={applyFilters}>
          <Text style={styles.applyButtonText}>Áp dụng</Text>
        </TouchableOpacity>
      </View>
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
    justifyContent: "space-between",
    padding: 20,
    paddingTop: 40,
    backgroundColor: "#fff",
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "bold",
  },
  container: {
    flex: 1,
    paddingBottom: 80, // Đảm bảo nội dung không bị che bởi footer
  },
  section: {
    backgroundColor: "#fff",
    marginHorizontal: 10,
    marginVertical: 10,
    padding: 15,
    borderRadius: 10,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 10,
  },
  filterItem: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 5,
  },
  filterText: {
    fontSize: 14,
    color: "#333",
    marginLeft: 10,
  },
  customCheckbox: {
    width: 24,
    height: 24,
    justifyContent: "center",
    alignItems: "center",
  },
  bedInput: {
    flex: 1,
    height: 40,
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 5,
    paddingHorizontal: 10,
    marginLeft: 10,
    fontSize: 14,
    color: "#333",
  },
  footer: {
    flexDirection: "row",
    justifyContent: "space-between",
    padding: 20,
    backgroundColor: "#fff",
    borderTopWidth: 1,
    borderTopColor: "#ddd",
  },
  applyButton: {
    flex: 1,
    padding: 10,
    backgroundColor: "#1E90FF",
    borderRadius: 5,
    alignItems: "center",
  },
  applyButtonText: {
    fontSize: 16,
    color: "#fff",
    fontWeight: "bold",
  },
});
