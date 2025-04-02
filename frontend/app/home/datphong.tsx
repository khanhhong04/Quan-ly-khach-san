  import React, { useState, useEffect } from "react";
  import {View,Text,TextInput,TouchableOpacity,StyleSheet,ScrollView,Linking,Platform,} from "react-native";
  import Icon from "react-native-vector-icons/Ionicons";
  import { useRouter } from "expo-router";
  import { useRef } from "react";
  import { useLocalSearchParams } from "expo-router";
  import DateTimePicker from "@react-native-community/datetimepicker";

  // Định nghĩa kiểu cho activeTab
  type TabType = "Qua đêm" | "Ở trong ngày";

  export default function HomeScreen() {
    const [activeTab, setActiveTab] = useState<TabType>("Qua đêm");
    const [searchQuery, setSearchQuery] = useState("Khách Sạn Khánh Hồng");
    const [showTimePicker, setShowTimePicker] = useState(false);
    const [selectedCheckOut, setSelectedCheckOut] = useState<Date | null>(null); // Lưu giờ Check Out cho tab "Ở trong ngày"

    // Nhận params từ router hiển thị số phòng số người
    const params = useLocalSearchParams();
    const [rooms, setRooms] = useState("1");
    const [adults, setAdults] = useState("1");

    // lưu checkin checkout
    const [checkIn, setCheckIn] = useState<string | null>(null);
    const [checkOut, setCheckOut] = useState<string | null>(null);

    const prevParams = useRef(params); // Khai báo useRef để lưu giá trị trước đó
    useEffect(() => {
      setCheckIn(params.checkIn ? params.checkIn.toString() : checkIn);
      setCheckOut(params.checkOut ? params.checkOut.toString() : checkOut);
      setRooms(params.rooms ? params.rooms.toString() : rooms);
      setAdults(params.adults ? params.adults.toString() : adults);
      prevParams.current = params; // Cập nhật giá trị cũ
    }, [params]);
    
    


    const router = useRouter();

    const handleSearch = () => {
      router.push("/home/timkiem");
    };

    const handleGuestPress = () => {
      router.push('/home/spsn');
    };

    const handleDatePress = (type: "checkIn" | "checkOut") => {
      if (activeTab === "Qua đêm") {
        router.push({
          pathname: "/selectDate",
          params: { type }, // Truyền tham số type để biết đang chọn Check In hay Check Out
        });
      } else if (activeTab === "Ở trong ngày" && type === "checkIn") {
        router.push({
          pathname: "/selectDateTime",
          params: { type: "checkIn" }, // Điều hướng sang trang chọn ngày và giờ
        });
      }
    };

    const openGoogleMaps = () => {
      const address =
        activeTab === "Qua đêm" ? "Khách Sạn Khánh Hồng" : "Khách Sạn Khánh Hồng";
      const url = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
        address
      )}`;
      Linking.openURL(url).catch((err) =>
        console.error("Không thể mở Google Maps", err)
      );
    };

    const handleTabChange = (tab: TabType) => {
      setActiveTab(tab);
      setSearchQuery(
        tab === "Qua đêm" ? "Khách Sạn Khánh Hồng" : "Khách Sạn Khánh Hồng"
      );
    }; 

    const onTimeChange = (event: any, selected: Date | undefined) => {
      setShowTimePicker(Platform.OS === "ios"); // Ẩn picker trên Android sau khi chọn
      if (selected) {
        setSelectedCheckOut(selected);
      }
    };
    

    const formatTime = (date: Date | null) => {
      if (!date) return "Giờ nhận phòng"; // Hiển thị "Giờ nhận phòng" nếu chưa chọn
      const hours = date.getHours().toString().padStart(2, "0");
      const minutes = date.getMinutes().toString().padStart(2, "0");
      return `${hours}:${minutes}`;
    };
    
    

    return (
      <ScrollView style={styles.container}>
        <View style={styles.header}>
          <View style={styles.headerLeftPlaceholder} />
          <Text style={styles.headerTitle}>Tất cả phòng</Text>
          <View style={styles.headerRightPlaceholder} />
        </View>

        <View style={styles.searchSection}>
          <View style={styles.tabContainer}>
            <TouchableOpacity
              style={[
                styles.tab,
                activeTab === "Qua đêm" ? styles.activeTab : null,
              ]}
              onPress={() => handleTabChange("Qua đêm")}
            >
              <Text
                style={[
                  styles.tabText,
                  activeTab === "Qua đêm" ? styles.activeTabText : null,
                ]}
              >
                Qua đêm
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.tab,
                activeTab === "Ở trong ngày" ? styles.activeTab : null,
              ]}
              onPress={() => handleTabChange("Ở trong ngày")}
            >
              <Text
                style={[
                  styles.tabText,
                  activeTab === "Ở trong ngày" ? styles.activeTabText : null,
                ]}
              >
                Ở trong ngày
              </Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            style={styles.searchInputContainer}
            onPress={openGoogleMaps}
          >
            <Icon
              name="location-outline"
              size={20}
              color="#666"
              style={styles.searchIcon}
            />
            <TextInput
              style={styles.searchInput}
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholder="Tìm kiếm khách sạn"
              editable={false}
            />
          </TouchableOpacity>

          <View style={styles.dateContainer}>
  {/* Nút chọn ngày nhận phòng */}
  <TouchableOpacity
    style={styles.dateButton}
    onPress={() => router.push({
      pathname: "/home/lich",
      params: { 
        type: "checkIn", // Xác định là Check In
        checkIn: checkIn || "",
        checkOut: checkOut || "",
        rooms: rooms || "1",
        adults: adults || "1"
      }
    })}
  >
    <Icon name="calendar-outline" size={20} color="#666" style={styles.icon} />
    <Text style={styles.dateText}>{checkIn || "Ngày nhận"}</Text>
  </TouchableOpacity>

  {/* Nút chọn ngày trả phòng */}
  <TouchableOpacity
    style={styles.dateButton}
    onPress={() => router.push({
      pathname: "/home/lich",
      params: { 
        type: "checkOut", // Xác định là Check Out
        checkIn: checkIn || "",
        checkOut: checkOut || "",
        rooms: rooms || "1",
        adults: adults || "1"
      }
    })}
  >
    <Icon name="calendar-outline" size={20} color="#666" style={styles.icon} />
    <Text style={styles.dateText}>{checkOut || "Ngày trả"}</Text>
  </TouchableOpacity>
</View>


          {showTimePicker && (
            <DateTimePicker
              value={selectedCheckOut || new Date()}
              mode="time"
              display="default"
              onChange={onTimeChange}
              minuteInterval={5} // Giúp chọn phút dễ hơn
            />
          )}


<TouchableOpacity
  style={styles.guestButton}
  onPress={() => router.push({
    pathname: "/home/spsn",
    params: { 
      rooms: rooms || "1",
      adults: adults || "1",
      checkIn: checkIn || "",
      checkOut: checkOut || ""
    }
  })}
>
  <Icon name="person-outline" size={20} color="#666" style={styles.icon} />
  <Text style={styles.guestText}>Số Phòng: {rooms}, Số Người: {adults}</Text>
</TouchableOpacity>



          <TouchableOpacity style={styles.searchButton} onPress={() => router.push('/home/timkiem')}>
            <Icon
              name="search-outline"
              size={20}
              color="#fff"
              style={styles.searchIcon}
            />
            <Text style={styles.searchButtonText} >Tìm kiếm</Text>
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
    headerLeftPlaceholder: {
      width: 24,
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
    tab: {
      paddingVertical: 5,
      paddingHorizontal: 15,
      borderBottomWidth: 2,
      borderBottomColor: "transparent",
    },
    activeTab: {
      borderBottomColor: "#1E90FF",
    },
    tabText: {
      fontSize: 16,
      color: "#666",
    },
    activeTabText: {
      color: "#1E90FF",
      fontWeight: "bold",
    },
    searchInputContainer: {
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
    searchIcon: {
      marginRight: 10,
    },
    searchInput: {
      flex: 1,
      fontSize: 16,
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
  });