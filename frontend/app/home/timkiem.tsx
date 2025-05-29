import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  ActivityIndicator,
  Image,
} from "react-native";
import Icon from "react-native-vector-icons/Ionicons";
import { useRouter, useLocalSearchParams } from "expo-router";

interface Room {
  id: string;
  name: string;
  type: string;
  price: number;
  maxPeople: number;
  floor: number;
  images: string[];
}

export default function SearchResults() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const rooms = parseInt(params.rooms as string) || 1;
  const adults = parseInt(params.adults as string) || 1;
  const checkIn = params.checkIn as string;
  const checkOut = params.checkOut as string;
  const floor = params.floor ? parseInt(params.floor as string) : null;

  console.log("Tham số đầu vào:", { rooms, adults, floor, checkIn, checkOut });

  const [checkInDate, setCheckInDate] = useState<string>(checkIn || "2025-04-10");
  const [checkOutDate, setCheckOutDate] = useState<string>(checkOut || "2025-04-12");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [combinations, setCombinations] = useState<Room[][]>([]);
  const [currentImageIndices, setCurrentImageIndices] = useState<number[]>([]);

  useEffect(() => {
    const fetchRooms = async () => {
      setIsLoading(true);
      try {
        const response = await fetch("http://192.168.1.134:3001/api/rooms", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ checkIn: checkInDate, checkOut: checkOutDate }),
        });

        if (!response.ok) {
          throw new Error(`Failed to fetch rooms: ${response.statusText}`);
        }

        const roomsData = await response.json();
        console.log("Dữ liệu từ API:", roomsData);
        findRoomCombinations(roomsData);
      } catch (err: any) {
        console.error("Error fetching rooms:", err);
        alert("Error: " + err.message);
      } finally {
        setIsLoading(false);
      }
    };

    const findRoomCombinations = (roomsData: any[]) => {
  let availableRooms = roomsData;
  if (floor !== null) {
    availableRooms = availableRooms.filter((room: any) => room.Tang === floor);
  }
  console.log("Phòng trống sau khi lọc:", availableRooms);

  const newCombinations: Room[][] = [];

  const generateCombinations = (
    currentCombo: Room[],
    startIndex: number,
    targetPeople: number,
    maxRoomsAllowed: number
  ) => {
    const totalPeople = currentCombo.reduce(
      (sum, room) => sum + (room.maxPeople || 0),
      0
    );

    // Nếu tổng số người đủ hoặc vượt yêu cầu, thêm tổ hợp
    if (totalPeople >= targetPeople) {
      newCombinations.push([...currentCombo]);
      console.log("Tổ hợp tìm thấy:", currentCombo);
      return;
    }

    // Giới hạn số phòng tối đa (ví dụ: 5 phòng)
    if (currentCombo.length >= maxRoomsAllowed) {
      return;
    }

    for (let i = startIndex; i < availableRooms.length; i++) {
      const room = availableRooms[i];
      const formattedRoom: Room = {
        id: room.MaPhong.toString(),
        name: `Phòng ${room.SoPhong}`,
        type: room.TenLoaiPhong,
        price: parseFloat(room.GiaPhong),
        maxPeople: room.SoNguoiToiDa,
        floor: room.Tang || 0,
        images: room.images.map((img: string) => `http://192.168.1.134:3001${img}`),
      };
      currentCombo.push(formattedRoom);
      generateCombinations(currentCombo, i + 1, targetPeople, maxRoomsAllowed);
      currentCombo.pop();
    }
  };

  console.log("Số người:", adults, "Số phòng yêu cầu:", rooms);
  // Nếu yêu cầu 1 phòng nhưng không đủ người, thử với tối đa 5 phòng
  const maxRoomsToTry = Math.min(5, availableRooms.length); // Giới hạn tối đa 5 phòng
  if (rooms === 1) {
    // Đầu tiên thử với 1 phòng
    generateCombinations([], 0, adults, 1);

    // Nếu không có tổ hợp, thử với nhiều phòng
    if (newCombinations.length === 0) {
      generateCombinations([], 0, adults, maxRoomsToTry);
    }
  } else {
    // Nếu yêu cầu nhiều phòng, giữ nguyên logic cũ
    generateCombinations([], 0, adults, rooms);
  }

  // Nếu vẫn không có tổ hợp, thông báo
  if (newCombinations.length === 0) {
    console.log("Không tìm thấy tổ hợp nào phù hợp.");
  }

  console.log("Tất cả tổ hợp:", newCombinations);
  setCombinations(newCombinations);
  setCurrentImageIndices(newCombinations.map(() => 0));
};

    fetchRooms();
  }, [checkInDate, checkOutDate, rooms, adults, floor]);

  const handleFilterPress = () => {
    console.log("Chuyển đến màn hình bộ lọc (chưa triển khai)");
  };

  const handleSortPress = () => {
    console.log("Sắp xếp theo giá tiền");
    const sortedCombinations = [...combinations].sort((a, b) => {
      const priceA = a.reduce((sum, room) => sum + room.price, 0);
      const priceB = b.reduce((sum, room) => sum + room.price, 0);
      return priceA - priceB;
    });
    setCombinations(sortedCombinations);
  };

  const handleCheckInPress = () => {
    setCheckInDate("2025-04-10");
    console.log("Đã chọn ngày đặt: 2025-04-10");
  };

  const handleCheckOutPress = () => {
    setCheckOutDate("2025-04-12");
    console.log("Đã chọn ngày trả: 2025-04-12");
  };

  const handleRoomPress = (rooms: Room[]) => {
    router.push({
      pathname: "/home/ttphong",
      params: {
        rooms: JSON.stringify(rooms),
        totalPrice: rooms
          .reduce((sum, room) => sum + (room.price || 0), 0)
          .toString(),
        totalPeople: rooms
          .reduce((sum, room) => sum + (room.maxPeople || 0), 0)
          .toString(),
        totalRooms: rooms.length.toString(),
        checkInDate: checkInDate,
        checkOutDate: checkOutDate,
      },
    });
  };

  const RoomCard = ({ rooms, comboIndex }: { rooms: Room[]; comboIndex: number }) => {
    const [currentImageIndex, setCurrentImageIndex] = useState(0);

    const totalPrice = rooms.reduce((sum, room) => sum + (room.price || 0), 0);
    const totalPeople = rooms.reduce((sum, room) => sum + (room.maxPeople || 0), 0);
    const totalRooms = rooms.length;
    const floors = rooms.map((room) => room.floor).join(", ");
    const allImages = rooms.flatMap((room) => room.images);

    useEffect(() => {
      if (allImages.length > 1) {
        const interval = setInterval(() => {
          setCurrentImageIndex((prevIndex) =>
            prevIndex === allImages.length - 1 ? 0 : prevIndex + 1
          );
        }, 3000);
        return () => clearInterval(interval);
      }
    }, [allImages.length]);

    if (!rooms || rooms.length === 0) {
      return (
        <View style={styles.roomContainer}>
          <Text style={styles.noResults}>Không có phòng để hiển thị</Text>
        </View>
      );
    }

    return (
      <TouchableOpacity onPress={() => handleRoomPress(rooms)} style={styles.roomContainer}>
        <View style={styles.imageCarousel}>
          <View style={styles.roomImagePlaceholder}>
            {allImages.length > 0 ? (
              <Image
                source={{ uri: allImages[currentImageIndex] }}
                style={styles.roomImage}
                resizeMode="cover"
                onError={(e) => console.log("Lỗi tải ảnh:", e.nativeEvent.error)}
              />
            ) : (
              <Text style={styles.placeholderText}>Không có hình ảnh</Text>
            )}
          </View>
        </View>

        <View style={styles.roomInfo}>
          <Text style={styles.roomQuantity}>Tổng số phòng: {totalRooms}</Text>
          <Text style={styles.roomType}>{rooms.map((room) => room.type).join(" + ")}</Text>
          <Text style={styles.roomPrice}>Tổng giá: {totalPrice.toLocaleString()} VNĐ/đêm</Text>
          <Text style={styles.roomPeople}>Số người tối đa: {totalPeople}</Text>
          <Text style={styles.roomFloor}>Tầng: {floors}</Text>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Icon name="arrow-back" size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Kết quả tìm kiếm</Text>
        <View style={{ width: 24 }} />
      </View>

      <View style={styles.buttonContainer}>
        <TouchableOpacity style={styles.filterButton} onPress={() => router.push('/home/boloc')}>
          <Icon name="filter" size={20} color="#fff" />
          <Text style={styles.buttonText}>Bộ Lọc</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.sortButton} onPress={handleSortPress}>
          <Icon name="pricetag" size={20} color="#fff" />
          <Text style={styles.buttonText}>Giá Tiền</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.dateCard}>
        <TouchableOpacity style={styles.dateItem} onPress={handleCheckInPress}>
          <Text style={styles.dateText}>{checkInDate || "Chọn ngày đặt"}</Text>
        </TouchableOpacity>
        <View style={styles.dateDivider} />
        <TouchableOpacity style={styles.dateItem} onPress={handleCheckOutPress}>
          <Text style={styles.dateText}>{checkOutDate || "Chọn ngày trả"}</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.container}>
        {combinations.length > 0 ? (
          combinations.map((combo, index) => (
            <RoomCard key={index} rooms={combo} comboIndex={index} />
          ))
        ) : (
          <Text style={styles.noResults}>Không tìm thấy tổ hợp phòng phù hợp.</Text>
        )}

        {isLoading && (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#1E90FF" />
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#f4f4f4",
  },
  container: {
    flex: 1,
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
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginHorizontal: 10,
    marginBottom: 10,
  },
  filterButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    flex: 1,
    backgroundColor: "#1E90FF",
    paddingVertical: 10,
    marginRight: 5,
    borderRadius: 10,
  },
  sortButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    flex: 1,
    backgroundColor: "#00BFFF",
    paddingVertical: 10,
    marginLeft: 5,
    borderRadius: 10,
  },
  buttonText: {
    fontSize: 16,
    color: "#fff",
    fontWeight: "bold",
    marginLeft: 5,
  },
  dateCard: {
    flexDirection: "row",
    backgroundColor: "#fff",
    marginHorizontal: 10,
    marginBottom: 10,
    borderRadius: 10,
    padding: 10,
    alignItems: "center",
    justifyContent: "space-between",
    elevation: 2,
  },
  dateItem: {
    flex: 1,
    alignItems: "center",
  },
  dateText: {
    fontSize: 16,
    color: "#333",
    fontWeight: "bold",
  },
  dateDivider: {
    width: 1,
    height: "100%",
    backgroundColor: "#ddd",
  },
  roomContainer: {
    marginVertical: 10,
    marginHorizontal: 10,
  },
  imageCarousel: {
    marginVertical: 10,
  },
  roomImagePlaceholder: {
    height: 150,
    backgroundColor: "#ddd",
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
    overflow: "hidden",
  },
  roomImage: {
    width: "100%",
    height: "100%",
  },
  placeholderText: {
    color: "#666",
    fontSize: 16,
    textAlign: "center",
  },
  arrowButton: {
    padding: 10,
  },
  roomInfo: {
    backgroundColor: "#fff",
    padding: 10,
    borderRadius: 10,
    marginTop: 5,
  },
  roomQuantity: {
    fontSize: 14,
    color: "#888",
    textAlign: "left",
  },
  roomType: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
    textAlign: "left",
    marginTop: 5,
  },
  roomPrice: {
    fontSize: 14,
    color: "#1E90FF",
    fontWeight: "bold",
    marginTop: 5,
    textAlign: "left",
  },
  roomPeople: {
    fontSize: 14,
    color: "#888",
    textAlign: "left",
    marginTop: 5,
  },
  roomFloor: {
    fontSize: 14,
    color: "#888",
    textAlign: "left",
    marginTop: 5,
  },
  loadingContainer: {
    padding: 20,
    alignItems: "center",
  },
  noResults: {
    fontSize: 16,
    color: "#666",
    textAlign: "center",
    marginTop: 20,
  },
}); 