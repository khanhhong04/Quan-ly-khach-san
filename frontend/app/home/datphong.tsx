import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
} from "react-native";
import Icon from "react-native-vector-icons/Ionicons";
import { useRouter, useLocalSearchParams } from "expo-router";
import { useRef } from "react";

export default function HomeScreen() {
  const [selectedFloor, setSelectedFloor] = useState<number | null>(null); // State để lưu tầng được chọn

  // Nhận params từ router
  const params = useLocalSearchParams();
  const [rooms, setRooms] = useState<string>("1");
  const [adults, setAdults] = useState<string>("1");
  const [checkIn, setCheckIn] = useState<string | null>(null);
  const [checkOut, setCheckOut] = useState<string | null>(null);

  const prevParams = useRef(params);
  useEffect(() => {
    setCheckIn(params.checkIn ? params.checkIn.toString() : checkIn);
    setCheckOut(params.checkOut ? params.checkOut.toString() : checkOut);
    setRooms(params.rooms ? params.rooms.toString() : rooms);
    setAdults(params.adults ? params.adults.toString() : adults);
    prevParams.current = params;
  }, [params]);

  const router = useRouter();

  const handleSearch = () => {
    // Kiểm tra xem người dùng đã chọn đầy đủ thông tin chưa
    if (!checkIn || !checkOut) {
      Alert.alert("Thông báo", "Vui lòng chọn ngày nhận và ngày trả phòng.");
      return;
    }
    if (!rooms || !adults) {
      Alert.alert("Thông báo", "Vui lòng chọn số phòng và số người.");
      return;
    }

    // Điều hướng đến timkiem.tsx và truyền các tham số, bao gồm tầng
    router.push({
      pathname: "/home/timkiem",
      params: {
        checkIn,
        checkOut,
        rooms,
        adults,
        floor: selectedFloor ? selectedFloor.toString() : "", // Truyền tầng được chọn
      },
    });
  };

  const handleGuestPress = () => {
    router.push({
      pathname: "/home/spsn",
      params: {
        rooms: rooms || "1",
        adults: adults || "1",
        checkIn: checkIn || "",
        checkOut: checkOut || "",
      },
    });
  };

  const handleDatePress = (type: "checkIn" | "checkOut") => {
    router.push({
      pathname: "/home/lich",
      params: {
        type,
        checkIn: checkIn || "",
        checkOut: checkOut || "",
        rooms: rooms || "1",
        adults: adults || "1",
      },
    });
  };

  const handleFloorSelect = (floor: number) => {
    setSelectedFloor(floor);
  };

  // Hàm xử lý nút Back
  const handleBackPress = () => {
    router.push("/home/trangchu");
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={handleBackPress}>
          <Icon name="arrow-back" size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Tìm kiếm phòng</Text>
        <View style={styles.headerRightPlaceholder} />
      </View>

      <View style={styles.searchSection}>
        {/* Xóa phần tabContainer vì chỉ còn "Qua đêm" */}
        <View style={styles.tabContainer}>
          <Text style={styles.tabText}>Qua đêm</Text>
        </View>

        {/* Thay thế Google Maps bằng bộ chọn tầng */}
        <View style={styles.floorContainer}>
          <Text style={styles.floorLabel}>Chọn tầng:</Text>
          <View style={styles.floorButtons}>
            {[1, 2, 3, 4, 5].map((floor) => (
              <TouchableOpacity
                key={floor}
                style={[
                  styles.floorButton,
                  selectedFloor === floor ? styles.floorButtonSelected : null,
                ]}
                onPress={() => handleFloorSelect(floor)}
              >
                <Text
                  style={[
                    styles.floorButtonText,
                    selectedFloor === floor ? styles.floorButtonTextSelected : null,
                  ]}
                >
                  Tầng {floor}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.dateContainer}>
          <TouchableOpacity
            style={styles.dateButton}
            onPress={() => handleDatePress("checkIn")}
          >
            <Icon
              name="calendar-outline"
              size={20}
              color="#666"
              style={styles.icon}
            />
            <Text style={styles.dateText}>{checkIn || "Ngày nhận"}</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.dateButton}
            onPress={() => handleDatePress("checkOut")}
          >
            <Icon
              name="calendar-outline"
              size={20}
              color="#666"
              style={styles.icon}
            />
            <Text style={styles.dateText}>{checkOut || "Ngày trả"}</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity style={styles.guestButton} onPress={handleGuestPress}>
          <Icon name="person-outline" size={20} color="#666" style={styles.icon} />
          <Text style={styles.guestText}>Số Phòng: {rooms}, Số Người: {adults}</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.searchButton} onPress={handleSearch}>
          <Icon
            name="search-outline"
            size={20}
            color="#fff"
            style={styles.searchIcon}
          />
          <Text style={styles.searchButtonText}>Tìm kiếm</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f4f4f4",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 20,
    backgroundColor: "#fff",
    paddingTop: 40,
  },
  headerRightPlaceholder: {
    width: 24,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "bold",
  },
  searchSection: {
    backgroundColor: "#fff",
    padding: 20,
    marginBottom: 10,
    borderRadius: 10,
    marginHorizontal: 10,
  },
  tabContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 20,
  },
  tabText: {
    fontSize: 16,
    color: "#1E90FF",
    fontWeight: "bold",
  },
  floorContainer: {
    marginBottom: 15,
  },
  floorLabel: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 10,
  },
  floorButtons: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  floorButton: {
    width: "18%",
    paddingVertical: 10,
    backgroundColor: "#f9f9f9",
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 10,
    alignItems: "center",
    marginBottom: 10,
  },
  floorButtonSelected: {
    backgroundColor: "#1E90FF",
    borderColor: "#1E90FF",
  },
  floorButtonText: {
    fontSize: 14,
    color: "#333",
  },
  floorButtonTextSelected: {
    color: "#fff",
    fontWeight: "bold",
  },
  dateContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 15,
  },
  dateButton: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 25,
    paddingHorizontal: 15,
    paddingVertical: 10,
    width: "48%",
    backgroundColor: "#f9f9f9",
  },
  guestButton: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 25,
    paddingHorizontal: 15,
    paddingVertical: 10,
    marginBottom: 15,
    backgroundColor: "#f9f9f9",
  },
  icon: {
    marginRight: 10,
  },
  dateText: {
    fontSize: 16,
    color: "#333",
  },
  guestText: {
    fontSize: 16,
    color: "#333",
  },
  searchButton: {
    flexDirection: "row",
    backgroundColor: "#1E90FF",
    borderRadius: 25,
    paddingVertical: 15,
    alignItems: "center",
    justifyContent: "center",
  },
  searchButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  searchIcon: {
    marginRight: 10,
  },
});