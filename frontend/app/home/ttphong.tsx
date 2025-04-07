import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
} from "react-native";
import Icon from "react-native-vector-icons/Ionicons";
import { useRouter, useLocalSearchParams } from "expo-router";

// Định nghĩa interface Room đồng bộ với timkiem.tsx
interface Room {
  id: string;
  name: string;
  type: string;
  price: number;
  maxPeople: number;
  floor: number;
  images: string[]; // Thay imageUrl bằng images (mảng URL)
}

export default function RoomDetail() {
  const router = useRouter();
  const params = useLocalSearchParams();

  // Lấy thông tin từ params
  const rooms: Room[] = params.rooms ? JSON.parse(params.rooms as string) : [];
  const totalPrice = parseFloat(params.totalPrice as string) || 0;
  const totalPeople = parseInt(params.totalPeople as string) || 0;
  const totalRooms = parseInt(params.totalRooms as string) || 0;
  const checkInDate = params.checkInDate as string;
  const checkOutDate = params.checkOutDate as string;

  // Danh sách tiện nghi với icon
  const amenities = [
    { name: "Điều hòa nhiệt độ", icon: "snow-outline" },
    { name: "Wi-Fi miễn phí", icon: "wifi-outline" },
    { name: "TV màn hình phẳng", icon: "tv-outline" },
    { name: "Tủ lạnh", icon: "snow-outline" },
    { name: "Máy giặt", icon: "shirt-outline" },
    { name: "Bếp nấu ăn", icon: "flame-outline" },
    { name: "Ban công", icon: "sunny-outline" },
    { name: "Máy sấy tóc", icon: "hair-dryer-outline" },
  ];

  // Danh sách dịch vụ với icon và giá
  const services = [
    { name: "Bữa sáng", icon: "restaurant-outline", price: 50000 },
    { name: "Dọn phòng", icon: "bed-outline", price: 30000 },
    { name: "Giặt là", icon: "shirt-outline", price: 40000 },
    { name: "Đưa đón sân bay", icon: "airplane-outline", price: 200000 },
  ];

  // State để quản lý trạng thái chọn/bỏ chọn của từng dịch vụ
  const [selectedServices, setSelectedServices] = useState(
    services.reduce((acc, service) => {
      acc[service.name] = false; // Khởi tạo trạng thái ban đầu là chưa chọn
      return acc;
    }, {} as { [key: string]: boolean })
  );

  // Hàm xử lý khi chọn/bỏ chọn dịch vụ
  const toggleService = (serviceName: string) => {
    setSelectedServices((prev) => ({
      ...prev,
      [serviceName]: !prev[serviceName],
    }));
  };

  // Tính tổng giá dịch vụ
  const totalServicePrice = services.reduce((total, service) => {
    return total + (selectedServices[service.name] ? service.price : 0);
  }, 0);

  // Tính tổng giá cuối cùng (giá phòng + giá dịch vụ)
  const finalPrice = totalPrice + totalServicePrice;

  // Mô tả mặc định cho phòng
  const getRoomDescription = (room: Room) => {
    return `Đây là một ${room.type} rộng rãi và thoải mái, nằm ở tầng ${room.floor}. Phòng được trang bị đầy đủ tiện nghi hiện đại như điều hòa nhiệt độ, Wi-Fi miễn phí, TV màn hình phẳng, và tủ lạnh. Đây là lựa chọn lý tưởng cho những ai tìm kiếm một không gian nghỉ ngơi tiện nghi.`;
  };

  // Hàm xử lý khi nhấn nút "Đặt ngay"
  const handleBookNow = () => {
    console.log("Đặt phòng thành công!");
    console.log("Thông tin đặt phòng:", {
      rooms,
      totalPrice,
      totalServicePrice,
      finalPrice,
      checkInDate,
      checkOutDate,
      selectedServices,
    });
    router.push({
      pathname: "/home/datngay",
      params: {
        rooms: JSON.stringify(rooms),
        totalPrice: totalPrice.toString(),
        totalServicePrice: totalServicePrice.toString(),
        finalPrice: finalPrice.toString(),
        checkInDate,
        checkOutDate,
        selectedServices: JSON.stringify(selectedServices),
      },
    });
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Icon name="arrow-back" size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Chi tiết đặt phòng</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView style={styles.scrollContainer}>
        {/* Hiển thị ngày đặt và ngày trả */}
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>Thông tin đặt phòng</Text>
          <View style={styles.dateInfo}>
            <Text style={styles.dateText}>Ngày đặt: {checkInDate || "Chưa chọn"}</Text>
            <Text style={styles.dateText}>Ngày trả: {checkOutDate || "Chưa chọn"}</Text>
          </View>
        </View>

        {/* Hiển thị hình ảnh */}
        <View style={styles.imageContainer}>
          <Image
            source={
              rooms.length > 0 && rooms[0].images && rooms[0].images.length > 0
                ? { uri: rooms[0].images[0] } // Lấy ảnh đầu tiên từ mảng images
                : require("../../assets/images/anh4.jpg") // Ảnh mặc định nếu không có
            }
            style={styles.roomImage}
          />
        </View>

        {/* Khung: Chi tiết phòng hoặc tổ hợp phòng */}
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>
            {totalRooms === 1 ? "Chi tiết phòng" : "Chi tiết tổ hợp phòng"}
          </Text>
          {totalRooms === 1 ? (
            // Hiển thị chi tiết 1 phòng
            <View style={styles.roomInfo}>
              <Text style={styles.roomType}>
                {rooms[0].type} - Tầng {rooms[0].floor} - {rooms[0].name}
              </Text>
              <Text style={styles.roomPrice}>
                Giá: {rooms[0].price.toLocaleString()} VNĐ/đêm
              </Text>
              <Text style={styles.roomPeople}>
                Số người tối đa: {rooms[0].maxPeople}
              </Text>
            </View>
          ) : (
            // Hiển thị chi tiết tổ hợp phòng
            <View style={styles.roomInfo}>
              <Text style={styles.roomQuantity}>Tổng số phòng: {totalRooms}</Text>
              <Text style={styles.roomType}>
                Loại phòng: {rooms.map((room) => room.type).join(" + ")}
              </Text>
              <Text style={styles.roomPrice}>
                Tổng giá: {totalPrice.toLocaleString()} VNĐ/đêm
              </Text>
              <Text style={styles.roomPeople}>Số người tối đa: {totalPeople}</Text>
              <Text style={styles.roomFloor}>
                Tầng: {rooms.map((room) => room.floor).join(", ")}
              </Text>
              <Text style={styles.roomListTitle}>Danh sách phòng:</Text>
              {rooms.map((room, index) => (
                <Text key={index} style={styles.roomListItem}>
                  - {room.name} (Tầng {room.floor}, {room.type}, {room.price.toLocaleString()} VNĐ/đêm)
                </Text>
              ))}
            </View>
          )}
        </View>

        {/* Khung: Dịch vụ */}
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>Dịch vụ</Text>
          <View style={styles.servicesContainer}>
            {services.map((service, index) => (
              <TouchableOpacity
                key={index}
                style={styles.serviceItem}
                onPress={() => toggleService(service.name)}
              >
                <View style={styles.serviceInfo}>
                  <Icon name={service.icon} size={20} color="#666" />
                  <Text style={styles.serviceText}>
                    {service.name} ({service.price.toLocaleString()} VNĐ)
                  </Text>
                </View>
                <Icon
                  name={
                    selectedServices[service.name]
                      ? "checkmark-circle-outline"
                      : "ellipse-outline"
                  }
                  size={20}
                  color={selectedServices[service.name] ? "#1E90FF" : "#666"}
                />
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Khung: Lưu ý (Tổng giá dịch vụ và tổng giá cuối cùng) */}
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>Lưu ý</Text>
          <Text style={styles.noteText}>
            Tổng giá dịch vụ: {totalServicePrice.toLocaleString()} VNĐ
          </Text>
          <Text style={styles.noteText}>
            Tổng giá cuối cùng: {finalPrice.toLocaleString()} VNĐ
          </Text>
        </View>

        {/* Khung: Tiện nghi */}
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>Tiện nghi</Text>
          <View style={styles.amenitiesContainer}>
            {amenities.map((amenity, index) => (
              <View key={index} style={styles.amenityItem}>
                <Icon name={amenity.icon} size={20} color="#666" />
                <Text style={styles.amenityText}>{amenity.name}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Khung: Mô tả về phòng (chỉ hiển thị nếu là 1 phòng) */}
        {totalRooms === 1 && (
          <View style={styles.sectionContainer}>
            <Text style={styles.sectionTitle}>Mô tả về phòng</Text>
            <View style={styles.descriptionContainer}>
              <Text style={styles.descriptionText}>
                {getRoomDescription(rooms[0])}
              </Text>
            </View>
          </View>
        )}
      </ScrollView>

      {/* Footer với nút "Đặt ngay" */}
      <View style={styles.footer}>
        <TouchableOpacity style={styles.bookButton} onPress={handleBookNow}>
          <Text style={styles.bookButtonText}>Đặt ngay</Text>
        </TouchableOpacity>
      </View>
    </View>
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
    paddingTop: 40,
    backgroundColor: "#fff",
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "bold",
  },
  scrollContainer: {
    flex: 1,
  },
  imageContainer: {
    position: "relative",
  },
  roomImage: {
    width: "100%",
    height: 200,
    resizeMode: "cover",
  },
  sectionContainer: {
    backgroundColor: "#fff",
    borderRadius: 10,
    marginHorizontal: 20,
    marginBottom: 15,
    padding: 15,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
  },
  dateInfo: {
    marginBottom: 10,
  },
  dateText: {
    fontSize: 16,
    color: "#333",
    marginBottom: 5,
  },
  roomInfo: {
    marginBottom: 10,
  },
  roomQuantity: {
    fontSize: 14,
    color: "#888",
    marginBottom: 5,
  },
  roomType: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 5,
  },
  roomPrice: {
    fontSize: 16,
    color: "#1E90FF",
    fontWeight: "bold",
    marginBottom: 5,
  },
  roomPeople: {
    fontSize: 14,
    color: "#888",
    marginBottom: 5,
  },
  roomFloor: {
    fontSize: 14,
    color: "#888",
    marginBottom: 5,
  },
  roomListTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
    marginTop: 10,
    marginBottom: 5,
  },
  roomListItem: {
    fontSize: 14,
    color: "#666",
    marginBottom: 5,
  },
  servicesContainer: {
    marginBottom: 10,
  },
  serviceItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  serviceInfo: {
    flexDirection: "row",
    alignItems: "center",
  },
  serviceText: {
    fontSize: 16,
    color: "#666",
    marginLeft: 10,
  },
  noteText: {
    fontSize: 16,
    color: "#FF8C00",
    fontStyle: "italic",
    marginBottom: 5,
  },
  amenitiesContainer: {
    marginBottom: 10,
  },
  amenityItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  amenityText: {
    fontSize: 16,
    color: "#666",
    marginLeft: 10,
  },
  descriptionContainer: {
    marginBottom: 10,
  },
  descriptionText: {
    fontSize: 16,
    color: "#666",
    lineHeight: 24,
  },
  footer: {
    flexDirection: "row",
    justifyContent: "space-between",
    padding: 20,
    backgroundColor: "#fff",
    borderTopWidth: 1,
    borderTopColor: "#ddd",
  },
  bookButton: {
    flex: 1,
    padding: 10,
    backgroundColor: "#8A2BE2",
    borderRadius: 5,
    alignItems: "center",
  },
  bookButtonText: {
    fontSize: 16,
    color: "#fff",
    fontWeight: "bold",
  },
});