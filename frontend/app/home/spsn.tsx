import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
} from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import Icon from "react-native-vector-icons/Ionicons";

export default function SelectGuests() {
  const router = useRouter();
  const params = useLocalSearchParams();

  // Lấy giá trị ban đầu từ params (nếu có), mặc định là 1 phòng và 1 người
  const initialRooms = params.rooms ? parseInt(params.rooms as string) : 1;
  const initialAdults = params.adults ? parseInt(params.adults as string) : 1;

  const [rooms, setRooms] = useState(initialRooms);
  const [adults, setAdults] = useState(initialAdults);

  // Hàm tăng/giảm số phòng
  const handleRoomChange = (increment: boolean) => {
    if (increment) {
      const newRooms = rooms + 1;
      setRooms(newRooms);
      // Nếu số người hiện tại ít hơn số phòng mới, tăng số người lên bằng số phòng
      if (adults < newRooms) {
        setAdults(newRooms);
      }
      // Nếu số người hiện tại đã lớn hơn hoặc bằng số phòng mới, giữ nguyên số người
    } else if (rooms > 1) {
      const newRooms = rooms - 1;
      setRooms(newRooms);
      // Khi giảm số phòng, số người giữ nguyên (không thay đổi adults)
    }
  };

  // Hàm tăng/giảm số người
  const handleAdultChange = (increment: boolean) => {
    if (increment) {
      setAdults(adults + 1);
    } else if (adults > rooms) {
      // Đảm bảo số người không nhỏ hơn số phòng
      setAdults(adults - 1);
    }
  };

  const handleConfirm = () => {
    // Điều hướng về màn hình chính (index) bằng đường dẫn tương đối
    router.push({
      pathname: "../", // Quay lại route gốc của nhóm (tabs), tức là index.tsx
      params: { rooms: rooms.toString(), adults: adults.toString() },
    });
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        {/* Tiêu đề */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()}>
            <Icon name="close" size={28} color="#000" />
          </TouchableOpacity>
          <Text style={styles.title}>Phòng và số khách</Text>
        </View>

        {/* Số phòng */}
        <View style={styles.row}>
          <Text style={styles.label}>Số phòng</Text>
          <View style={styles.counter}>
            <TouchableOpacity
              onPress={() => handleRoomChange(false)}
              disabled={rooms <= 1}
            >
              <Text
                style={[
                  styles.counterButton,
                  rooms <= 1 && styles.disabledButton,
                ]}
              >
                -
              </Text>
            </TouchableOpacity>
            <Text style={styles.counterValue}>{rooms}</Text>
            <TouchableOpacity onPress={() => handleRoomChange(true)}>
              <Text style={styles.counterButton}>+</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Số người */}
        <View style={styles.row}>
          <Text style={styles.label}>Số người</Text>
          <View style={styles.counter}>
            <TouchableOpacity
              onPress={() => handleAdultChange(false)}
              disabled={adults <= rooms}
            >
              <Text
                style={[
                  styles.counterButton,
                  adults <= rooms && styles.disabledButton,
                ]}
              >
                -
              </Text>
            </TouchableOpacity>
            <Text style={styles.counterValue}>{adults}</Text>
            <TouchableOpacity onPress={() => handleAdultChange(true)}>
              <Text style={styles.counterButton}>+</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Nút OK */}
        <TouchableOpacity style={styles.confirmButton} onPress={() => router.push('/home/phong')}>
          <Text style={styles.confirmButtonText}>OK</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#fff",
  },
  container: {
    flex: 1,
    padding: 20,
    paddingTop: 40,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 20,
  },
  closeButton: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#000",
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  label: {
    fontSize: 16,
    color: "#333",
  },
  counter: {
    flexDirection: "row",
    alignItems: "center",
  },
  counterButton: {
    fontSize: 24,
    color: "#1E90FF",
    paddingHorizontal: 15,
  },
  disabledButton: {
    color: "#ccc",
  },
  counterValue: {
    fontSize: 16,
    fontWeight: "bold",
    marginHorizontal: 10,
  },
  confirmButton: {
    backgroundColor: "#1E90FF",
    borderRadius: 25,
    paddingVertical: 15,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 30,
  },
  confirmButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
});