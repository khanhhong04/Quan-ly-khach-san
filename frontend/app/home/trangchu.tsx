import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  Linking,
  Image,
  FlatList,
  Dimensions,
  Modal,
} from "react-native";
import Icon from "react-native-vector-icons/Ionicons";
import { useRouter } from "expo-router";

interface QuickInfo {
  name: string;
  icon: string;
  action: () => void;
  color: string;
}

export default function TrangChu() {
  const router = useRouter();
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [currentRoomIndex, setCurrentRoomIndex] = useState(0);
  const [currentServiceIndex, setCurrentServiceIndex] = useState(0);
  const [isInfoModalVisible, setIsInfoModalVisible] = useState(false); // Quản lý trạng thái modal Thông tin
  const flatListRef = useRef<FlatList>(null);
  const roomFlatListRef = useRef<FlatList>(null);
  const serviceFlatListRef = useRef<FlatList>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const roomIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const serviceIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const images = [
    require("../../assets/images/334679634.jpg"),
    require("../../assets/images/chụp-ảnh-phòng.jpg"),
    require("../../assets/images/lovepik.jpg"),
  ];

  const featuredRoomsImages = [
    require("../../assets/images/anhphongdep1.jpg"),
    require("../../assets/images/anhphongxau.jpg"),
    require("../../assets/images/anh_2_14.jpg"),
  ];

  const featuredServicesImages = [
    require("../../assets/images/buffe1.jpg"),
    require("../../assets/images/mat-xa.jpg"),
  ];

  const startAutoScroll = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
    intervalRef.current = setInterval(() => {
      setCurrentImageIndex((prevIndex) => {
        const nextIndex = (prevIndex + 1) % images.length;
        flatListRef.current?.scrollToIndex({
          index: nextIndex,
          animated: true,
        });
        return nextIndex;
      });
    }, 2000); // Giữ nguyên 2 giây cho carousel chính
  };

  const startRoomAutoScroll = () => {
    if (roomIntervalRef.current) {
      clearInterval(roomIntervalRef.current);
    }
    roomIntervalRef.current = setInterval(() => {
      setCurrentRoomIndex((prevIndex) => {
        const nextIndex = (prevIndex + 1) % featuredRoomsImages.length;
        roomFlatListRef.current?.scrollToIndex({
          index: nextIndex,
          animated: true,
        });
        return nextIndex;
      });
    }, 3000); // Thay đổi thành 3 giây cho "Các phòng nổi bật"
  };

  const startServiceAutoScroll = () => {
    if (serviceIntervalRef.current) {
      clearInterval(serviceIntervalRef.current);
    }
    serviceIntervalRef.current = setInterval(() => {
      setCurrentServiceIndex((prevIndex) => {
        const nextIndex = (prevIndex + 1) % featuredServicesImages.length;
        serviceFlatListRef.current?.scrollToIndex({
          index: nextIndex,
          animated: true,
        });
        return nextIndex;
      });
    }, 3000); // Thay đổi thành 3 giây cho "Các dịch vụ nổi bật"
  };

  useEffect(() => {
    startAutoScroll();
    startRoomAutoScroll();
    startServiceAutoScroll();
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      if (roomIntervalRef.current) clearInterval(roomIntervalRef.current);
      if (serviceIntervalRef.current) clearInterval(serviceIntervalRef.current);
    };
  }, [
    images.length,
    featuredRoomsImages.length,
    featuredServicesImages.length,
  ]);

  const quickInfo: QuickInfo[] = [
    {
      name: "Đặt phòng",
      icon: "bed-outline",
      action: () => router.push('/home/datphong'),
      color: "#1E90FF",
    },
    {
      name: "Thông tin",
      icon: "information-circle-outline",
      action: () => setIsInfoModalVisible(true), // Hiển thị modal khi nhấn "Thông tin"
      color: "#87CEEB",
    },
  ];

  const openGoogleMaps = () => {
    const address = "Số 1 thị trấn Quất Lâm, Nam Định";
    const url = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
      address
    )}`;
    Linking.openURL(url);
  };

  const { width } = Dimensions.get("window");

  const onScroll = (event: any) => {
    const contentOffsetX = event.nativeEvent.contentOffset.x;
    const index = Math.round(contentOffsetX / width);
    setCurrentImageIndex(index);
    startAutoScroll();
  };

  const onRoomScroll = (event: any) => {
    const contentOffsetX = event.nativeEvent.contentOffset.x;
    const index = Math.round(contentOffsetX / width);
    setCurrentRoomIndex(index);
    startRoomAutoScroll();
  };

  const onServiceScroll = (event: any) => {
    const contentOffsetX = event.nativeEvent.contentOffset.x;
    const index = Math.round(contentOffsetX / width);
    setCurrentServiceIndex(index);
    startServiceAutoScroll();
  };

  const getItemLayout = (_: any, index: number) => ({
    length: width,
    offset: width * index,
    index,
  });

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header} />
      <ScrollView style={styles.container}>
        <View style={styles.hotelInfoCard}>
          <Text style={styles.hotelName}>Khánh Hồng Hotel số 1 Nam Định</Text>
          <TouchableOpacity
            style={styles.locationContainer}
            onPress={openGoogleMaps}
          >
            <Icon name="location-outline" size={24} color="#1E90FF" />
            <Text style={styles.locationText}>Số 1 thị trấn Quất Lâm</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.mainImageContainer}>
          <FlatList
            ref={flatListRef}
            data={images}
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            onScroll={onScroll}
            getItemLayout={getItemLayout}
            snapToInterval={width}
            decelerationRate="fast"
            renderItem={({ item }) => (
              <View style={[styles.slide, { width }]}>
                <Image
                  source={item}
                  style={[styles.mainImagePlaceholder, { width }]}
                  resizeMode="cover"
                />
              </View>
            )}
            keyExtractor={(item, index) => index.toString()}
          />
          <View style={styles.pagination}>
            {images.map((_, index) => (
              <View
                key={index}
                style={[
                  styles.dot,
                  index === currentImageIndex ? styles.activeDot : null,
                ]}
              />
            ))}
          </View>
        </View>

        <View style={styles.quickInfoContainer}>
          {quickInfo.map((info) => (
            <TouchableOpacity
              key={info.name}
              style={[styles.quickInfoItem, { backgroundColor: info.color }]}
              onPress={info.action}
            >
              <Icon name={info.icon} size={20} color="#fff" />
              <Text style={styles.quickInfoText}>{info.name}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>Các phòng nổi bật</Text>
          <View style={styles.carouselContainer}>
            <FlatList
              ref={roomFlatListRef}
              data={featuredRoomsImages}
              horizontal
              pagingEnabled
              showsHorizontalScrollIndicator={false}
              onScroll={onRoomScroll}
              getItemLayout={getItemLayout}
              snapToInterval={width}
              decelerationRate="fast"
              renderItem={({ item }) => (
                <View style={[styles.slide, { width }]}>
                  <Image
                    source={item}
                    style={[styles.fullWidthImagePlaceholder, { width }]}
                    resizeMode="cover"
                  />
                </View>
              )}
              keyExtractor={(item, index) => index.toString()}
            />
            <View style={styles.pagination}>
              {featuredRoomsImages.map((_, index) => (
                <View
                  key={index}
                  style={[
                    styles.dot,
                    index === currentRoomIndex ? styles.activeDot : null,
                  ]}
                />
              ))}
            </View>
          </View>
        </View>

        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>Các dịch vụ nổi bật</Text>
          <View style={styles.carouselContainer}>
            <FlatList
              ref={serviceFlatListRef}
              data={featuredServicesImages}
              horizontal
              pagingEnabled
              showsHorizontalScrollIndicator={false}
              onScroll={onServiceScroll}
              getItemLayout={getItemLayout}
              snapToInterval={width}
              decelerationRate="fast"
              renderItem={({ item }) => (
                <View style={[styles.slide, { width }]}>
                  <Image
                    source={item}
                    style={[styles.fullWidthImagePlaceholder, { width }]}
                    resizeMode="cover"
                  />
                </View>
              )}
              keyExtractor={(item, index) => index.toString()}
            />
            <View style={styles.pagination}>
              {featuredServicesImages.map((_, index) => (
                <View
                  key={index}
                  style={[
                    styles.dot,
                    index === currentServiceIndex ? styles.activeDot : null,
                  ]}
                />
              ))}
            </View>
          </View>
        </View>
      </ScrollView>

      <View style={styles.tabBar}>
        <TouchableOpacity
          style={[styles.tabItem, styles.tabItemActive]}
          onPress={() => router.push("/home/trangchu")}
        >
          <Icon name="home-outline" size={24} color="#1E90FF" />
          <Text style={[styles.tabText, styles.tabTextActive]}>Trang chủ</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.tabItem}
          onPress={() => router.push('/home/huyphong')}
        >
          <Icon name="business-outline" size={24} color="#666" />
          <Text style={styles.tabText}>Phòng</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.tabItem}
          onPress={() => router.push("/profile/hoso")}
        >
          <Icon name="person-outline" size={24} color="#666" />
          <Text style={styles.tabText}>Hồ sơ</Text>
        </TouchableOpacity>
      </View>

      {/* Modal Thông tin */}
      <Modal
        visible={isInfoModalVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setIsInfoModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Thông tin</Text>
              {/* Nút dấu X ở góc phải */}
              <TouchableOpacity
                style={styles.closeIcon}
                onPress={() => setIsInfoModalVisible(false)}
              >
                <Icon name="close" size={24} color="#333" />
              </TouchableOpacity>
            </View>
            <ScrollView style={styles.modalContent}>
              <Text style={styles.modalSectionTitle}>
                1. Quyền và Trách nhiệm của Khách hàng
              </Text>
              <Text style={styles.modalText}>
                Được sử dụng hệ thống để tìm kiếm, đặt phòng khách sạn theo nhu
                cầu.
              </Text>
              <Text style={styles.modalText}>
                Cam kết thực hiện đúng các quy định về thanh toán, hủy phòng,
                thay đổi đặt phòng.
              </Text>
              <Text style={styles.modalText}>
                Không thực hiện các hành vi gian lận, lừa đảo, gây ảnh hưởng đến
                hệ thống hoặc khách sạn.
              </Text>
              <Text style={styles.modalText}>
                Không sử dụng hệ thống để đăng tải nội dung vi phạm pháp luật
                hoặc thuần phong mỹ tục.
              </Text>
              <Text style={styles.modalSectionTitle}>
                2. Thanh toán và Hủy phòng
              </Text>
              <Text style={styles.modalText}>
                Khách hàng có thể thanh toán trực tuyến hoặc tại khách sạn tùy
                theo chính sách đặt phòng.
              </Text>
              <Text style={styles.modalText}>
                Việc hủy phòng sẽ tuân theo chính sách hủy phòng của từng khách
                sạn.
              </Text>
              <Text style={styles.modalText}>
                Một số trường hợp hủy phòng có thể bị tính phí theo quy định của
                khách sạn.
              </Text>
              <Text style={styles.modalSectionTitle}>
                3. Giới hạn Trách nhiệm
              </Text>
              <Text style={styles.modalText}>
                Hệ thống chỉ là nền tảng trung gian kết nối khách hàng với khách
                sạn, không chịu trách nhiệm về chất lượng dịch vụ do khách sạn
                cung cấp.
              </Text>
              <Text style={styles.modalText}>
                Chúng tôi không chịu trách nhiệm về mất mát, thiệt hại phát sinh
                do lỗi của khách hàng hoặc khách sạn.
              </Text>
            </ScrollView>
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
  hotelInfoCard: {
    backgroundColor: "#fff",
    marginHorizontal: 10,
    marginVertical: 5,
    borderRadius: 10,
    padding: 15,
    alignItems: "center",
  },
  hotelName: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
    textAlign: "center",
  },
  locationContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 5,
  },
  locationText: {
    fontSize: 14,
    color: "#1E90FF",
    marginLeft: 5,
    textAlign: "center",
  },
  mainImageContainer: {
    position: "relative",
    marginHorizontal: 10,
    marginVertical: 5,
    height: 220,
  },
  carouselContainer: {
    position: "relative",
    height: 220,
  },
  slide: {
    justifyContent: "center",
    alignItems: "center",
  },
  mainImagePlaceholder: {
    height: 220,
    borderRadius: 10,
  },
  pagination: {
    flexDirection: "row",
    justifyContent: "center",
    position: "absolute",
    bottom: 10,
    width: "100%",
  },
  dot: {
    backgroundColor: "rgba(255,255,255,0.3)",
    width: 8,
    height: 8,
    borderRadius: 4,
    margin: 3,
  },
  activeDot: {
    backgroundColor: "#fff",
  },
  quickInfoContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginHorizontal: 10,
    marginVertical: 5,
  },
  quickInfoItem: {
    width: "48%",
    borderRadius: 10,
    padding: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  quickInfoText: {
    fontSize: 14,
    color: "#fff",
    marginLeft: 8,
    fontWeight: "500",
  },
  sectionContainer: {
    backgroundColor: "#fff",
    marginHorizontal: 10,
    marginVertical: 5,
    borderRadius: 10,
    padding: 15,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
    textAlign: "left",
    marginBottom: 10,
  },
  fullWidthImagePlaceholder: {
    height: 220,
    borderRadius: 10,
  },
  tabBar: {
    flexDirection: "row",
    justifyContent: "space-around",
    paddingVertical: 12,
    backgroundColor: "#fff",
    borderTopWidth: 1,
    borderTopColor: "#ddd",
  },
  tabItem: {
    alignItems: "center",
  },
  tabItemActive: {
    alignItems: "center",
    borderBottomWidth: 2,
    borderBottomColor: "#1E90FF",
  },
  tabText: {
    fontSize: 12,
    color: "#666",
    marginTop: 4,
  },
  tabTextActive: {
    color: "#1E90FF",
  },
  // Styles cho modal
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
    position: "relative", // Để định vị nút X ở góc phải
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
    textAlign: "center",
    flex: 1, // Đảm bảo tiêu đề ở giữa
  },
  closeIcon: {
    position: "absolute",
    right: 0, // Đặt nút X ở góc phải
    padding: 5,
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
  },
  // Xóa style của closeButton và closeButtonText vì không còn dùng
});
